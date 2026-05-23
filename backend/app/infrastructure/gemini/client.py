import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

def get_text_model():
    return genai.GenerativeModel("gemini-1.5-flash")

def get_vision_model():
    return genai.GenerativeModel("gemini-1.5-flash")
