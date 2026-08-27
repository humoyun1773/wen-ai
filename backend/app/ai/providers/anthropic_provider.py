import json
from typing import AsyncGenerator, List, Dict, Any, Optional
import httpx
from app.ai.base import BaseAIProvider
from app.core.config import settings
from app.core.exceptions import AIProviderException
from app.core.logging_config import logger

class AnthropicProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.base_url = "https://api.anthropic.com/v1"

    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def get_models(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "claude-3-5-sonnet-20240620",
                "name": "Claude 3.5 Sonnet (Anthropic)",
                "provider": "Anthropic",
                "context_window": 200000,
                "description": "Anthropic's state-of-the-art model for complex reasoning and coding.",
                "is_available": self.is_available()
            }
        ]

    def _prepare_payload(self, messages: List[Dict[str, str]], model: str, temperature: float, max_tokens: Optional[int], system_prompt: Optional[str], stream: bool) -> Dict[str, Any]:
        formatted_messages = [
            {"role": "user" if m["role"] == "user" else "assistant", "content": m["content"]}
            for m in messages if m["role"] in ["user", "assistant"]
        ]
        payload: Dict[str, Any] = {
            "model": model,
            "messages": formatted_messages,
            "max_tokens": max_tokens or 4096,
            "temperature": temperature,
            "stream": stream
        }
        if system_prompt:
            payload["system"] = system_prompt
        return payload

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "claude-3-5-sonnet-20240620",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.is_available():
            raise AIProviderException("Anthropic API Key is not configured.")

        payload = self._prepare_payload(messages, model, temperature, max_tokens, system_prompt, stream=False)
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/messages", json=payload, headers=headers)
            if resp.status_code != 200:
                logger.error(f"Anthropic error {resp.status_code}: {resp.text}")
                raise AIProviderException(f"Anthropic API Error: {resp.text}")

            data = resp.json()
            content = "".join([block["text"] for block in data.get("content", []) if block.get("type") == "text"])
            usage = data.get("usage", {})
            return {
                "content": content,
                "input_tokens": usage.get("input_tokens", 0),
                "output_tokens": usage.get("output_tokens", 0),
                "model": model
            }

    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: str = "claude-3-5-sonnet-20240620",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            raise AIProviderException("Anthropic API Key is not configured.")

        payload = self._prepare_payload(messages, model, temperature, max_tokens, system_prompt, stream=True)
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            async with client.stream("POST", f"{self.base_url}/messages", json=payload, headers=headers) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise AIProviderException(f"Anthropic Stream Error: {error_text.decode('utf-8')}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        try:
                            chunk = json.loads(data_str)
                            if chunk.get("type") == "content_block_delta":
                                delta = chunk.get("delta", {})
                                if delta.get("type") == "text_delta":
                                    yield delta.get("text", "")
                        except Exception:
                            continue
