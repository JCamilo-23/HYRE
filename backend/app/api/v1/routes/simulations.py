from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.schemas import SimulationCreate, SimulationResponse
from app.core.auth import get_current_user, get_supabase
from app.infrastructure.gemini.client import get_text_model
import json

router = APIRouter()


@router.get("/", response_model=list[SimulationResponse])
async def list_my_simulations(current_user=Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.client.table("simulations")\
        .select("*").eq("candidate_id", str(current_user.id))\
        .order("created_at", desc=True).execute()
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


@router.get("/{simulation_id}/questions")
async def get_simulation_questions(simulation_id: str, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    sim = supabase.client.table("simulations")\
        .select("*, jobs(title, description, requirements)")\
        .eq("id", simulation_id).single().execute()
    if not sim.data:
        raise HTTPException(status_code=404, detail="Simulation not found")

    if sim.data.get("questions"):
        return {"questions": sim.data["questions"]}

    job = sim.data.get("jobs", {})
    prompt = f"""Genera exactamente 5 preguntas de entrevista en español para este cargo:
Titulo: {job.get('title', 'Posicion de trabajo')}
Descripcion: {job.get('description', '')}
Requisitos: {', '.join(job.get('requirements', []))}

Responde SOLO con un JSON valido:
{{"questions": [
  {{"id": 1, "question": "...", "category": "tecnica|conductual|situacional", "time_seconds": 60}},
  ...
]}}"""

    model = get_text_model()
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    try:
        data = json.loads(text.strip())
        questions = data["questions"]
    except Exception:
        questions = [
            {"id": 1, "question": "Cuéntame sobre ti y por qué te interesa este cargo.", "category": "conductual", "time_seconds": 90},
            {"id": 2, "question": "¿Cuál es tu mayor fortaleza profesional?", "category": "conductual", "time_seconds": 60},
            {"id": 3, "question": "Describe un reto que hayas superado en equipo.", "category": "situacional", "time_seconds": 90},
            {"id": 4, "question": "¿Cómo te mantienes actualizado en tu área?", "category": "tecnica", "time_seconds": 60},
            {"id": 5, "question": "¿Dónde te ves en 3 años?", "category": "conductual", "time_seconds": 60},
        ]

    supabase.client.table("simulations")\
        .update({"questions": questions}).eq("id", simulation_id).execute()

    return {"questions": questions}


@router.patch("/{simulation_id}/result")
async def save_simulation_result(simulation_id: str, body: dict, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    overall = body.get("overall_score", 0)
    supabase.client.table("simulations").update({
        "status": "completed",
        "score": overall,
        "analysis": body,
        "video_scores": body.get("video_scores"),
        "overall_score": overall,
    }).eq("id", simulation_id).eq("candidate_id", str(current_user.id)).execute()
    return {"ok": True}


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(simulation_id: str, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.client.table("simulations")\
        .select("*").eq("id", simulation_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return result.data
