import os
import time
import uuid
import hashlib
import requests
import jwt
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import UserModel, get_db
from config import (
    GOOGLE_CLIENT_ID,
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY,
    FRONTEND_URL
)

# Secret configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "smart_assistant_super_secret_jwt_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days

security_scheme = HTTPBearer(auto_error=False)

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleOAuthRequest(BaseModel):
    credential: str  # Real Google ID Token returned by Google Identity Services

def _hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "smart_assistant_salt_2026_"
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": time.time() + ACCESS_TOKEN_EXPIRE_SECONDS})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def send_verification_email(email: str, name: str, token: str) -> str:
    """Send Email Confirmation Link via EmailJS REST API."""
    verification_link = f"{FRONTEND_URL}/?verify_token={token}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #4f46e5; margin-top: 0;">Welcome, {name}!</h2>
          <p style="color: #475569; font-size: 15px;">Thank you for registering with AI Smart Assistant. Please click the button below to confirm your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Confirm Email Address</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">If you did not request this email, please ignore it.</p>
        </div>
      </body>
    </html>
    """
    
    # Send via EmailJS REST API (HTTPS Port 443)
    if EMAILJS_SERVICE_ID and EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY and EMAILJS_SERVICE_ID != "service_id_here":
        try:
            payload = {
                "service_id": EMAILJS_SERVICE_ID,
                "template_id": EMAILJS_TEMPLATE_ID,
                "user_id": EMAILJS_PUBLIC_KEY,
                "template_params": {
                    "to_email": email,
                    "to_name": name,
                    "user_name": name,
                    "user_email": email,
                    "verification_link": verification_link,
                    "html_content": html_content
                }
            }
            if EMAILJS_PRIVATE_KEY:
                payload["accessToken"] = EMAILJS_PRIVATE_KEY

            res = requests.post(
                "https://api.emailjs.com/api/v1.0/email/send",
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=10
            )
            if res.status_code == 200:
                print(f"[EMAILJS SUCCESS] Email sent to {email}")
                return verification_link
            else:
                print(f"[EMAILJS WARNING] Status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[EMAILJS ERROR] Could not send email via EmailJS API: {e}")
    else:
        print(f"\n==================================================")
        print(f"[EMAILJS READY] Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in .env")
        print(f"To: {email}")
        print(f"Verification Link: {verification_link}")
        print(f"==================================================\n")

    return verification_link

def register_user(req: UserRegister, db: Session) -> Dict[str, Any]:
    email_clean = req.email.strip().lower()
    existing_user = db.query(UserModel).filter(UserModel.email == email_clean).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    user_id = f"usr_{int(time.time() * 1000)}"
    verification_token = str(uuid.uuid4())
    
    new_user = UserModel(
        id=user_id,
        name=req.name.strip(),
        email=email_clean,
        password_hash=_hash_password(req.password),
        role="Verified User",
        avatar=f"https://api.dicebear.com/7.x/bottts/svg?seed={email_clean}",
        is_verified=False,
        verification_token=verification_token,
        failed_attempts=0,
        frozen_until=None,
        created_at=time.time()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    link = send_verification_email(email_clean, new_user.name, verification_token)
    
    return {
        "message": "Registration successful! A confirmation email has been sent. Please check your inbox and verify your email to log in.",
        "email": email_clean,
        "verification_required": True,
        "verification_link": link
    }

def verify_email(token: str, db: Session) -> Dict[str, Any]:
    user = db.query(UserModel).filter(UserModel.verification_token == token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired email verification link."
        )
        
    user.is_verified = True
    user.verification_token = None
    db.commit()
    
    jwt_token = create_access_token({"sub": user.id, "email": user.email, "name": user.name})
    return {
        "message": "Email verified successfully! You are now logged in.",
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role or "Verified User",
            "avatar": user.avatar or ""
        }
    }

def login_user(req: UserLogin, db: Session) -> Dict[str, Any]:
    email_clean = req.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email == email_clean).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )
    
    now = time.time()
    frozen_until = user.frozen_until
    
    # 1. Check if account is frozen
    if frozen_until and now < frozen_until:
        remaining_seconds = int(frozen_until - now)
        hours = remaining_seconds // 3600
        minutes = (remaining_seconds % 3600) // 60
        time_str = f"{hours}h {minutes}m" if hours > 0 else f"{minutes} minutes"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account frozen! You exceeded 5 failed login attempts. Your account is locked for 24 hours (Time remaining: {time_str})."
        )
        
    # Reset frozen status if duration has passed
    if frozen_until and now >= frozen_until:
        user.frozen_until = None
        user.failed_attempts = 0
        db.commit()

    # 2. Check Password
    if user.password_hash != _hash_password(req.password):
        user.failed_attempts = (user.failed_attempts or 0) + 1
        
        if user.failed_attempts >= 5:
            user.frozen_until = now + 86400  # Freeze for 24 hours
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security Alert: 5 failed login attempts reached! Your account has been frozen for 24 hours."
            )
        else:
            db.commit()
            attempts_left = 5 - user.failed_attempts
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid email address or password. Failed attempts: {user.failed_attempts}/5. ({attempts_left} attempts remaining before 24h freeze)."
            )

    # 3. Check Email Confirmation
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address not confirmed. Please check your inbox and click the verification link before logging in."
        )

    # Successful login
    user.failed_attempts = 0
    user.frozen_until = None
    db.commit()
    
    token = create_access_token({"sub": user.id, "email": user.email, "name": user.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role or "Verified User",
            "avatar": user.avatar or ""
        }
    }

def google_oauth_login(req: GoogleOAuthRequest, db: Session) -> Dict[str, Any]:
    """Verify Real Google OAuth 2.0 Credential with Google Servers & SQLite Store."""
    if not req.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google OAuth credential token."
        )

    try:
        res = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={req.credential}", timeout=10)
        if res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google OAuth 2.0 verification failed. Invalid or expired Google credential token."
            )
        google_payload = res.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to connect to Google OAuth verification service: {str(e)}"
        )

    email_clean = google_payload.get("email", "").strip().lower()
    name = google_payload.get("name", "Google User")
    avatar = google_payload.get("picture", f"https://api.dicebear.com/7.x/bottts/svg?seed={email_clean}")

    if not email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not return a valid email address."
        )

    user = db.query(UserModel).filter(UserModel.email == email_clean).first()
    if not user:
        user_id = f"usr_g_{int(time.time() * 1000)}"
        user = UserModel(
            id=user_id,
            name=name,
            email=email_clean,
            password_hash="oauth2_google_verified",
            role="Google OAuth Verified",
            avatar=avatar,
            is_verified=True,
            verification_token=None,
            failed_attempts=0,
            frozen_until=None,
            created_at=time.time()
        )
        db.add(user)
    else:
        user.is_verified = True
        user.name = name
        user.avatar = avatar
        user.failed_attempts = 0
        user.frozen_until = None

    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.id, "email": user.email, "name": user.name, "oauth": "google"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role or "Google OAuth Verified",
            "avatar": user.avatar or ""
        }
    }

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token in Authorization header."
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token. Please log in again."
        )
    
    email = payload.get("email")
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found."
        )
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role or "User",
        "avatar": user.avatar or ""
    }

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    if not credentials or not credentials.credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if not payload:
        return None
    email = payload.get("email")
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        return None
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role or "User",
        "avatar": user.avatar or ""
    }
