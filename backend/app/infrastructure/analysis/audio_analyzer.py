"""Audio behavior analysis using librosa."""

from __future__ import annotations

import io
import logging
import time
from typing import Any

import numpy as np

from app.domain.entities.interview import AudioAnalysisResult

logger = logging.getLogger(__name__)


class AudioAnalyzer:
    """Extracts pace, pauses, hesitations, and confidence proxies from PCM/audio bytes."""

    def __init__(self, sample_rate: int = 16000) -> None:
        self._sr = sample_rate

    def analyze(self, audio_bytes: bytes, *, format_hint: str = "wav") -> AudioAnalysisResult:
        start = time.perf_counter()
        try:
            import librosa

            y, sr = librosa.load(io.BytesIO(audio_bytes), sr=self._sr, mono=True)
            if y.size == 0:
                return self._fallback("empty_audio")

            duration_s = float(len(y) / sr)
            rms = librosa.feature.rms(y=y)[0]
            silence_thresh = np.percentile(rms, 20)
            pause_frames = rms < silence_thresh
            pause_ratio = float(np.mean(pause_frames))

            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
            speech_segments = max(len(onsets), 1)
            wpm = (speech_segments / max(duration_s, 0.1)) * 60 * 2.5

            zcr = librosa.feature.zero_crossing_rate(y)[0]
            hesitation_count = int(np.sum(zcr > np.percentile(zcr, 92)))

            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            pitch_vals = []
            for t in range(pitches.shape[1]):
                idx = magnitudes[:, t].argmax()
                p = pitches[idx, t]
                if p > 0:
                    pitch_vals.append(p)
            pitch_stability = 70.0
            if len(pitch_vals) > 3:
                pitch_std = float(np.std(pitch_vals))
                pitch_stability = float(np.clip(100 - pitch_std * 2, 20, 98))

            energy_mean = float(np.mean(rms))
            vocal_confidence = float(np.clip(40 + energy_mean * 400 - pause_ratio * 30, 0, 100))
            nervousness = float(np.clip(pause_ratio * 80 + hesitation_count * 2, 0, 100))
            clarity = float(np.clip(100 - pause_ratio * 50 - hesitation_count, 0, 100))

            overall = (vocal_confidence + clarity + pitch_stability) / 3
            tone = self._emotional_tone(nervousness, vocal_confidence)

            elapsed = (time.perf_counter() - start) * 1000
            logger.debug("Audio analysis completed in %.1fms", elapsed)

            return AudioAnalysisResult(
                speaking_pace_wpm=round(wpm, 1),
                pause_ratio=round(pause_ratio, 3),
                hesitation_count=hesitation_count,
                vocal_confidence=round(vocal_confidence, 2),
                nervousness=round(nervousness, 2),
                pitch_stability=round(pitch_stability, 2),
                clarity=round(clarity, 2),
                emotional_tone=tone,
                overall_score=round(overall, 2),
            )
        except Exception as exc:
            logger.exception("Audio analysis failed: %s", exc)
            return self._fallback(str(exc))

    @staticmethod
    def _emotional_tone(nervousness: float, confidence: float) -> str:
        if nervousness > 70:
            return "anxious"
        if confidence > 75:
            return "confident"
        if confidence < 40:
            return "uncertain"
        return "neutral"

    @staticmethod
    def _fallback(reason: str) -> AudioAnalysisResult:
        logger.warning("Audio analyzer fallback: %s", reason)
        return AudioAnalysisResult(
            speaking_pace_wpm=120.0,
            pause_ratio=0.15,
            hesitation_count=2,
            vocal_confidence=55.0,
            nervousness=45.0,
            pitch_stability=60.0,
            clarity=55.0,
            emotional_tone="neutral",
            overall_score=55.0,
        )
