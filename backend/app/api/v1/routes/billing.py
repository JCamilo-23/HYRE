from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.auth import get_current_user, get_supabase
from app.core.config import settings
import stripe

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

PRICE_IDS = {
    "pro": "price_pro_monthly",
    "enterprise": "price_enterprise_monthly",
}


class CheckoutRequest(BaseModel):
    plan: str
    success_url: str
    cancel_url: str


@router.post("/checkout")
async def create_checkout(body: CheckoutRequest, current_user=Depends(get_current_user)):
    price_id = PRICE_IDS.get(body.plan)
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan")

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=body.success_url,
        cancel_url=body.cancel_url,
        metadata={"user_id": str(current_user.id)},
    )
    return {"url": session.url}


@router.get("/subscription")
async def get_subscription(current_user=Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.client.table("subscriptions")\
        .select("*")\
        .eq("user_id", str(current_user.id))\
        .single()\
        .execute()
    return result.data or {"plan": "free", "status": "active"}
