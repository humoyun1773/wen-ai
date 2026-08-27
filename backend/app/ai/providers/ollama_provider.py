import json
from typing import AsyncGenerator, List, Dict, Any, Optional
import httpx
from app.ai.base import BaseAIProvider
from app.core.config import settings
from app.core.exceptions import AIProviderException

class OllamaProvider(BaseAIProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")

    def is_available(self) -> bool:
        return bool(self.base_url)

    def get_models(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "llama3:latest",
                "name": "Llama 3 (Local Ollama)",
                "provider": "Ollama",
                "context_window": 8192,
                "description": "Locally running open-weights model via Ollama.",
                "is_available": True
            }
        ]

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3:latest",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        formatted = []
        if system_prompt:
            formatted.append({"role": "system", "content": system_prompt})
        formatted.extend(messages)

        payload = {
            "model": model,
            "messages": formatted,
            "stream": False,
            "options": {"temperature": temperature}
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload)
                if resp.status_code != 200:
                    raise AIProviderException(f"Ollama Error: {resp.text}")
                data = resp.json()
                return {
                    "content": data["message"]["content"],
                    "input_tokens": data.get("prompt_eval_count", 0),
                    "output_tokens": data.get("eval_count", 0),
                    "model": model
                }
            except httpx.ConnectError:
                raise AIProviderException("Could not connect to local Ollama instance.")

    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama3:latest",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        formatted = []
        if system_prompt:
            formatted.append({"role": "system", "content": system_prompt})
        formatted.extend(messages)

        payload = {
            "model": model,
            "messages": formatted,
            "stream": True,
            "options": {"temperature": temperature}
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                    if response.status_code != 200:
                        raise AIProviderException("Ollama Stream Error")
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            chunk = json.loads(line)
                            content = chunk.get("message", {}).get("content", "")
                            if content:
                                yield content
                        except Exception:
                            continue
            except httpx.ConnectError:
                raise AIProviderException("Could not connect to local Ollama instance.")
