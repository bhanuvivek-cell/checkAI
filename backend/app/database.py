from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Engine configuration (works with SQLite aiosqlite and PostgreSQL asyncpg)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """Dependency for providing database session to FastAPI routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initialize database tables and safely migrate missing columns in SQLite."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Safe column migration for SQLite
        try:
            result = await conn.execute(text("PRAGMA table_info(analysis_records);"))
            columns = [row[1] for row in result.fetchall()]
            
            new_cols = {
                "counterarguments": "JSON DEFAULT '[]'",
                "evidence_verification": "JSON DEFAULT '{}'",
                "calibrated_alternative": "TEXT",
                "engine_used": "VARCHAR(50) DEFAULT 'heuristic_fallback'",
                "api_status": "VARCHAR(50)",
                "api_error_message": "TEXT"
            }
            
            for col_name, col_type in new_cols.items():
                if col_name not in columns:
                    await conn.execute(text(f"ALTER TABLE analysis_records ADD COLUMN {col_name} {col_type};"))
                    logger.info(f"Added missing column '{col_name}' to analysis_records")
        except Exception as e:
            # If not SQLite or table didn't exist yet, ignore
            logger.debug(f"Column check notice: {e}")
