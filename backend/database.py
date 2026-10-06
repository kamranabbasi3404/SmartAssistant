import os
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)

DB_PATH = os.path.join(DATA_DIR, "smart_assistant.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Verified User")
    avatar = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True, index=True)
    failed_attempts = Column(Integer, default=0)
    frozen_until = Column(Float, nullable=True)
    created_at = Column(Float, nullable=False)

    chats = relationship("ChatMessageModel", back_populates="user", cascade="all, delete-orphan")

class ChatMessageModel(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False) # "user" or "model"
    content = Column(Text, nullable=False)
    tools_used = Column(Text, nullable=True) # JSON string
    created_at = Column(Float, nullable=False)

    user = relationship("UserModel", back_populates="chats")

# Create all tables on startup
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
