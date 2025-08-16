from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Bitcorp ERP"
    
    # Database Settings
    DATABASE_URL: str = "postgresql://bitcorp:password@localhost:5433/bitcorp_erp"
    
    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security Settings
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Settings - Hardcoded for development to avoid env parsing issues
    # These fields will not be overridden by environment variables
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_ALLOW_HEADERS: List[str] = [
        "*",
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Cache-Control",
        "Pragma",
        "Expires"
    ]
    
    # Allowed hosts - using simple defaults
    FRONTEND_URL: str = "http://localhost:3000"
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIRECTORY: str = "uploads"
    
    # Development Settings
    DEBUG: bool = False
    
    class Config:
        # Temporarily disable env file loading to avoid parsing issues
        env_file = None
        env_file_encoding = 'utf-8'


# Try to initialize settings with proper error handling
settings = Settings()
# Override problematic fields manually
settings.CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
settings.CORS_ALLOW_HEADERS = ["*", "Authorization", "Content-Type", "X-Requested-With", "Origin"]
print("✅ Settings initialized with manual CORS overrides")
