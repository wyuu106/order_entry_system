import asyncio
import json
import os

from pywebpush import WebPushException, webpush
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.push_subscription_model import PushSubscription


async def send_new_order_notifications(db: Session, order_group) -> None:
    orders = [order for order in order_group.orders if not order.is_drink]
    if not orders:
        return

    vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
    vapid_subject = os.getenv("VAPID_SUBJECT")
    if not vapid_private_key or not vapid_subject:
        print("Web Push skipped: VAPID settings are missing")
        return

    subscriptions = db.execute(select(PushSubscription)).scalars().all()
    if not subscriptions:
        return

    order_names = [
        f"{order.menu_name} × {order.quantity}"
        for order in orders
    ]
    body = "、".join(order_names[:3])
    if len(order_names) > 3:
        body += f" ほか{len(order_names) - 3}件"

    payload = json.dumps(
        {
            "title": f"新規注文（{order_group.seat_name}）",
            "body": body,
            "url": "/orders",
            "tag": f"new-order-{orders[0].id}",
        },
        ensure_ascii=False,
    )

    async def send(subscription: PushSubscription):
        try:
            await asyncio.to_thread(
                webpush,
                subscription_info={
                    "endpoint": subscription.endpoint,
                    "keys": {
                        "p256dh": subscription.p256dh,
                        "auth": subscription.auth,
                    },
                },
                data=payload,
                vapid_private_key=vapid_private_key,
                vapid_claims={"sub": vapid_subject},
                ttl=60,
            )
            return None
        except WebPushException as error:
            status_code = getattr(error.response, "status_code", None)
            if status_code in (404, 410):
                return subscription
            print("Web Push error:", error)
            return None

    expired = await asyncio.gather(*(send(item) for item in subscriptions))
    for subscription in expired:
        if subscription is not None:
            db.delete(subscription)

    if any(subscription is not None for subscription in expired):
        db.commit()
