import sys
import os
import json
import urllib.request
import urllib.parse
import hashlib
import uuid
import oracledb

def load_gdrive_config():
    client_id = os.environ.get("GDRIVE_CLIENT_ID")
    client_secret = os.environ.get("GDRIVE_CLIENT_SECRET")
    refresh_token = os.environ.get("GDRIVE_REFRESH_TOKEN")
    
    if not (client_id and client_secret and refresh_token):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths = [
            os.path.join(script_dir, "gdrive_credentials.json"),
            os.path.join(os.path.dirname(script_dir), "gdrive_credentials.json"),
            os.path.join(os.path.dirname(script_dir), "backend", "gdrive_credentials.json")
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        cfg = json.load(f)
                        client_id = client_id or cfg.get("client_id")
                        client_secret = client_secret or cfg.get("client_secret")
                        refresh_token = refresh_token or cfg.get("refresh_token")
                        break
                except Exception:
                    pass
    return client_id, client_secret, refresh_token

def get_access_token():
    client_id, client_secret, refresh_token = load_gdrive_config()
    if not (client_id and client_secret and refresh_token):
        raise ValueError("Credenciales Google Drive no configuradas en backend/gdrive_credentials.json. Ejecute 'python backend/oauth_setup.py'.")

    url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            return res["access_token"]
    except urllib.error.HTTPError as he:
        body = he.read().decode("utf-8")
        if "invalid_grant" in body:
            raise ValueError("El Refresh Token de Google Drive ha expirado o fue revocado por Google (en modo de prueba personal de Google Cloud los tokens expiran cada 7 días). Por favor ejecute en su terminal 'python backend/oauth_setup.py' para re-autorizar su cuenta.")
        raise ValueError(f"Error de Google OAuth al renovar token ({he.code}): {body}")

def find_or_create_folder(access_token, folder_name, parent_id=None):
    if parent_id:
        q = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"
    else:
        q = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    
    url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(q)}&fields=files(id,name)&spaces=drive"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            if res.get("files"):
                return res["files"][0]["id"]
    except Exception as e:
        sys.stderr.write(f"Aviso al listar carpeta '{folder_name}': {e}\n")
            
    # Si no existe, crear la carpeta automáticamente en la jerarquía
    meta = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder"
    }
    if parent_id:
        meta["parents"] = [parent_id]
        
    req = urllib.request.Request(
        "https://www.googleapis.com/drive/v3/files",
        data=json.dumps(meta).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res["id"]

def upload_file_to_drive(access_token, parent_folder_id, file_name, file_bytes, mime_type="image/jpeg"):
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    metadata = {
        "name": file_name,
        "parents": [parent_folder_id]
    }
    
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b"Content-Type: application/json; charset=UTF-8\r\n\r\n")
    body.extend(json.dumps(metadata).encode("utf-8"))
    body.extend(b"\r\n")
    
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f"Content-Type: {mime_type}\r\n\r\n".encode("utf-8"))
    body.extend(file_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    
    upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink"
    req = urllib.request.Request(
        upload_url,
        data=bytes(body),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": f"multipart/related; boundary={boundary}"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        file_id = res["id"]
        
    # Public reader permission for avatar display
    perm_url = f"https://www.googleapis.com/drive/v3/files/{file_id}/permissions"
    perm_req = urllib.request.Request(
        perm_url,
        data=json.dumps({"role": "reader", "type": "anyone"}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(perm_req) as resp:
            pass
    except Exception as pe:
        pass
        
    return {
        "fileId": file_id,
        "name": file_name,
        "avatarUrl": f"https://lh3.googleusercontent.com/d/{file_id}"
    }

def register_in_oracle(payload, tipo="foto"):
    try:
        conn = oracledb.connect(
            user='SAMANYA',
            password='T3k3r_2025_DEV',
            dsn='samanya_high',
            config_dir='./wallet',
            wallet_location='./wallet',
            wallet_password='Samanya2026*'
        )
        c = conn.cursor()
        if tipo == "soporte":
            c.execute("""
                BEGIN
                    PKGLN_ARCHIVOS.PR_REGISTRAR_SOPORTE_TALENTO_HUMANO(:pcl_json);
                END;
            """, [json.dumps(payload)])
        else:
            c.execute("""
                BEGIN
                    PKGLN_ARCHIVOS.PR_REGISTRAR_FOTO_TALENTO_HUMANO(:pcl_json);
                END;
            """, [json.dumps(payload)])
        conn.commit()
        conn.close()
    except Exception as oe:
        sys.stderr.write(f"Advertencia al persistir en Oracle ({tipo}): {str(oe)}\n")

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"success": False, "error": "No input provided"}))
            return
            
        data = json.loads(raw_input)
        
        file_base64 = data.get("fileBase64")
        if not file_base64:
            print(json.dumps({"success": False, "error": "fileBase64 is required"}))
            return
            
        import base64
        file_bytes = base64.b64decode(file_base64)
        
        tipo_documento = data.get("tipoDocumento", "foto")
        id_usuario = int(data.get("idUsuario") or data.get("idEmpleado") or 202)
        id_empleado = int(data.get("idEmpleado") or id_usuario)
        identificacion = str(data.get("identificacion", "SIN_DOC")).strip().replace(".", "").replace("-", "")
        nombre_original = data.get("nombreOriginal", "archivo.pdf" if tipo_documento == "soporte" else "foto.jpg")
        nombre_completo = data.get("nombreCompleto", f"Colaborador {id_empleado}")
        id_centro = int(data.get("idCentro", 1))
        
        # Extension
        ext = os.path.splitext(nombre_original)[1].lower()
        if not ext:
            ext = ".pdf" if tipo_documento == "soporte" else ".jpg"
            
        tipo_mime = data.get("tipoMime")
        if not tipo_mime:
            if ext == ".pdf":
                tipo_mime = "application/pdf"
            elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
                tipo_mime = f"image/{ext.replace('.', '')}"
            else:
                tipo_mime = "application/octet-stream"

        # 1. Calculate real SHA-256 hash
        hash_sha256 = hashlib.sha256(file_bytes).hexdigest()
        nombre_almacenado = f"{hash_sha256}{ext}"
        nombre_archivo_drive = nombre_original if tipo_documento == "soporte" else nombre_almacenado
        
        # 2. Upload to Google Drive inside "Samanya/Talento_humano/{id_empleado}_{identificacion}"
        token = get_access_token()
        samanya_folder_id = find_or_create_folder(token, "Samanya")
        talento_folder_id = find_or_create_folder(token, "Talento_humano", parent_id=samanya_folder_id)
        user_folder_name = f"{id_empleado}_{identificacion}"
        user_folder_id = find_or_create_folder(token, user_folder_name, parent_id=talento_folder_id)
        
        upload_result = upload_file_to_drive(token, user_folder_id, nombre_archivo_drive, file_bytes, mime_type=tipo_mime)
        file_id = upload_result["fileId"]
        drive_url = f"https://drive.google.com/uc?export=view&id={file_id}"
        ruta_relativa = f"Samanya/Talento_humano/{user_folder_name}"
        
        # Save local copy in public/uploads/talento_humano
        local_dir = os.path.join("public", "uploads", "talento_humano")
        os.makedirs(local_dir, exist_ok=True)
        local_file_path = os.path.join(local_dir, nombre_archivo_drive)
        with open(local_file_path, "wb") as f:
            f.write(file_bytes)
            
        avatar_url = f"/uploads/talento_humano/{nombre_archivo_drive}"
        
        # 3. Register in Oracle Database via PKGLN_ARCHIVOS
        oracle_payload = {
            "idUsuario": id_usuario,
            "idEmpleado": id_empleado,
            "identificacion": identificacion,
            "nombreArchivo": nombre_original,
            "nombreArchivoAlmacenado": nombre_archivo_drive,
            "hashArchivo": hash_sha256,
            "rutaRelativa": ruta_relativa,
            "rutaCompletaAlmacenamiento": drive_url,
            "avatarUrl": avatar_url,
            "tamanoBytes": len(file_bytes),
            "extension": ext,
            "tipoMime": tipo_mime,
            "idCentro": id_centro,
            "idUsuarioCreacion": id_usuario,
            "idSolicitudPermiso": data.get("idSolicitudPermiso"),
            "nombreCompleto": nombre_completo
        }
        
        register_in_oracle(oracle_payload, tipo=tipo_documento)
        
        response = {
            "success": True,
            "avatarUrl": avatar_url,
            "driveUrl": drive_url,
            "fileId": file_id,
            "hash": hash_sha256,
            "nombreOriginal": nombre_original,
            "nombreAlmacenado": nombre_archivo_drive,
            "rutaRelativa": ruta_relativa,
            "directorioRaiz": "Samanya/Talento_humano",
            "directorioUsuario": user_folder_name,
            "mensaje": f"Archivo cargado a Google Drive ({ruta_relativa}/{nombre_archivo_drive}) y registrado en Oracle SMY_ARCHIVOS exitosamente."
        }
        print(json.dumps(response))
        
    except Exception as e:
        import traceback
        err_msg = str(e)
        tb = traceback.format_exc()
        print(json.dumps({"success": False, "error": err_msg, "traceback": tb}))

def get_photo(file_id):
    try:
        token = get_access_token()
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            sys.stdout.buffer.write(data)
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--get-photo":
        get_photo(sys.argv[2])
    else:
        main()
