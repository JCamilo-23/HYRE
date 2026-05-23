import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY
