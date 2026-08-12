import os

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import user_model
from app.models.push_subscription_model import PushSubscription
from app.schemas.push_subscription_schema import (
    PushSubscriptionCreate,
    PushSubscriptionDelete,
)
from app.utils.auth import get_current_user


router = APIRouter(prefix="/push", tags=["push"])


@router.get("/vapid-public-key")
def get_vapid_public_key(
    current_user: user_model.User = Depends(get_current_user),
) -> dict[str, str]:
    public_key = os.getenv("VAPID_PUBLIC_KEY")
    if not public_key:
        raise HTTPException(status_code=503, detail="通知機能が設定されていません")
    return {"public_key": public_key}


@router.post("/subscriptions", status_code=status.HTTP_204_NO_CONTENT)
def save_subscription(
    data: PushSubscriptionCreate,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = db.execute(
        select(PushSubscription).where(PushSubscription.endpoint == data.endpoint)
    ).scalar_one_or_none()

    if subscription is None:
        subscription = PushSubscription(endpoint=data.endpoint)
        db.add(subscription)

    subscription.user_id = current_user.id
    subscription.p256dh = data.keys.p256dh
    subscription.auth = data.keys.auth
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/subscriptions", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    data: PushSubscriptionDelete,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subscription = db.execute(
        select(PushSubscription).where(
            PushSubscription.endpoint == data.endpoint,
            PushSubscription.user_id == current_user.id,
        )
    ).scalar_one_or_none()
    if subscription is not None:
        db.delete(subscription)
        db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
