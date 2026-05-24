from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_ENV: str = "development"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # CORS — frontend local + produccion
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Google Gemini (simulador laboral, copilot, visión, interview engine)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_PRO_MODEL: str = "gemini-2.0-flash"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Resend
    RESEND_API_KEY: str = ""

    # Redis / Celery (AI Interview Engine)
    REDIS_URL: str = ""
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    USE_CELERY: bool = False

    # Interview engine tuning
    INTERVIEW_TARGET_LATENCY_MS: int = 500
    FACIAL_FRAME_STRIDE: int = 3
    REQUIRE_GEMINI: bool = True


settings = Settings()
