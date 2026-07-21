from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()


def _get_gemini():
    return ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite",
        google_api_key=settings.gemini_api_key,
        temperature=0.3,
    )


def _get_ollama():
    from langchain_ollama import ChatOllama
    return ChatOllama(base_url=settings.ollama_base_url, model="llama3", temperature=0.3)

def _extract_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and "text" in block:
                parts.append(block["text"])
            elif isinstance(block, str):
                parts.append(block)
        return "".join(parts)
    return str(content)


def generate_response(system_prompt: str, user_prompt: str) -> str:
    messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]

    if settings.default_llm_provider == "gemini" and settings.gemini_api_key:
        try:
            llm = _get_gemini()
            result = llm.invoke(messages)
            return _extract_text(result.content)
        except Exception as e:
            logger.warning("Gemini call failed, falling back to Ollama: %s", e)

    try:
        llm = _get_ollama()
        result = llm.invoke(messages)
        return _extract_text(result.content)
    except Exception as e:
        logger.error("Ollama fallback also failed: %s", e)
        return (
            "I couldn't reach an AI provider right now. "
            "Check that GEMINI_API_KEY is set, or that Ollama is running locally."
        )