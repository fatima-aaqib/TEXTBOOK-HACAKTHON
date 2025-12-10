"""
Google Cloud Translation API client
T014: Setup Google Cloud Translation API for Urdu translation
"""
from google.cloud import translate_v2 as translate
from functools import lru_cache
from app.config import get_settings
from typing import List, Dict
import hashlib
import json


@lru_cache()
def get_translation_client() -> translate.Client:
    """
    Get cached Google Cloud Translation client

    Returns:
        translate.Client: Google Cloud Translation API client
    """
    settings = get_settings()
    # Create client with API key (for serverless environments)
    return translate.Client(api_key=settings.GOOGLE_CLOUD_API_KEY)


def generate_cache_key(text: str, target_lang: str) -> str:
    """
    Generate SHA-256 cache key for translation

    Args:
        text: Source text
        target_lang: Target language code

    Returns:
        Hex digest of cache key
    """
    content = f"{text}|{target_lang}"
    return hashlib.sha256(content.encode()).hexdigest()


async def translate_text(
    text: str,
    target_language: str = "ur",
    source_language: str = "en",
    preserve_code: bool = True
) -> Dict[str, str]:
    """
    Translate text to target language using Google Cloud Translation

    Args:
        text: Text to translate
        target_language: Target language code (default: ur for Urdu)
        source_language: Source language code (default: en for English)
        preserve_code: Whether to preserve code blocks (default: True)

    Returns:
        Dict with 'translated_text' and 'cache_key'
    """
    client = get_translation_client()

    # Generate cache key
    cache_key = generate_cache_key(text, target_language)

    # For now, perform translation directly
    # TODO: Check translation_cache table before translating
    result = client.translate(
        text,
        target_language=target_language,
        source_language=source_language,
        format_="text"
    )

    return {
        "translated_text": result["translatedText"],
        "cache_key": cache_key,
        "detected_source_language": result.get("detectedSourceLanguage", source_language)
    }


async def translate_batch(
    texts: List[str],
    target_language: str = "ur",
    source_language: str = "en"
) -> List[Dict[str, str]]:
    """
    Translate multiple texts in batch

    Args:
        texts: List of texts to translate
        target_language: Target language code
        source_language: Source language code

    Returns:
        List of translation results
    """
    client = get_translation_client()

    results = client.translate(
        texts,
        target_language=target_language,
        source_language=source_language,
        format_="text"
    )

    return [
        {
            "translated_text": result["translatedText"],
            "cache_key": generate_cache_key(texts[i], target_language),
            "detected_source_language": result.get("detectedSourceLanguage", source_language)
        }
        for i, result in enumerate(results)
    ]
