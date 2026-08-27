import json
from typing import AsyncGenerator, List, Dict, Any, Optional
import httpx
from app.ai.base import BaseAIProvider
from app.core.config import settings
from app.core.exceptions import AIProviderException
from app.core.logging_config import logger

class OpenAIProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL.rstrip("/")

    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def get_models(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "gpt-4o",
                "name": "GPT-4o (OpenAI)",
                "provider": "OpenAI",
                "context_window": 128000,
                "description": "Most intelligent multimodal flagship model from OpenAI.",
                "is_available": self.is_available()
            },
            {
                "id": "gpt-4o-mini",
                "name": "GPT-4o Mini (OpenAI)",
                "provider": "OpenAI",
                "context_window": 128000,
                "description": "Fast and affordable model for everyday reasoning and coding.",
                "is_available": self.is_available()
            }
        ]

    def _prepare_payload(self, messages: List[Dict[str, str]], model: str, temperature: float, max_tokens: Optional[int], system_prompt: Optional[str], stream: bool) -> Dict[str, Any]:
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        payload: Dict[str, Any] = {
            "model": model,
            "messages": formatted_messages,
            "temperature": temperature,
            "stream": stream
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens
        return payload

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.is_available():
            raise AIProviderException("OpenAI API Key is not configured.")

        payload = self._prepare_payload(messages, model, temperature, max_tokens, system_prompt, stream=False)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", json=payload, headers=headers)
            if resp.status_code != 200:
                logger.error(f"OpenAI error {resp.status_code}: {resp.text}")
                raise AIProviderException(f"OpenAI API Error: {resp.text}")
            
            data = resp.json()
            choice = data["choices"][0]["message"]
            usage = data.get("usage", {})
            return {
                "content": choice["content"],
                "input_tokens": usage.get("prompt_tokens", 0),
                "output_tokens": usage.get("completion_tokens", 0),
                "model": model
            }

    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            raise AIProviderException("OpenAI API Key is not configured.")

        payload = self._prepare_payload(messages, model, temperature, max_tokens, system_prompt, stream=True)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            async with client.stream("POST", f"{self.base_url}/chat/completions", json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise AIProviderException(f"OpenAI Stream Error: {error_text.decode('utf-8')}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk["choices"][0].get("delta", {})
                            content = delta.get("content")
                            if content:
                                yield content
                        except Exception:
                            continue
