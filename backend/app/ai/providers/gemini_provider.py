import json
from typing import AsyncGenerator, List, Dict, Any, Optional
import httpx
from app.ai.base import BaseAIProvider
from app.core.config import settings
from app.core.exceptions import AIProviderException
from app.core.logging_config import logger

class GeminiProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def get_models(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "gemini-1.5-pro",
                "name": "Gemini 1.5 Pro (Google)",
                "provider": "Google",
                "context_window": 1000000,
                "description": "Google's high-capacity multimodal model with a 1M token context window.",
                "is_available": self.is_available()
            },
            {
                "id": "gemini-1.5-flash",
                "name": "Gemini 1.5 Flash (Google)",
                "provider": "Google",
                "context_window": 1000000,
                "description": "Ultra-fast, lightweight model optimized for high-frequency tasks.",
                "is_available": self.is_available()
            }
        ]

    def _convert_messages(self, messages: List[Dict[str, str]], system_prompt: Optional[str] = None) -> Dict[str, Any]:
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        payload: Dict[str, Any] = {"contents": contents}
        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }
        return payload

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gemini-1.5-flash",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.is_available():
            raise AIProviderException("Gemini API Key is not configured.")

        gemini_model = "gemini-1.5-flash" if "flash" in model.lower() else "gemini-1.5-pro"
        payload = self._convert_messages(messages, system_prompt)
        url = f"{self.base_url}/{gemini_model}:generateContent?key={self.api_key}"

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini error {resp.status_code}: {resp.text}")
                raise AIProviderException(f"Gemini API Error: {resp.text}")

            data = resp.json()
            candidates = data.get("candidates", [])
            text = candidates[0]["content"]["parts"][0]["text"] if candidates else ""
            usage = data.get("usageMetadata", {})
            return {
                "content": text,
                "input_tokens": usage.get("promptTokenCount", 0),
                "output_tokens": usage.get("candidatesTokenCount", 0),
                "model": model
            }

    async def stream(
        self,
        messages: List[Dict[str, str]],
        model: str = "gemini-1.5-flash",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        if not self.is_available():
            raise AIProviderException("Gemini API Key is not configured.")

        gemini_model = "gemini-1.5-flash" if "flash" in model.lower() else "gemini-1.5-pro"
        payload = self._convert_messages(messages, system_prompt)
        url = f"{self.base_url}/{gemini_model}:streamGenerateContent?alt=sse&key={self.api_key}"

        async with httpx.AsyncClient(timeout=90.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise AIProviderException(f"Gemini Stream Error: {error_text.decode('utf-8')}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        try:
                            chunk = json.loads(data_str)
                            candidates = chunk.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                parts = candidates[0]["content"].get("parts", [])
                                for part in parts:
                                    if "text" in part:
                                        yield part["text"]
                        except Exception:
                            continue
