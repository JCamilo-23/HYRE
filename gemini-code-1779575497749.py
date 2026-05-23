import sounddevice as sd
import soundfile as sf
import os
from google import genai

def capturar_audio_local(ruta_salida="buffer_audio.wav", duracion_segundos=5, frecuencia=44100):
    print(f"[HARDWARE] Grabando activamente por {duracion_segundos} segundos...")
    # Captura en un canal (mono) para reducir el ancho de banda
    datos_grabacion = sd.rec(int(duracion_segundos * frecuencia), samplerate=frecuencia, channels=1)
    sd.wait()  # Bloquea la ejecución hasta llenar el búfer
    sf.write(ruta_salida, datos_grabacion, frecuencia)
    print(f"[DISCO] Archivo guardado de forma segura en: {ruta_salida}")

def enviar_audio_a_gemini(ruta_archivo):
    client = genai.Client() # Asume que tienes configurada la variable GEMINI_API_KEY
    
    print("[CLOUD API] Subiendo archivo a la API de Archivos de Gemini...")
    archivo_remoto = client.files.upload(file=ruta_archivo)
    print(f"[CLOUD API] Subida completada. URI de referencia: {archivo_remoto.uri}")
    
    print("[IA] Solicitando inferencia al modelo gemini-2.0-flash...")
    respuesta = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            "Actúa como un transcriptor experto. Transcribe palabra por palabra el audio adjunto, sin omitir muletillas ni pausas.",
            archivo_remoto
        ]
    )
    return respuesta.text

if __name__ == "__main__":
    archivo_temporal = "audio_test.wav"
    capturar_audio_local(archivo_temporal, duracion_segundos=6)
    
    if os.path.exists(archivo_temporal):
        try:
            resultado = enviar_audio_a_gemini(archivo_temporal)
            print("\n=== TRANSCRIPCIÓN RECIBIDA ===")
            print(resultado)
        except Exception as e:
            print(f"\n[ERROR] Ocurrió una falla en la API de Gemini: {e}")