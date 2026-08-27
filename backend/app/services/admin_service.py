from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.file_repository import FileRepository
from app.repositories.usage_repository import UsageRepository
from app.ai.registry import ai_registry
from app.schemas.admin import AdminStatsResponse, ProviderStatus

class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.conv_repo = ConversationRepository(db)
        self.msg_repo = MessageRepository(db)
        self.file_repo = FileRepository(db)
        self.usage_repo = UsageRepository(db)

    async def get_dashboard_stats(self) -> AdminStatsResponse:
        total_users = await self.user_repo.count_all()
        active_users = await self.user_repo.count_active()
        total_convs = await self.conv_repo.count_all()
        total_msgs = await self.msg_repo.count_all()
        total_files = await self.file_repo.count_all()
        total_tokens = await self.usage_repo.total_tokens_used()
        total_reqs = await self.usage_repo.total_requests()

        return AdminStatsResponse(
            total_users=total_users,
            active_users=active_users,
            total_conversations=total_convs,
            total_messages=total_msgs,
            total_files=total_files,
            total_tokens_used=total_tokens,
            total_requests=total_reqs
        )

    def get_providers_health(self) -> List[ProviderStatus]:
        return ai_registry.get_provider_statuses()
