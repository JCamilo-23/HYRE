from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    PORT: int = 8000

    # CORS — frontend local + produccion
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # OpenAI
    OPENAI_API_KEY: str

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str

    # Resend
    RESEND_API_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
