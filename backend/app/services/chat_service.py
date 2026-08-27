import json
from typing import AsyncGenerator, List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import ConversationCreate
from app.schemas.message import MessageCreate, ChatStreamRequest
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.file_repository import FileRepository
from app.repositories.usage_repository import UsageRepository
from app.ai.registry import ai_registry
from app.services.rag_service import rag_service
from app.core.exceptions import EntityNotFoundException

class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.conv_repo = ConversationRepository(db)
        self.msg_repo = MessageRepository(db)
        self.file_repo = FileRepository(db)
        self.usage_repo = UsageRepository(db)

    async def stream_chat(
        self,
        user: User,
        request: ChatStreamRequest
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat response via Server-Sent Events (SSE).
        Yields JSON formatted SSE events:
        event: start -> {conversation_id, model}
        event: delta -> {content}
        event: end -> {message_id, total_tokens}
        event: error -> {detail}
        """
        # 1. Get or create conversation
        if request.conversation_id:
            conv = await self.conv_repo.get_by_id(request.conversation_id, user.id)
            if not conv:
                yield f"event: error\ndata: {json.dumps({'error': 'Conversation not found'})}\n\n"
                return
        else:
            # Generate initial title from first 6 words of message
            words = request.message.strip().split()
            title = " ".join(words[:6]) if words else "New Chat"
            if len(title) > 40:
                title = title[:40] + "..."
            
            model_to_use = request.model or user.default_model or "gpt-4o-mini"
            conv_in = ConversationCreate(
                title=title,
                model=model_to_use,
                system_prompt=request.system_prompt
            )
            conv = await self.conv_repo.create(user.id, conv_in)

        # Update model if provided
        selected_model = request.model or conv.model or "gpt-4o-mini"
        if selected_model != conv.model:
            conv.model = selected_model
            await self.db.commit()

        # 2. Save User Message
        user_msg = await self.msg_repo.create(
            MessageCreate(
                conversation_id=conv.id,
                role="user",
                content=request.message,
                metadata_json=json.dumps({"attached_file_ids": request.attached_file_ids}) if request.attached_file_ids else None
            ),
            tokens=len(request.message) // 4
        )

        # 3. Load historical messages for context
        history = await self.msg_repo.list_by_conversation(conv.id)
        
        # 4. Handle attached files & RAG context injection
        rag_context = ""
        if request.attached_file_ids:
            for file_id in request.attached_file_ids:
                file_obj = await self.file_repo.get_by_id(file_id, user.id)
                if file_obj and file_obj.extracted_text:
                    chunks = rag_service.chunk_text(file_obj.extracted_text)
                    relevant = rag_service.search_relevant_chunks(request.message, chunks, top_k=2)
                    if relevant:
                        rag_context += f"\n\n[Context from attached file '{file_obj.file_name}']:\n"
                        for r in relevant:
                            rag_context += f"---\n{r['chunk']}\n"

        # 5. Build messages array for LLM
        llm_messages = []
        for h in history[:-1]:  # all except current user msg
            llm_messages.append({"role": h.role, "content": h.content})

        current_prompt = request.message
        if rag_context:
            current_prompt += f"\n\n[DOCUMENT KNOWLEDGE BASE CONTEXT]:\n{rag_context}\nPlease answer using the above context when relevant."
        
        llm_messages.append({"role": "user", "content": current_prompt})

        # 6. Resolve AI Provider
        provider = ai_registry.get_provider_for_model(selected_model)
        system_instruction = request.system_prompt or conv.system_prompt or "You are WEN AI, an intelligent, helpful, and concise AI assistant."

        # Send 'start' event
        yield f"event: start\ndata: {json.dumps({'conversation_id': conv.id, 'model': selected_model})}\n\n"

        full_assistant_reply = ""
        try:
            async for token in provider.stream(
                messages=llm_messages,
                model=selected_model,
                temperature=request.temperature or float(user.temperature or 0.7),
                system_prompt=system_instruction
            ):
                full_assistant_reply += token
                yield f"event: delta\ndata: {json.dumps({'content': token})}\n\n"

            # 7. Save Assistant Message in database
            out_tokens = max(1, len(full_assistant_reply) // 4)
            in_tokens = max(1, len(str(llm_messages)) // 4)

            assistant_msg = await self.msg_repo.create(
                MessageCreate(
                    conversation_id=conv.id,
                    role="assistant",
                    content=full_assistant_reply
                ),
                tokens=out_tokens
            )

            # Log token usage
            await self.usage_repo.log_usage(
                user_id=user.id,
                model=selected_model,
                input_tokens=in_tokens,
                output_tokens=out_tokens
            )

            # Send 'end' event
            yield f"event: end\ndata: {json.dumps({'message_id': assistant_msg.id, 'conversation_id': conv.id, 'tokens': out_tokens})}\n\n"

        except Exception as e:
            err_msg = str(e)
            yield f"event: error\ndata: {json.dumps({'error': err_msg})}\n\n"
