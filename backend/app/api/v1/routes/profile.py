from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user, get_supabase
from app.api.v1.schemas import ProfileUpdate

router = APIRouter()


@router.get("/me")
async def get_my_profile(current_user=Depends(get_current_user)):
    supabase = get_supabase()

    profile_res = supabase.client.table("profiles") \
        .select("*").eq("id", str(current_user.id)).single().execute()

    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile = profile_res.data
    role = profile.get("role")

    if role == "candidate":
        ext = supabase.client.table("candidate_profiles") \
            .select("*").eq("id", str(current_user.id)).single().execute()
        profile["candidate_profile"] = ext.data
    elif role == "business":
        ext = supabase.client.table("business_profiles") \
            .select("*").eq("id", str(current_user.id)).single().execute()
        profile["business_profile"] = ext.data

    return profile


@router.patch("/me")
async def update_my_profile(body: ProfileUpdate, current_user=Depends(get_current_user)):
    supabase = get_supabase()

    profile_res = supabase.client.table("profiles") \
        .select("role").eq("id", str(current_user.id)).single().execute()

    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    role = profile_res.data.get("role")

    if role == "candidate" and body.candidate_profile:
        data = body.candidate_profile.model_dump(exclude_none=True)
        if data:
            supabase.client.table("candidate_profiles") \
                .update(data).eq("id", str(current_user.id)).execute()

    elif role == "business" and body.business_profile:
        data = body.business_profile.model_dump(exclude_none=True)
        if data:
            supabase.client.table("business_profiles") \
                .update(data).eq("id", str(current_user.id)).execute()

    return {"ok": True}
