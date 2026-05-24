"""Facial/body language analysis — MediaPipe with frame sampling for cost control."""

from __future__ import annotations

import io
import logging
import time
from typing import Any

import numpy as np
from PIL import Image

from app.domain.entities.interview import FacialAnalysisResult

logger = logging.getLogger(__name__)

# Sample every Nth frame in a batch to limit CPU/GPU cost
FRAME_SAMPLE_STRIDE = 3
MAX_FRAMES_PER_BATCH = 8


class FacialAnalyzer:
    """Efficient facial analysis: processes sampled frames only."""

    def __init__(self) -> None:
        self._face_mesh = None
        self._pose = None

    def _ensure_models(self) -> None:
        if self._face_mesh is not None:
            return
        try:
            import mediapipe as mp

            self._mp = mp
            self._face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
            )
            self._pose = mp.solutions.pose.Pose(
                static_image_mode=True,
                min_detection_confidence=0.5,
            )
        except ImportError as exc:
            logger.error("MediaPipe not installed: %s", exc)
            raise

    def analyze_frame(self, image_bytes: bytes) -> FacialAnalysisResult:
        return self.analyze_frames([image_bytes])

    def analyze_frames(self, frames: list[bytes]) -> FacialAnalysisResult:
        if not frames:
            return self._fallback("no_frames")

        sampled = frames[::FRAME_SAMPLE_STRIDE][:MAX_FRAMES_PER_BATCH]
        start = time.perf_counter()

        try:
            self._ensure_models()
            eye_scores: list[float] = []
            posture_scores: list[float] = []
            stability_scores: list[float] = []
            engagement_scores: list[float] = []

            for raw in sampled:
                img = np.array(Image.open(io.BytesIO(raw)).convert("RGB"))
                h, w = img.shape[:2]
                face = self._face_mesh.process(img)
                pose = self._pose.process(img)

                if face.multi_face_landmarks:
                    lm = face.multi_face_landmarks[0].landmark
                    left_eye = lm[33]
                    right_eye = lm[263]
                    nose = lm[1]
                    eye_center_x = (left_eye.x + right_eye.x) / 2
                    offset = abs(nose.x - eye_center_x)
                    eye_contact = float(np.clip(100 - offset * 400, 20, 100))
                    eye_scores.append(eye_contact)

                    xs = [p.x for p in lm]
                    ys = [p.y for p in lm]
                    spread = (max(xs) - min(xs)) * (max(ys) - min(ys))
                    stability_scores.append(float(np.clip(70 + spread * 80, 30, 98)))

                if pose.pose_landmarks:
                    plm = pose.pose_landmarks.landmark
                    shoulder_l = plm[self._mp.solutions.pose.PoseLandmark.LEFT_SHOULDER]
                    shoulder_r = plm[self._mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER]
                    hip_l = plm[self._mp.solutions.pose.PoseLandmark.LEFT_HIP]
                    shoulder_level = abs(shoulder_l.y - shoulder_r.y)
                    torso = abs(shoulder_l.y - hip_l.y)
                    posture = float(np.clip(100 - shoulder_level * 300 + torso * 50, 25, 98))
                    posture_scores.append(posture)
                    engagement_scores.append(posture * 0.9)

            eye = float(np.mean(eye_scores)) if eye_scores else 55.0
            posture = float(np.mean(posture_scores)) if posture_scores else 55.0
            stability = float(np.mean(stability_scores)) if stability_scores else 55.0
            engagement = float(np.mean(engagement_scores)) if engagement_scores else posture
            confidence = (eye * 0.4 + posture * 0.35 + stability * 0.25)
            body = (posture + engagement) / 2
            overall = (eye + posture + stability + engagement) / 4

            elapsed = (time.perf_counter() - start) * 1000
            logger.debug("Facial analysis %d frames in %.1fms", len(sampled), elapsed)

            notes: list[str] = []
            if eye < 50:
                notes.append("Mejorar contacto visual con la cámara")
            if posture < 50:
                notes.append("Enderezar postura para mayor presencia")

            return FacialAnalysisResult(
                eye_contact=round(eye, 2),
                posture=round(posture, 2),
                facial_stability=round(stability, 2),
                confidence=round(confidence, 2),
                attention=round(engagement, 2),
                engagement=round(engagement, 2),
                body_language_score=round(body, 2),
                overall_score=round(overall, 2),
                notes=notes,
            )
        except Exception as exc:
            logger.exception("Facial analysis failed: %s", exc)
            return self._fallback(str(exc))

    @staticmethod
    def _fallback(reason: str) -> FacialAnalysisResult:
        logger.warning("Facial analyzer fallback: %s", reason)
        return FacialAnalysisResult(
            eye_contact=60.0,
            posture=62.0,
            facial_stability=58.0,
            confidence=60.0,
            attention=58.0,
            engagement=59.0,
            body_language_score=60.0,
            overall_score=60.0,
            notes=["Análisis facial no disponible en este frame"],
        )
