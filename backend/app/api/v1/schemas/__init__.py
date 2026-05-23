from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional


class JobCreate(BaseModel):
    title: str
    description: str
    requirements: list[str] = []
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    location: Optional[str] = None
    remote: bool = False


class JobResponse(BaseModel):
    id: UUID4
    company_id: UUID4
    title: str
    description: str
    requirements: list[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    location: Optional[str]
    remote: bool
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SimulationCreate(BaseModel):
    job_id: UUID4


class SimulationAnalysis(BaseModel):
    overall_score: int
    communication: int
    technical: int
    confidence: int
    feedback: list[str]
    strengths: list[str]
    improvements: list[str]


class SimulationResponse(BaseModel):
    id: UUID4
    job_id: UUID4
    candidate_id: UUID4
    status: str
    score: Optional[int]
    analysis: Optional[dict]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class CopilotMessage(BaseModel):
    role: str
    content: str


class CopilotRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class CopilotResponse(BaseModel):
    session_id: str
    reply: str
