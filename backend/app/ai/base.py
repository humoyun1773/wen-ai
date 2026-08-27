from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict, Any, Optional

class BaseAIProvider(ABC):
    """Abstract Base Class for all AI LLM Providers in WEN AI."""

    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider has required credentials or connection."""
        pass

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a complete chat response."""
        pass

    @abstractmethod
    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chunks of text response asynchronously."""
        pass

    @abstractmethod
    def get_models(self) -> List[Dict[str, Any]]:
        """Return list of models supported by this provider."""
        pass
