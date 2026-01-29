from google import genai
from google.genai import types
from functools import lru_cache

from app.config import get_settings


@lru_cache()
def get_gemini_client():
    """Get Gemini client instance (singleton)."""
    settings = get_settings()
    client = genai.Client(api_key=settings.gemini_api_key)
    return client


def get_generation_config():
    """Get generation configuration."""
    return types.GenerateContentConfig(
        temperature=0.7,
        top_p=0.95,
        top_k=40,
        max_output_tokens=1024,
    )


async def generate_insight(prompt: str) -> str:
    """Generate insight using Gemini API."""
    client = get_gemini_client()

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=get_generation_config(),
        )
        return response.text
    except Exception as e:
        raise Exception(f"Failed to generate insight: {str(e)}")


async def chat_with_ai(messages: list[dict], user_context: str) -> str:
    """Chat with AI about finances."""
    client = get_gemini_client()

    system_prompt = f"""You are a helpful financial advisor assistant.
    You help users understand their spending patterns and provide personalized advice.

    User's financial context:
    {user_context}

    Be concise, friendly, and provide actionable advice.
    Focus on practical tips that can help the user improve their financial health.
    """

    # Build conversation contents
    contents = [
        types.Content(
            role="user",
            parts=[types.Part(text=system_prompt)]
        ),
        types.Content(
            role="model",
            parts=[types.Part(text="I understand. I'll help you with personalized financial advice based on your spending data.")]
        ),
    ]

    # Process previous messages
    for msg in messages[:-1]:
        role = "user" if msg["role"] == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part(text=msg["content"])]
            )
        )

    # Add the latest user message
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part(text=messages[-1]["content"])]
        )
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=get_generation_config(),
        )
        return response.text
    except Exception as e:
        raise Exception(f"Failed to get chat response: {str(e)}")
