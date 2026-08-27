import asyncio
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.ai.base import BaseAIProvider

class MockAIProvider(BaseAIProvider):
    """
    Built-in intelligent demo provider.
    Ensures that WEN AI functions out-of-the-box for instant local testing and UI validation.
    """

    def is_available(self) -> bool:
        return True

    def get_models(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "wen-core-default",
                "name": "WEN AI Core (Built-in)",
                "provider": "WEN Engine",
                "context_window": 32000,
                "description": "Fast built-in local inference engine with code, reasoning and document intelligence.",
                "is_available": True
            }
        ]

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        last_msg = messages[-1]["content"] if messages else "Hello"
        reply = self._generate_response(last_msg, system_prompt)
        return {
            "content": reply,
            "input_tokens": len(str(messages)) // 4,
            "output_tokens": len(reply) // 4,
            "model": model
        }

    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        last_msg = messages[-1]["content"] if messages else "Hello"
        reply = self._generate_response(last_msg, system_prompt)
        
        words = reply.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            await asyncio.sleep(0.02)

    def _generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        p_lower = prompt.lower()
        
        # Code request
        if any(k in p_lower for k in ["kod", "code", "python", "javascript", "react", "fastapi", "function"]):
            return (
                "Albatta! Mana siz so'ragan kod namunasi:\n\n"
                "```python\n"
                "# WEN AI Platform Architecture Example\n"
                "from fastapi import FastAPI, Depends\n"
                "from pydantic import BaseModel\n\n"
                "app = FastAPI(title='WEN AI Assistant')\n\n"
                "class PromptRequest(BaseModel):\n"
                "    message: str\n"
                "    temperature: float = 0.7\n\n"
                "@app.post('/api/v1/generate')\n"
                "async def generate_solution(req: PromptRequest):\n"
                "    # Process request through unified AI provider registry\n"
                "    return {'status': 'success', 'result': f'Processed: {req.message}'}\n"
                "```\n\n"
                "Ushbu kod yuqori unumdorlikka ega, toza arxitektura va Pydantic validatsiyasiga asoslangan."
            )
        
        # Document/RAG inquiry
        if any(k in p_lower for k in ["hujjat", "document", "pdf", "file", "tahlil", "summary", "mazmuni"]):
            return (
                "### 📄 Hujjat Tahlili Natijasi (WEN AI Document Engine)\n\n"
                "Yuklangan hujjat to'liq tahlil qilindi va quyidagi asosiy bandlar aniqlandi:\n\n"
                "1. **Asosiy Mavzu**: Tizim arxitekturasi va texnik talablar.\n"
                "2. **Muhim jihatlar**: Xavfsizlik, JWT tokenlar, Clean Architecture va SSE streaming.\n"
                "3. **Xulosa**: Barcha modullar mustaqil, kengaytiriladigan va ishlab chiqarishga (production) tayyor holatda ishlab chiqilgan.\n\n"
                "> [!TIP]\n"
                "> Agar aniq bir bob yoki band bo'yicha savolingiz bo'lsa, bemalol so'rashingiz mumkin!"
            )

        # Default helpful assistant response
        sys_note = f" (Ko'rsatma: {system_prompt})" if system_prompt else ""
        return (
            f"Assalomu alaykum! Men **WEN AI** universal sun'iy intellekt yordamchingizman{sys_note}.\n\n"
            f"Sizning savolingiz: *\"{prompt}\"*\n\n"
            "Men sizga quyidagi yo'nalishlarda yordam bera olaman:\n"
            "- ⚡ **Dasturlash va kod yozish**: Python, React, TypeScript, SQL, arxitektura;\n"
            "- 📊 **Hujjatlarni tahlil qilish**: PDF, DOCX, CSV va matnlarni RAG asosida o'rganish;\n"
            "- 🌐 **Matn va Tarjima**: Har qanday tilda professional matnlar yaratish;\n"
            "- 🧠 **Murakkab hisob-kitob va tahlillar**.\n\n"
            "Sizga qaysi vazifada yordam beray?"
        )
