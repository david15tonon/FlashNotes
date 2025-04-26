from fastapi.testclient import TestClient
from sqlmodel import Session
from src.auth.services import get_password_hash

def test_request_password_reset(client: TestClient, db: Session) -> None:
    email = "testuser@example.com"
    password = "testpassword"
    hashed_password = get_password_hash(password)

    # Créer un utilisateur
    db.exec(
        "INSERT INTO user (email, hashed_password, is_active) VALUES (:email, :hashed_password, :is_active)",
        {"email": email, "hashed_password": hashed_password, "is_active": True},
    )

    # Demander une réinitialisation
    response = client.post("/api/auth/password-reset", json={"email": email})
    assert response.status_code == 200
    assert response.json() == {"message": "Password reset email sent"}

def test_reset_password(client: TestClient, db: Session) -> None:
    email = "testuser@example.com"
    new_password = "newpassword"

    # Simuler un token
    token = "mock-token"  # Remplacer par une vraie logique de token si nécessaire

    # Réinitialiser le mot de passe
    response = client.post(
        "/api/auth/password-reset/confirm",
        json={"token": token, "new_password": new_password},
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Password reset successful"}