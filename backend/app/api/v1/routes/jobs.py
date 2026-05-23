from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.schemas import JobCreate, JobResponse
from app.core.auth import get_current_user, get_supabase
import uuid

router = APIRouter()


@router.get("/", response_model=list[JobResponse])
async def list_jobs(skip: int = 0, limit: int = 20):
    supabase = get_supabase()
    result = supabase.client.table("jobs")\
        .select("*")\
        .eq("status", "active")\
        .range(skip, skip + limit - 1)\
        .execute()
    return result.data


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(body: JobCreate, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.client.table("jobs").insert({
        **body.model_dump(),
        "company_id": str(current_user.id),
        "status": "active",
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create job")
    return result.data[0]


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    supabase = get_supabase()
    result = supabase.client.table("jobs").select("*").eq("id", job_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data


@router.patch("/{job_id}/status")
async def update_job_status(job_id: str, status_value: str, current_user=Depends(get_current_user)):
    if status_value not in ("active", "paused", "closed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    supabase = get_supabase()
    supabase.client.table("jobs")\
        .update({"status": status_value})\
        .eq("id", job_id)\
        .eq("company_id", str(current_user.id))\
        .execute()
    return {"ok": True}
