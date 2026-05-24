# 1. Instalar las dependencias de Python (FastAPI, OpenCV para extraer fotos del video, Ollama y Firebase Admin)
pip install fastapi uvicorn python-multipart opencv-python ollama firebase-admin

# 2. Descargar el modelo multimodal de Mistral (Pixtral) en tu máquina local
ollama pull pixtral

# 3. Levantar el servidor backend
uvicorn main:app --reload

2. El Súper Prompt (Optimizado para Pixtral/Mistral)
Copia este texto. Está adaptado para que el modelo Pixtral (que es muy estricto) te devuelva únicamente un JSON válido a partir de la imagen extraída del video.
Actúa como un reclutador senior de talento tecnológico para la plataforma SkillMatch. 
Analiza la imagen adjunta (extraída del video del candidato). Evalúa su postura, contacto visual y nivel de profesionalismo.

REGLAS:
1. Responde ÚNICAMENTE con un JSON válido. Cero texto adicional. Cero explicaciones.
2. Usa exactamente esta estructura:

{
  "candidato": {
    "descripcion_postura": "Descripción breve",
    "contacto_visual": "Míra a la cámara o está distraído"
  },
  "metricas_evaluacion": {
    "nivel_confianza": 8,
    "profesionalismo": 7
  },
  "veredicto_skillmatch": "Resumen de 1 línea."
}


3. Código del Backend (main.py)


# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import cv2
import base64
import json
import ollama
import firebase_admin
from firebase_admin import credentials

# (Opcional) Inicializar Firebase Admin si necesitas validar tokens del Frontend
# cred = credentials.Certificate("ruta/a/tu/firebase-adminsdk.json")
# firebase_admin.initialize_app(cred)

app = FastAPI(title="SkillMatch Backend - Pixtral/Firebase")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROMPT_MISTRAL = """
Actúa como un reclutador senior de talento tecnológico para la plataforma SkillMatch. 
Analiza la imagen adjunta (extraída del video del candidato). Evalúa su postura, contacto visual y nivel de profesionalismo.

REGLAS:
1. Responde ÚNICAMENTE con un JSON válido. Cero texto adicional.
2. Usa exactamente esta estructura:
{
  "candidato": {
    "descripcion_postura": "Descripción breve",
    "contacto_visual": "Míra a la cámara o está distraído"
  },
  "metricas_evaluacion": {
    "nivel_confianza": 8,
    "profesionalismo": 7
  },
  "veredicto_skillmatch": "Resumen de 1 línea."
}
"""

def extraer_frame_base64(ruta_video):
    # Usar OpenCV para leer el video
    cap = cv2.VideoCapture(ruta_video)
    if not cap.isOpened():
        raise Exception("No se pudo procesar el video.")
    
    # Extraer un frame de la mitad del video
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise Exception("No se pudo extraer el fotograma.")
    
    # Convertir a JPG y luego a Base64
    _, buffer = cv2.imencode('.jpg', frame)
    imagen_b64 = base64.b64encode(buffer).decode('utf-8')
    return imagen_b64

@app.post("/api/analizar-candidato")
async def analizar_candidato(file: UploadFile = File(...)):
    ruta_temp = f"temp_{file.filename}"
    
    # 1. Guardar el video temporalmente
    with open(ruta_temp, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # 2. Extraer foto del video
        imagen_base64 = extraer_frame_base64(ruta_temp)
        
        # 3. Enviar a Pixtral (Mistral Multimodal) vía Ollama
        respuesta = ollama.chat(
            model='pixtral',
            messages=[{
                'role': 'user',
                'content': PROMPT_MISTRAL,
                'images': [imagen_base64]
            }]
        )
        
        # 4. Limpiar y parsear JSON
        texto_crudo = respuesta['message']['content'].strip()
        if texto_crudo.startswith("```"):
            texto_crudo = texto_crudo.replace("```json", "").replace("```", "").strip()
            
        return {"analisis": json.loads(texto_crudo)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(ruta_temp):
            os.remove(ruta_temp)


4. Código del Frontend (React/TypeScript)
4. Código del Frontend (React/TypeScript)
Cliente API + Firebase (src/lib/api-client.ts)
// Asegúrate de tener tu firebaseConfig configurado en otro archivo
// import { auth } from './firebaseConfig'; 

export const apiClient = {
  enviarVideoAMistral: async (blob: Blob): Promise<any> => {
    const formData = new FormData();
    formData.append('file', blob, 'video_candidato.webm');

    // (Opcional) Si usas Firebase Auth, puedes obtener el token así:
    // const token = await auth.currentUser?.getIdToken();

    const response = await fetch('http://localhost:8000/api/analizar-candidato', {
      method: 'POST',
      // headers: { 'Authorization': `Bearer ${token}` }, // Descomenta si usas validación Firebase
      body: formData,
    });

    if (!response.ok) throw new Error('Fallo en el servidor Python');
    
    const data = await response.json();
    return data.analisis;
  }
