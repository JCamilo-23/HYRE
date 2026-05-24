"""Application-specific exceptions."""


class RateLimitExceeded(Exception):
    """WebSocket or API rate limit hit."""

    def __init__(self, message: str = "Rate limit exceeded") -> None:
        super().__init__(message)
