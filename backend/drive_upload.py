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
        raise ValueError("Google Drive OAuth credentials not found in environment or gdrive_credentials.json")

    url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res["access_token"]

def find_or_create_folder(access_token, folder_name, parent_id=None):
    q = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    if parent_id:
        q += f" and '{parent_id}' in parents"
    else:
        q += " and 'root' in parents"
    
    url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(q)}&fields=files(id,name)"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        if res.get("files"):
            return res["files"][0]["id"]
            
    # Create folder
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

def register_in_oracle(payload):
    conn = oracledb.connect(
        user='SAMANYA',
        password='T3k3r_2025_DEV',
        dsn='samanya_high',
        config_dir='./wallet',
        wallet_location='./wallet',
        wallet_password='Samanya2026*'
    )
    c = conn.cursor()
    c.execute("""
        BEGIN
            PKGLN_ARCHIVOS.PR_REGISTRAR_FOTO_TALENTO_HUMANO(:pcl_json);
        END;
    """, [json.dumps(payload)])
    conn.commit()
    conn.close()

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
        
        id_usuario = int(data.get("idUsuario", 202))
        id_empleado = int(data.get("idEmpleado", id_usuario))
        identificacion = str(data.get("identificacion", "SIN_DOC")).strip().replace(".", "").replace("-", "")
        nombre_original = data.get("nombreOriginal", "foto.jpg")
        nombre_completo = data.get("nombreCompleto", f"Colaborador {id_usuario}")
        id_centro = int(data.get("idCentro", 1))
        
        # Extension
        ext = os.path.splitext(nombre_original)[1].lower()
        if not ext:
            ext = ".jpg"
            
        # 1. Calculate real SHA-256 hash
        hash_sha256 = hashlib.sha256(file_bytes).hexdigest()
        nombre_almacenado = f"{hash_sha256}{ext}"
        
        # 2. Upload to Google Drive inside "Samanya / Talento_humano / {id_usuario}_{identificacion}"
        token = get_access_token()
        samanya_folder_id = find_or_create_folder(token, "Samanya")
        talento_folder_id = find_or_create_folder(token, "Talento_humano", parent_id=samanya_folder_id)
        user_folder_name = f"{id_usuario}_{identificacion}"
        user_folder_id = find_or_create_folder(token, user_folder_name, parent_id=talento_folder_id)
        
        upload_result = upload_file_to_drive(token, user_folder_id, nombre_almacenado, file_bytes)
        file_id = upload_result["fileId"]
        drive_url = f"https://drive.google.com/uc?export=view&id={file_id}"
        ruta_relativa = f"Samanya/Talento_humano/{user_folder_name}"
        
        # Save local copy in public/uploads/talento_humano to guarantee 100% browser rendering without CORP block
        local_dir = os.path.join("public", "uploads", "talento_humano")
        os.makedirs(local_dir, exist_ok=True)
        local_file_path = os.path.join(local_dir, nombre_almacenado)
        with open(local_file_path, "wb") as f:
            f.write(file_bytes)
            
        avatar_url = f"/uploads/talento_humano/{nombre_almacenado}"
        
        # 3. Register in Oracle Database via PKGLN_ARCHIVOS
        oracle_payload = {
            "idUsuario": id_usuario,
            "idEmpleado": id_empleado,
            "identificacion": identificacion,
            "nombreArchivo": nombre_original,
            "nombreArchivoAlmacenado": nombre_almacenado,
            "hashArchivo": hash_sha256,
            "rutaRelativa": ruta_relativa,
            "rutaCompletaAlmacenamiento": drive_url,
            "avatarUrl": avatar_url,
            "tamanoBytes": len(file_bytes),
            "extension": ext,
            "tipoMime": data.get("tipoMime", "image/jpeg"),
            "idCentro": id_centro,
            "idUsuarioCreacion": id_usuario,
            "nombreCompleto": nombre_completo
        }
        
        register_in_oracle(oracle_payload)
        
        response = {
            "success": True,
            "avatarUrl": avatar_url,
            "driveUrl": drive_url,
            "fileId": file_id,
            "hash": hash_sha256,
            "nombreAlmacenado": nombre_almacenado,
            "rutaRelativa": ruta_relativa,
            "directorioRaiz": "Samanya/Talento_humano",
            "directorioUsuario": user_folder_name,
            "mensaje": f"Foto cargada a Google Drive ({ruta_relativa}/{nombre_almacenado}) y registrada en Oracle SMY_ARCHIVOS / SMY_USUARIOS exitosamente."
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
