import sys
import platform
import os

def test_python_installation():
    print("="*40)
    print("🧪 PRUEBA DE INSTALACIÓN DE PYTHON")
    print("="*40)
    
    print(f"✅ Versión de Python:  {sys.version}")
    print(f"💻 Sistema Operativo:  {platform.system()} {platform.release()}")
    print(f"📂 Ruta del Ejecutable: {sys.executable}")
    
    # Verificar si está en el PATH
    python_dir = os.path.dirname(sys.executable)
    if python_dir in os.environ['PATH']:
        print("🔗 PATH: Configurado correctamente.")
    else:
        print("⚠️  PATH: No detectado. Por eso 'python --version' falla.")
    
    # Prueba de funcionalidad básica
    try:
        calc = 10 + 20
        print(f"⚙️  Prueba de Lógica:  Correcta (10 + 20 = {calc})")
        print("="*40)
        print("¡Python está instalado y funcionando correctamente!")
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")

if __name__ == "__main__":
    test_python_installation()