from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    # Return the single default seeded user (no real auth)
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        # Auto-create default user if missing
        user = User(id=1, name="Anurag Basuri", email="anurag@fireflies.dev")
        db.add(user)
        db.commit()
        db.refresh(user)

    return UserResponse.model_validate(user)
