from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Customizable Inventory Management System"
    app_version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"

    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    database_url: str = "sqlite:///./inventory.db"

    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    jwt_refresh_expiration_days: int = 7

    cors_origins: str = "http://localhost:3000"

    default_admin_email: str = "admin@example.com"
    default_admin_password: str = "Admin@123456"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
