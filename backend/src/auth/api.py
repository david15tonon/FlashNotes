from datetime import timedelta
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from core.config import ALGORITHM
from src.auth.schemas import Token
from src.auth.services import SessionDep, send_reset_email
from src.core.config import settings

from . import services

router = APIRouter()


@router.post("/tokens")
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    user = services.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=services.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )


@router.post("/password-reset")
def password_reset_request(email: str, session: SessionDep):
    user = services.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Envoyez un email avec un token de réinitialisation
    reset_token = services.create_access_token(user.email, timedelta(hours=1))
    send_reset_email(user.email, reset_token)
    return {"message": "Password reset email sent"}


@router.post("/password-reset/confirm")
def reset_password_confirm(token: str, new_password: str, session: SessionDep):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired")

    user = services.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = services.get_password_hash(new_password)
    user.hashed_password = hashed_password
    session.add(user)
    session.commit()
    return {"message": "Password reset successful"}
