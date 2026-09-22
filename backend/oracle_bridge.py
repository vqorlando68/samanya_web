import sys
import os
import json
import datetime
import oracledb

def get_connection():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    wallet_dir = os.path.join(script_dir, "wallet")
    if not os.path.exists(wallet_dir):
        wallet_dir = os.path.abspath("./wallet")

    return oracledb.connect(
        user=os.environ.get('ORACLE_USER', 'SAMANYA'),
        password=os.environ.get('ORACLE_PASSWORD', 'T3k3r_2025_DEV'),
        dsn=os.environ.get('ORACLE_DSN', 'samanya_high'),
        config_dir=wallet_dir,
        wallet_location=wallet_dir,
        wallet_password=os.environ.get('ORACLE_WALLET_PASSWORD', 'Samanya2026*')
    )

def json_serial(obj):
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"success": False, "error": "No input provided"}))
            return

        req = json.loads(raw_input)
        pkg = req.get("package", "").upper().strip()
        proc = req.get("procedure", "").upper().strip()
        payload = req.get("payload", {})

        if not pkg or not proc:
            print(json.dumps({"success": False, "error": "Package and procedure are required"}))
            return

        # Solo permitir paquetes y procedimientos válidos alfanuméricos por seguridad
        if not pkg.replace("_", "").isalnum() or not proc.replace("_", "").isalnum():
            print(json.dumps({"success": False, "error": "Invalid package or procedure name"}))
            return

        conn = get_connection()
        c = conn.cursor()

        # Si es un paquete PKGCA_ que retorna SYS_REFCURSOR (por ejemplo p_consultar_censo)
        if pkg.startswith("PKGCA_") and (proc.startswith("P_CONSULTAR") or proc.startswith("P_LISTAR")):
            ref_cursor = conn.cursor()
            c.callproc(f"{pkg}.{proc}", [json.dumps(payload), ref_cursor])
            cols = [d[0].lower() for d in ref_cursor.description] if ref_cursor.description else []
            rows = ref_cursor.fetchall()
            data = [dict(zip(cols, r)) for r in rows]
            ref_cursor.close()
            c.close()
            conn.close()

            print(json.dumps({"success": True, "data": data, "count": len(data)}, default=json_serial))
            return

        # Ejecución estándar de proceso PL/SQL (PKGLN_, PKGCN_, etc.)
        plsql = f"BEGIN {pkg}.{proc}(:pcl_json); END;"
        c.execute(plsql, [json.dumps(payload)])
        conn.commit()
        c.close()
        conn.close()

        print(json.dumps({"success": True, "message": f"{pkg}.{proc} ejecutado exitosamente"}))

    except Exception as e:
        import traceback
        err_msg = str(e)
        print(json.dumps({"success": False, "error": err_msg, "traceback": traceback.format_exc()}))

if __name__ == "__main__":
    main()
