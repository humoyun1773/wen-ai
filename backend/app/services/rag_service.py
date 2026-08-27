from typing import List, Dict, Any, Optional
import math
import re

class RAGService:
    """
    RAG (Retrieval-Augmented Generation) Service.
    Handles semantic chunking, keyword/similarity scoring, and context enrichment.
    """

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split document text into overlapping chunks."""
        if not text:
            return []
        
        # Split by paragraphs or sentences
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks: List[str] = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) <= chunk_size:
                current_chunk += ("\n\n" + para if current_chunk else para)
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)
        
        # If no paragraphs, split by character chunks
        if not chunks:
            words = text.split(" ")
            curr = []
            curr_len = 0
            for w in words:
                curr.append(w)
                curr_len += len(w) + 1
                if curr_len >= chunk_size:
                    chunks.append(" ".join(curr))
                    curr = []
                    curr_len = 0
            if curr:
                chunks.append(" ".join(curr))

        return chunks

    @staticmethod
    def search_relevant_chunks(query: str, chunks: List[str], top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve most relevant chunks using BM25-like token overlap scoring."""
        if not chunks or not query:
            return []

        query_tokens = set(re.findall(r'\w+', query.lower()))
        if not query_tokens:
            return [{"chunk": c, "score": 0.5} for c in chunks[:top_k]]

        scored_chunks = []
        for c in chunks:
            chunk_tokens = re.findall(r'\w+', c.lower())
            if not chunk_tokens:
                continue
            
            # Simple TF match
            matches = sum(1 for t in chunk_tokens if t in query_tokens)
            score = matches / (len(chunk_tokens) ** 0.5 + 1.0)
            
            if matches > 0:
                scored_chunks.append({"chunk": c, "score": score})

        # Sort by relevance
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        if not scored_chunks:
            # Fallback to first chunks if no exact keyword match
            return [{"chunk": c, "score": 0.1} for c in chunks[:top_k]]

        return scored_chunks[:top_k]

rag_service = RAGService()
