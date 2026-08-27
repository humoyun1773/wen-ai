from typing import Dict, List, Any, Optional
from app.ai.base import BaseAIProvider
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.anthropic_provider import AnthropicProvider
from app.ai.providers.ollama_provider import OllamaProvider
from app.ai.providers.mock_provider import MockAIProvider
from app.schemas.admin import ProviderStatus, ModelInfo
from app.core.config import settings

class AIProviderRegistry:
    def __init__(self):
        self.openai = OpenAIProvider()
        self.gemini = GeminiProvider()
        self.anthropic = AnthropicProvider()
        self.ollama = OllamaProvider()
        self.mock = MockAIProvider()

    def get_provider_for_model(self, model: str) -> BaseAIProvider:
        """Resolve the right AI provider for a model ID, with automatic fallback."""
        m = model.lower()
        if "gpt" in m or "openai" in m:
            if self.openai.is_available():
                return self.openai
        elif "gemini" in m:
            if self.gemini.is_available():
                return self.gemini
        elif "claude" in m or "anthropic" in m:
            if self.anthropic.is_available():
                return self.anthropic
        elif "llama" in m or "ollama" in m:
            return self.ollama

        # If chosen provider is not configured or mock model requested, fallback to Mock Provider
        return self.mock

    def get_all_models(self) -> List[ModelInfo]:
        """Aggregate available models from all providers."""
        all_models: List[ModelInfo] = []
        providers: List[BaseAIProvider] = [
            self.mock,
            self.openai,
            self.gemini,
            self.anthropic,
            self.ollama
        ]

        for p in providers:
            for m in p.get_models():
                all_models.append(ModelInfo(**m))
        return all_models

    def get_provider_statuses(self) -> List[ProviderStatus]:
        """Get diagnostic status of each configured provider for Admin panel."""
        def mask_key(k: Optional[str]) -> Optional[str]:
            if not k:
                return None
            if len(k) < 8:
                return "********"
            return f"{k[:4]}...{k[-4:]}"

        return [
            ProviderStatus(
                provider_name="OpenAI",
                is_configured=self.openai.is_available(),
                masked_key=mask_key(settings.OPENAI_API_KEY),
                default_model="gpt-4o-mini",
                available_models=["gpt-4o", "gpt-4o-mini"],
                status="active" if self.openai.is_available() else "no_api_key"
            ),
            ProviderStatus(
                provider_name="Google Gemini",
                is_configured=self.gemini.is_available(),
                masked_key=mask_key(settings.GEMINI_API_KEY),
                default_model="gemini-1.5-flash",
                available_models=["gemini-1.5-pro", "gemini-1.5-flash"],
                status="active" if self.gemini.is_available() else "no_api_key"
            ),
            ProviderStatus(
                provider_name="Anthropic Claude",
                is_configured=self.anthropic.is_available(),
                masked_key=mask_key(settings.ANTHROPIC_API_KEY),
                default_model="claude-3-5-sonnet-20240620",
                available_models=["claude-3-5-sonnet-20240620"],
                status="active" if self.anthropic.is_available() else "no_api_key"
            ),
            ProviderStatus(
                provider_name="Ollama (Local LLM)",
                is_configured=True,
                masked_key="Local / No Key",
                default_model="llama3:latest",
                available_models=["llama3:latest"],
                status="active"
            ),
            ProviderStatus(
                provider_name="WEN Core Engine",
                is_configured=True,
                masked_key="Built-in Zero Config",
                default_model="wen-core-default",
                available_models=["wen-core-default"],
                status="active"
            )
        ]

ai_registry = AIProviderRegistry()
