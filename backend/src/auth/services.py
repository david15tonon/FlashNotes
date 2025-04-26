import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import ValidationError
from sqlmodel import Session

from src.auth.schemas import TokenPayload
from src.core.config import settings
from src.core.db import get_db
from src.users.models import User

ALGORITHM = "HS256"

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/tokens")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    from src.users.services import get_user_by_email

    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def send_reset_email(email: str, reset_token: str) -> None:
    """
    Send a password reset email to the specified email address.

    Args:
        email (str): The recipient's email address.
        reset_token (str): The token used to reset the password.
    """
    # Construct the password reset URL
    reset_url = f"{settings.FRONTEND_BASE_URL}/reset-password?token={reset_token}"

    # Email content
    subject = "Password Reset Request"
    body = f"""
    Hello,

    You requested a password reset. Please click the link below to reset your password:

    {reset_url}

    If you did not request this, please ignore this email.

    Best regards,
    FlashNotes Team
    """

    # Create MIME email message
    message = MIMEMultipart()
    message["From"] = settings.EMAIL_SENDER
    message["To"] = email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    # Send the email
    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_SENDER, email, message.as_string())
        print(f"Password reset email sent to {email}")
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")
        raise
