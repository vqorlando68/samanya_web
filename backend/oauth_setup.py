import os
import sys
import json
import urllib.request
import urllib.parse
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5123
REDIRECT_URI = f"http://localhost:{PORT}/oauth2callback"
SCOPES = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file"

def get_client_credentials():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(script_dir, "gdrive_credentials.json"),
        os.path.join(script_dir, "oauth_credentials.json"),
        os.path.join(os.path.dirname(script_dir), "backend", "gdrive_credentials.json")
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    cfg = data.get("installed") or data.get("web") or data
                    cid = cfg.get("client_id")
                    csecret = cfg.get("client_secret")
                    if cid and csecret:
                        return cid, csecret
            except Exception:
                pass
    return None, None

def run_oauth_flow():
    client_id, client_secret = get_client_credentials()
    if not (client_id and client_secret):
        print("❌ Error: No se encontró client_id ni client_secret en backend/gdrive_credentials.json")
        sys.exit(1)

    print("================================================================")
    print("🔐 ASISTENTE DE AUTORIZACIÓN GOOGLE DRIVE (SAMANYA OS)")
    print("================================================================")
    print(f"Client ID: {client_id[:25]}...")
    print(f"Redirect URI: {REDIRECT_URI}\n")

    auth_params = {
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(auth_params)}"

    print("Abriendo automáticamente su navegador para autorizar la cuenta Google...")
    print("Si no abre automáticamente, copie y pegue este enlace en su navegador:\n")
    print(auth_url)
    print("\n----------------------------------------------------------------")
    print(f"⏳ Esperando autorización en {REDIRECT_URI} ...\n")

    try:
        webbrowser.open(auth_url)
    except Exception:
        pass

    auth_code_holder = {"code": None, "error": None}

    class OAuthHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/oauth2callback":
                qs = urllib.parse.parse_qs(parsed.query)
                if "error" in qs:
                    auth_code_holder["error"] = qs["error"][0]
                    self.send_response(400)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(f"<h1>Error de autorizacion: {qs['error'][0]}</h1>".encode("utf-8"))
                elif "code" in qs:
                    auth_code_holder["code"] = qs["code"][0]
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    html = """
                    <html>
                    <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #12241f; color: #f7f5f0;">
                        <h1 style="color: #2c7a6b;">✅ ¡Autorización Exitosa!</h1>
                        <p>SAMANYA se ha conectado correctamente a su cuenta de Google Drive.</p>
                        <p style="color: #a8b8b0;">El nuevo Refresh Token ha sido registrado. Puede cerrar esta pestaña.</p>
                    </body>
                    </html>
                    """
                    self.wfile.write(html.encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, format, *args):
            return

    server = HTTPServer(("localhost", PORT), OAuthHandler)
    while auth_code_holder["code"] is None and auth_code_holder["error"] is None:
        server.handle_request()

    if auth_code_holder["error"]:
        print(f"❌ Error reportado por Google: {auth_code_holder['error']}")
        sys.exit(1)

    code = auth_code_holder["code"]
    print("✅ Código de autorización recibido de Google.")
    print("🔄 Canjeando código por nuevo Refresh Token...")

    token_url = "https://oauth2.googleapis.com/token"
    token_data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }).encode("utf-8")

    req = urllib.request.Request(token_url, data=token_data, method="POST")
    with urllib.request.urlopen(req) as resp:
        tokens = json.loads(resp.read().decode("utf-8"))

    refresh_token = tokens.get("refresh_token")
    access_token = tokens.get("access_token")

    if not refresh_token:
        print("⚠️ Advertencia: Google no retornó un nuevo refresh_token (posiblemente porque ya estaba autorizado previamente).")
        # Mantener el anterior si existe
        old_id, old_sec, old_rt = (None, None, None)
        cred_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gdrive_credentials.json")
        if os.path.exists(cred_path):
            with open(cred_path, "r", encoding="utf-8") as f:
                old_data = json.load(f)
                refresh_token = old_data.get("refresh_token")

    # Guardar en backend/gdrive_credentials.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    cred_path = os.path.join(script_dir, "gdrive_credentials.json")
    save_data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token
    }
    with open(cred_path, "w", encoding="utf-8") as f:
        json.dump(save_data, f, indent=2)

    print(f"✅ Credenciales actualizadas exitosamente en: {cred_path}")
    print(f"🔑 Refresh Token nuevo: {refresh_token[:25]}...")

    # Realizar prueba inmediata de carpetas Samanya / Talento_humano
    print("\n🔍 Verificando acceso a Google Drive y creando directorios...")
    from drive_upload import find_or_create_folder
    samanya_id = find_or_create_folder(access_token, "Samanya")
    print(f"📁 Directorio raíz 'Samanya': ID {samanya_id}")
    talento_id = find_or_create_folder(access_token, "Talento_humano", parent_id=samanya_id)
    print(f"📁 Directorio 'Samanya/Talento_humano': ID {talento_id}")
    print("\n================================================================")
    print("🎉 ¡CONEXIÓN CON GOOGLE DRIVE 100% OPERATIVA Y VERIFICADA!")
    print("================================================================")

if __name__ == "__main__":
    run_oauth_flow()
