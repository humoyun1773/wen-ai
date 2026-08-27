import asyncio
import re
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.ai.base import BaseAIProvider

class MockAIProvider(BaseAIProvider):
    """
    Built-in intelligent demo provider with 20-language support.
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
                "description": "Fast built-in local inference engine with 20-language multilingual reasoning.",
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

    def _detect_language(self, text: str) -> str:
        t = text.lower()

        # Cyrillic script detection
        has_cyrillic = bool(re.search(r'[\u0400-\u04FF]', text))
        if has_cyrillic:
            if any(w in t for w in ["салем", "қалай", "рахмет", "жақсы", "қайырлы", "сіз"]):
                return "kazakh"
            if any(w in t for w in ["кандай", "салам", "рахмат", "жакшы", "сиз"]):
                return "kyrgyz"
            if any(w in t for w in ["салом", "чӣ тавр", "ташаккур", "хуб", "шумо"]):
                return "tajik"
            if any(w in t for w in ["привіт", "дякую", "добрий", "будь ласка", "як справи"]):
                return "ukrainian"
            if any(w in t for w in ["салом", "кандай", "рахмат", "яхши", "нима"]):
                return "uzbek"
            return "russian"

        # Arabic script
        if bool(re.search(r'[\u0600-\u06FF]', text)):
            return "arabic"

        # CJK scripts
        if bool(re.search(r'[\u4E00-\u9FFF]', text)):
            return "chinese"
        if bool(re.search(r'[\u3040-\u309F\u30A0-\u30FF]', text)):
            return "japanese"
        if bool(re.search(r'[\uAC00-\uD7AF]', text)):
            return "korean"

        # Hindi (Devanagari)
        if bool(re.search(r'[\u0900-\u097F]', text)):
            return "hindi"

        # Latin-based languages
        if any(w in t for w in ["salom", "qanday", "rahmat", "yaxshi", "nima", "qanaqa", "yozib ber", "tushuntir", "kerak", "gaplash"]):
            return "uzbek"
        if any(w in t for w in ["merhaba", "nasilsin", "tesekkur", "nasil", "lutfen", "gunaydin", "iyi"]):
            return "turkish"
        if any(w in t for w in ["hallo", "guten tag", "wie geht", "danke", "bitte", "deutsch", "schreiben"]):
            return "german"
        if any(w in t for w in ["bonjour", "salut", "comment", "merci", "s'il vous", "francais"]):
            return "french"
        if any(w in t for w in ["hola", "como estas", "gracias", "por favor", "buenos dias", "espanol"]):
            return "spanish"
        if any(w in t for w in ["ciao", "come stai", "grazie", "per favore", "buongiorno", "italiano"]):
            return "italian"
        if any(w in t for w in ["ola", "como vai", "obrigado", "por favor", "bom dia", "portugues"]):
            return "portuguese"
        if any(w in t for w in ["czesc", "dziekuje", "prosze", "dzien dobry", "polski"]):
            return "polish"
        if any(w in t for w in ["salam", "nähili", "sag bol", "ertiriňiz haýyrly"]):
            return "turkmen"

        # Default to English
        return "english"

    def _generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        lang = self._detect_language(prompt)
        p_lower = prompt.lower()
        is_code = any(k in p_lower for k in ["kod", "code", "python", "javascript", "react", "fastapi", "function", "program"])

        if is_code:
            code_snippet = (
                "```python\n"
                "# WEN AI — Multilingual High Performance Clean Architecture\n"
                "from fastapi import FastAPI\n"
                "from pydantic import BaseModel\n\n"
                "app = FastAPI(title='WEN AI Multi-Engine')\n\n"
                "class PromptRequest(BaseModel):\n"
                "    message: str\n"
                "    language: str = 'auto'\n\n"
                "@app.post('/api/v1/generate')\n"
                "async def generate_response(req: PromptRequest):\n"
                "    return {'status': 'success', 'result': f'Processed [{req.language}]: {req.message}'}\n"
                "```"
            )
            if lang == "uzbek":
                return f"Albatta! Mana siz so'ragan dasturlash kodi namunasi:\n\n{code_snippet}\n\nUshbu kod yuqori unumdorlik, toza arxitektura va avtomatik validatsiyaga ega."
            elif lang == "russian":
                return f"Конечно! Вот пример чистого кода для вашей задачи:\n\n{code_snippet}\n\nЭтот код построен на асинхронной архитектуре FastAPI и строгой валидации Pydantic."
            elif lang == "turkish":
                return f"Elbette! İşte istediğiniz temiz kod örneği:\n\n{code_snippet}\n\nBu kod, modern ve yüksek performanslı temiz mimariye dayanmaktadır."
            elif lang == "german":
                return f"Natürlich! Hier ist das saubere Codebeispiel für Ihre Anfrage:\n\n{code_snippet}\n\nDieser Code basiert auf moderner asynchroner FastAPI-Architektur."
            elif lang == "french":
                return f"Bien sûr! Voici l'exemple de code propre pour votre demande:\n\n{code_snippet}\n\nCe code est basé sur une architecture FastAPI asynchrone moderne."
            elif lang == "spanish":
                return f"¡Por supuesto! Aquí tienes el ejemplo de código limpio para tu solicitud:\n\n{code_snippet}\n\nEste código utiliza una arquitectura moderna y asíncrona."
            elif lang == "arabic":
                return f"بالتأكيد! إليك نموذج الكود البرمجي النظيف والمبني بأعلى معايير الجودة:\n\n{code_snippet}"
            elif lang == "kazakh":
                return f"Әрине! Міне сіз сұраған таза код үлгісі:\n\n{code_snippet}\n\nБұл код заманауи және жоғары өнімді архитектураға негізделген."
            else:
                return f"Certainly! Here is the clean production-ready code example for your request:\n\n{code_snippet}\n\nThis code follows Clean Architecture principles with async performance."

        # Multilingual conversational replies
        if lang == "uzbek":
            return (
                f"Assalomu alaykum! Men **WEN AI** universal sun'iy intellekt assistentingizman.\n\n"
                f"Sizning savolingiz: *\"{prompt}\"*\n\n"
                "Sizga kod yozish, hujjatlarni tahlil qilish (RAG), matnlarni tarjima qilish yoki hisob-kitoblarda mamnuniyat bilan yordam beraman. Savolingizni davom ettirishingiz mumkin!"
            )
        elif lang == "russian":
            return (
                f"Здравствуйте! Я универсальный ИИ-ассистент **WEN AI**.\n\n"
                f"Ваш запрос: *\"{prompt}\"*\n\n"
                "Я готов помочь вам с написанием кода, анализом документов (PDF/DOCX), переводом текстов и решением любых интеллектуальных задач. Чем могу помочь?"
            )
        elif lang == "turkish":
            return (
                f"Merhaba! Ben **WEN AI** evrensel yapay zeka asistanınız.\n\n"
                f"Sorunuz: *\"{prompt}\"*\n\n"
                "Kodlama, doküman analizi, çeviri ve karmaşık hesaplamalarda size yardımcı olmaktan mutluluk duyarım. Nasıl yardımcı olabilirim?"
            )
        elif lang == "german":
            return (
                f"Guten Tag! Ich bin **WEN AI**, Ihr universeller KI-Assistent.\n\n"
                f"Ihre Frage: *\"{prompt}\"*\n\n"
                "Ich kann Ihnen bei der Programmierung, Dokumentenanalyse, Textübersetzung und komplexen Problemlösungen helfen. Wie kann ich Ihnen heute helfen?"
            )
        elif lang == "french":
            return (
                f"Bonjour! Je suis **WEN AI**, votre assistant d'intelligence artificielle universel.\n\n"
                f"Votre question: *\"{prompt}\"*\n\n"
                "Je peux vous aider pour le codage, l'analyse de documents, la traduction et la résolution de problèmes complexes. Comment puis-je vous aider aujourd'hui?"
            )
        elif lang == "spanish":
            return (
                f"¡Hola! Soy **WEN AI**, tu asistente universal de inteligencia artificial.\n\n"
                f"Tu consulta: *\"{prompt}\"*\n\n"
                "Puedo ayudarte con programación, análisis de documentos, traducción y cálculos avanzados. ¿En qué te puedo ayudar hoy?"
            )
        elif lang == "arabic":
            return (
                f"مرحبًا بك! أنا **WEN AI** مساعد الذكاء الاصطناعي الشامل الخاص بك.\n\n"
                f"سؤالك: *\"{prompt}\"*\n\n"
                "يمكنني مساعدتك في البرمجة، وتحليل المستندات، والترجمة، وحل المسائل المعقدة. كيف يمكنني خدمتك اليوم؟"
            )
        elif lang == "kazakh":
            return (
                f"Сәлеметсіз бе! Мен **WEN AI** әмбебап жасанды интеллект көмекшісімін.\n\n"
                f"Сіздің сұрағыңыз: *\"{prompt}\"*\n\n"
                "Бағдарламалау, құжаттарды талдау, мәтіндерді аудару және кез келген күрделі сұрақтар бойынша көмектесуге дайынмын."
            )
        elif lang == "kyrgyz":
            return (
                f"Саламатсызбы! Мен **WEN AI** универсалдуу жасалма интеллект жардамчыңызмын.\n\n"
                f"Сиздин сурооңуз: *\"{prompt}\"*\n\n"
                "Код жазуу, документтерди талдоо жана котормо боюнча сизге жардам берүүгө даярмын."
            )
        elif lang == "tajik":
            return (
                f"Салом! Ман ёвари зеҳни сунъии **WEN AI** ҳастам.\n\n"
                f"Саволи шумо: *\"{prompt}\"*\n\n"
                "Ман метавонам дар навиштани код, таҳлили ҳуҷҷатҳо ва тарҷумаи матнҳо ба шумо кӯмак расонам."
            )
        elif lang == "chinese":
            return (
                f"你好！我是 **WEN AI** 通用人工智能助手。\n\n"
                f"你的问题: *\"{prompt}\"*\n\n"
                "我可以帮助您编写代码、分析文档、翻译文本并解决各种复杂问题。今天我能为您做些什么？"
            )
        elif lang == "japanese":
            return (
                f"こんにちは！私は **WEN AI** ユニバーサルAIアシスタントです。\n\n"
                f"ご質問: *\"{prompt}\"*\n\n"
                "プログラミング、ドキュメント分析、翻訳、問題解決など、どのようなことでもお手伝いします。"
            )
        elif lang == "korean":
            return (
                f"안녕하세요! 저는 **WEN AI** 유니버설 인공지능 어시스턴트입니다.\n\n"
                f"질문: *\"{prompt}\"*\n\n"
                "코딩, 문서 분석, 번역 및 복잡한 문제 해결을 도와드릴 수 있습니다. 무엇을 도와드릴까요?"
            )
        elif lang == "hindi":
            return (
                f"नमस्ते! मैं आपका **WEN AI** यूनिवर्सल आर्टिफिशियल इंटेलिजेंस असिस्टेंट हूँ।\n\n"
                f"आपका प्रश्न: *\"{prompt}\"*\n\n"
                "मैं कोडिंग, दस्तावेज़ विश्लेषण, अनुवाद और जटिल गणनाओं में आपकी मदद कर सकता हूँ। आज मैं आपकी क्या मदद करूँ?"
            )
        elif lang == "ukrainian":
            return (
                f"Привіт! Я ваш універсальний ШІ-асистент **WEN AI**.\n\n"
                f"Ваше запитання: *\"{prompt}\"*\n\n"
                "Я можу допомогти вам із програмуванням, аналізом документів, перекладом та вирішенням складних завдань."
            )
        elif lang == "polish":
            return (
                f"Cześć! Jestem Twoim uniwersalnym asystentem **WEN AI**.\n\n"
                f"Twoje pytanie: *\"{prompt}\"*\n\n"
                "Mogę pomóc Ci w programowaniu, analizie dokumentów, tłumaczeniu i rozwiązywaniu złożonych problemów."
            )
        elif lang == "portuguese":
            return (
                f"Olá! Eu sou o **WEN AI**, seu assistente universal de inteligência artificial.\n\n"
                f"Sua pergunta: *\"{prompt}\"*\n\n"
                "Posso ajudar com programação, análise de documentos, tradução e resolução de problemas complexos."
            )
        elif lang == "italian":
            return (
                f"Ciao! Sono **WEN AI**, il tuo assistente universale di intelligenza artificiale.\n\n"
                f"La tua richiesta: *\"{prompt}\"*\n\n"
                "Posso aiutarti con programmazione, analisi di documenti, traduzione e calcoli complessi."
            )

        # Default Initial English Response
        return (
            f"Hello! I am **WEN AI**, your universal artificial intelligence assistant.\n\n"
            f"Your query: *\"{prompt}\"*\n\n"
            "I can assist you with:\n"
            "- ⚡ **Coding & Engineering**: Python, React, TypeScript, Rust, Clean Architecture;\n"
            "- 📄 **Document Intelligence (RAG)**: Deep analysis of PDF, DOCX, CSV files;\n"
            "- 🌐 **Multilingual Expertise**: Fluent communication across 20 languages;\n"
            "- 🧠 **Complex Reasoning & Calculations**.\n\n"
            "Feel free to ask in any language you prefer, and I will seamlessly respond in that language!"
        )
