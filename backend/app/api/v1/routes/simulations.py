from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.schemas import SimulationCreate, SimulationResponse
from app.core.auth import get_current_user, get_supabase

router = APIRouter()


@router.get("/", response_model=list[SimulationResponse])
async def list_my_simulations(current_user=Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.client.table("simulations")\
        .select("*")\
        .eq("candidate_id", str(current_user.id))\
        .order("created_at", desc=True)\
        .execute()
    return result.data


@router.post("/", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation(body: SimulationCreate, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.client.table("simulations").insert({
        "job_id": str(body.job_id),
        "candidate_id": str(current_user.id),
        "status": "pending",
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create simulation")
    return result.data[0]


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(simulation_id: str, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.client.table("simulations")\
        .select("*")\
        .eq("id", simulation_id)\
        .single()\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return result.data
