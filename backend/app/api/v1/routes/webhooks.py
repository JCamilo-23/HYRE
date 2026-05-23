from fastapi import APIRouter, Request, HTTPException
from app.core.config import settings
from app.core.auth import get_supabase
import stripe

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    supabase = get_supabase()

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        subscription_id = session.get("subscription")

        supabase.client.table("subscriptions").upsert({
            "user_id": user_id,
            "plan": "pro",
            "stripe_subscription_id": subscription_id,
            "stripe_customer_id": session.get("customer"),
            "status": "active",
        }).execute()

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        supabase.client.table("subscriptions")\
            .update({"plan": "free", "status": "canceled"})\
            .eq("stripe_subscription_id", sub["id"])\
            .execute()

    return {"ok": True}
