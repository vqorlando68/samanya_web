# Árbol de Decisión y Matriz de Responsabilidades

Antes de crear, modificar o proponer un subprograma o paquete PL/SQL en Oracle, se debe seguir rigurosamente este flujo:

```
¿Es lógica de negocio, validaciones, reglas de dominio o la orquestación de un caso de uso?
│
├── SÍ ─────────────────────────────────────────────────────────────► Pertenece a: pkgln_<nombre_proceso>
│                                                                     (Recibe pcl_json IN CLOB, usa JSON_VALUE.
│                                                                      Lógica de negocio, reglas y validaciones.
│                                                                      SIN DML directo y SIN SELECT directo a tablas.
│                                                                      Consulta y modifica a través de _DAO, pkgca_ y pkgcn_.
│                                                                      Aquí va p_do_commit('<paquete>.<metodo>')).
└── NO (Es una operación técnica de acceso o modificación de datos)
    │
    ├── ¿La sentencia DML o el SELECT sobre solamente JSON involucra MÁS DE UNA TABLA en la misma sentencia SQL?
    │   │
    │   └── SÍ ──────────────────────────────────────────────────────► Pertenece a: pkgcn_<nombre_proceso>
    │                                                                 (Recibe pcl_json IN CLOB, usa JSON_VALUE.
    │                                                                  SOLAMENTE UN MÉTODO POR CADA SENTENCIA DML.
    │                                                                  Mínimo 2 tablas en la misma sentencia SQL o SELECT JSON.
    │                                                                  Sin sintaxis JOIN. Sin lógica de negocio ni COMMIT).
    │
    ├── ¿Es una operación CRUD directa sobre una única tabla
    │   identificando registros por PK o ROWID?
    │   │
    │   └── SÍ ──────────────────────────────────────────────────────► Pertenece a: pkg<tabla>_dao
    │                                                                 (Plantilla estándar oficial 18 métodos por PK/ROWID).
    │
    └── ¿La sentencia DML es sobre UNA SOLA TABLA pero NO es por el ID (ej. update/delete masivo por estado/fecha),
        o es una consulta/filtro multi-criterio sobre dicha tabla?
        │
        └── SÍ ──────────────────────────────────────────────────────► Pertenece a: pkgca_<nombre_tabla>
                                                                      (Recibe pcl_json IN CLOB, usa JSON_VALUE.
                                                                       SOLAMENTE UN MÉTODO POR CADA SENTENCIA DML.
                                                                       Los paquetes pkgca_ SOLO deben existir para la tabla
                                                                       correspondiente cuando su DML no es por el ID.
                                                                       Búsquedas SYS_REFCURSOR, sintaxis Oracle tradicional sin JOIN).
```

## Matriz Comparativa

| Pregunta Clave | DAO (`pkg<tabla>_dao`) | Acceso No-PK (`pkgca_<tabla>`) | Multi-Tabla (`pkgcn_<proceso>`) | Lógica de Negocio (`pkgln_<proceso>`) |
|---|---|---|---|---|
| ¿Accede directamente a una tabla por su PK/ROWID? | **SÍ (Exclusivo)** | NO | NO | NO (Vía DAO) |
| ¿Realiza búsquedas con filtros, fechas o estados sobre una tabla? | NO | **SÍ** | NO | NO (Vía pkgca_) |
| ¿Ejecuta sentencia DML sobre UNA SOLA TABLA cuando no es por ID? | NO | **SÍ (1 método por sentencia DML)** | NO | NO (Vía pkgca_) |
| ¿Ejecuta sentencias DML involucrando MÁS DE UNA TABLA? | NO | NO | **SÍ (1 método por sentencia DML)** | NO (Vía pkgcn_) |
| ¿Ejecuta sentencias SELECT multi-tabla sobre SOLAMENTE JSON nativo? | NO | NO | **SÍ** | NO (Vía pkgcn_) |
| ¿Retorna `SYS_REFCURSOR`? | Raro (Usa tipos DAO) | **SÍ (Estándar)** | SÍ (si aplica a proceso) | SÍ (delegando a pkgca_/pkgcn_) |
| ¿Contiene lógica de negocio y validaciones de caso de uso? | **NUNCA** | **NUNCA** | **NUNCA** | **SÍ (Exclusivo)** |
| ¿Controla la transacción (`p_do_commit` / `ROLLBACK`)? | **PROHIBIDO** | **PROHIBIDO** | **PROHIBIDO** | **OBLIGATORIO (`p_do_commit`)** |
| ¿Registra en `SMY_ERRORES` con `uti_ge_excepciones_pkg`? | Propaga | Propaga (salvo batch) | Propaga a `pkgln_` | **SÍ (Siempre en WHEN OTHERS)** |
