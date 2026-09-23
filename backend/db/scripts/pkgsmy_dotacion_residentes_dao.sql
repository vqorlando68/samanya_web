-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO DAO: PKGSMY_DOTACION_RESIDENTES_DAO
-- TABLA: SMY_DOTACION_RESIDENTES
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Plantilla oficial 18 métodos)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGSMY_DOTACION_RESIDENTES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_DOTACION_RESIDENTES_DAO
    || Propósito: Capa de acceso a datos exclusiva para la tabla SMY_DOTACION_RESIDENTES
    || Estándar: Plantilla oficial DAO PL/SQL Oracle por PK/ROWID sin COMMIT
    || =========================================================================
    */

    -- Tipo de colección estándar para registros de la tabla
    TYPE ta_smy_dotacion_residentes IS TABLE OF smy_dotacion_residentes%ROWTYPE INDEX BY BINARY_INTEGER;

    -- 1. Insertar registro
    PROCEDURE p_insertar (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE
    );

    -- 2. Traer registro por PK
    FUNCTION f_traer (
        pty_id IN smy_dotacion_residentes.id%TYPE
    ) RETURN smy_dotacion_residentes%ROWTYPE;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_dotacion_residentes OUT PKGSMY_DOTACION_RESIDENTES_DAO.ta_smy_dotacion_residentes
    );

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    );

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_dotacion_residentes.id%TYPE
    );

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_dotacion_residentes.id%TYPE
    ) RETURN BOOLEAN;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id                      IN  smy_dotacion_residentes.id%TYPE,
        pro_smy_dotacion_residentes OUT smy_dotacion_residentes%ROWTYPE
    ) RETURN BOOLEAN;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id                      IN  smy_dotacion_residentes.id%TYPE,
        pro_smy_dotacion_residentes OUT smy_dotacion_residentes%ROWTYPE,
        p_rowid                     OUT VARCHAR2
    ) RETURN BOOLEAN;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid                     IN  VARCHAR2,
        pro_smy_dotacion_residentes OUT smy_dotacion_residentes%ROWTYPE
    ) RETURN BOOLEAN;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE
    );

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE,
        pty_id                      IN smy_dotacion_residentes.id%TYPE
    );

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE,
        p_rowid                     IN VARCHAR2
    );

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE
    );

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_dotacion_residentes IN OUT smy_dotacion_residentes%ROWTYPE
    );

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id                           IN  smy_dotacion_residentes.id%TYPE,
        p_json_smy_dotacion_residentes OUT CLOB
    ) RETURN NUMBER;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_dotacion_residentes.id%TYPE
    ) RETURN CLOB;

END PKGSMY_DOTACION_RESIDENTES_DAO;
/

CREATE OR REPLACE PACKAGE BODY PKGSMY_DOTACION_RESIDENTES_DAO
AS
    /*
    || =========================================================================
    || Paquete: PKGSMY_DOTACION_RESIDENTES_DAO (Body)
    || Propósito: Implementación de operaciones CRUD para SMY_DOTACION_RESIDENTES
    || Reglas: Sin COMMIT/ROLLBACK, sin lógica de negocio, manejo nativo de JSON
    || =========================================================================
    */

    -- 1. Insertar
    PROCEDURE p_insertar (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE
    )
    IS
    BEGIN
        INSERT INTO smy_dotacion_residentes VALUES pro_smy_dotacion_residentes;
    END p_insertar;

    -- 2. Traer por PK
    FUNCTION f_traer (
        pty_id IN smy_dotacion_residentes.id%TYPE
    ) RETURN smy_dotacion_residentes%ROWTYPE
    IS
        v_registro smy_dotacion_residentes%ROWTYPE;
    BEGIN
        SELECT *
          INTO v_registro
          FROM smy_dotacion_residentes
         WHERE id = pty_id;

        RETURN v_registro;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_traer;

    -- 3. Consultar todos los registros
    PROCEDURE p_consultar_registros (
        pta_smy_dotacion_residentes OUT PKGSMY_DOTACION_RESIDENTES_DAO.ta_smy_dotacion_residentes
    )
    IS
    BEGIN
        SELECT *
          BULK COLLECT INTO pta_smy_dotacion_residentes
          FROM smy_dotacion_residentes;
    END p_consultar_registros;

    -- 4. Eliminar por ROWID
    PROCEDURE p_eliminar_rowid (
        p_rowid IN VARCHAR2
    )
    IS
    BEGIN
        DELETE FROM smy_dotacion_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_eliminar_rowid;

    -- 5. Eliminar por PK
    PROCEDURE p_eliminar (
        pty_id IN smy_dotacion_residentes.id%TYPE
    )
    IS
    BEGIN
        DELETE FROM smy_dotacion_residentes
         WHERE id = pty_id;
    END p_eliminar;

    -- 6. Eliminar todos los registros
    PROCEDURE p_eliminar_registros
    IS
    BEGIN
        DELETE FROM smy_dotacion_residentes;
    END p_eliminar_registros;

    -- 7. Verificar existencia por PK
    FUNCTION f_existe (
        pty_id IN smy_dotacion_residentes.id%TYPE
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_dotacion_residentes
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 8. Verificar existencia y retornar registro
    FUNCTION f_existe (
        pty_id                      IN  smy_dotacion_residentes.id%TYPE,
        pro_smy_dotacion_residentes OUT smy_dotacion_residentes%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_dotacion_residentes
          FROM smy_dotacion_residentes
         WHERE id = pty_id;

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe;

    -- 9. Verificar existencia, retornar registro y ROWID
    FUNCTION f_existe (
        pty_id                      IN  smy_dotacion_residentes.id%TYPE,
        pro_smy_dotacion_residentes OUT smy_dotacion_residentes%ROWTYPE,
        p_rowid                     OUT VARCHAR2
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT ROWIDTOCHAR(ROWID)
          INTO p_rowid
          FROM smy_dotacion_residentes
         WHERE id = pty_id;

        SELECT *
          INTO pro_smy_dotacion_residentes
          FROM smy_dotacion_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_rowid := NULL;
            RETURN FALSE;
    END f_existe;

    -- 10. Verificar existencia por ROWID
    FUNCTION f_existe_rowid (
        p_rowid IN VARCHAR2
    ) RETURN BOOLEAN
    IS
        v_dummy NUMBER;
    BEGIN
        SELECT 1
          INTO v_dummy
          FROM smy_dotacion_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 11. Verificar existencia por ROWID y retornar registro
    FUNCTION f_existe_rowid (
        p_rowid                     IN  VARCHAR2,
        pro_smy_dotacion_residentes OUT smy_dotacion_residentes%ROWTYPE
    ) RETURN BOOLEAN
    IS
    BEGIN
        SELECT *
          INTO pro_smy_dotacion_residentes
          FROM smy_dotacion_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);

        RETURN TRUE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END f_existe_rowid;

    -- 12. Actualizar por registro
    PROCEDURE p_actualizar (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_dotacion_residentes
           SET ROW = pro_smy_dotacion_residentes
         WHERE id = pro_smy_dotacion_residentes.id;
    END p_actualizar;

    -- 13. Actualizar indicando PK
    PROCEDURE p_actualizar (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE,
        pty_id                      IN smy_dotacion_residentes.id%TYPE
    )
    IS
    BEGIN
        UPDATE smy_dotacion_residentes
           SET ROW = pro_smy_dotacion_residentes
         WHERE id = pty_id;
    END p_actualizar;

    -- 14. Actualizar por ROWID
    PROCEDURE p_actualizar_rowid (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE,
        p_rowid                     IN VARCHAR2
    )
    IS
    BEGIN
        UPDATE smy_dotacion_residentes
           SET ROW = pro_smy_dotacion_residentes
         WHERE ROWID = CHARTOROWID(p_rowid);
    END p_actualizar_rowid;

    -- 15. Actualizar todos los registros
    PROCEDURE p_actualizar_registros (
        pro_smy_dotacion_residentes IN smy_dotacion_residentes%ROWTYPE
    )
    IS
    BEGIN
        UPDATE smy_dotacion_residentes
           SET ROW = pro_smy_dotacion_residentes;
    END p_actualizar_registros;

    -- 16. Obtener valores por defecto
    PROCEDURE p_valores_defecto (
        pro_smy_dotacion_residentes IN OUT smy_dotacion_residentes%ROWTYPE
    )
    IS
    BEGIN
        pro_smy_dotacion_residentes.cantidad          := NVL(pro_smy_dotacion_residentes.cantidad, 1);
        pro_smy_dotacion_residentes.estado_elemento   := NVL(pro_smy_dotacion_residentes.estado_elemento, 'Entregado');
        pro_smy_dotacion_residentes.condicion_entrega := NVL(pro_smy_dotacion_residentes.condicion_entrega, 'Nuevo');
        pro_smy_dotacion_residentes.fecha_entrega     := NVL(pro_smy_dotacion_residentes.fecha_entrega, f_fecha_actual);
        pro_smy_dotacion_residentes.fecha_creacion    := NVL(pro_smy_dotacion_residentes.fecha_creacion, f_fecha_actual);
    END p_valores_defecto;

    -- 17. Verificar existencia y retornar JSON
    FUNCTION f_existe_json (
        p_id                           IN  smy_dotacion_residentes.id%TYPE,
        p_json_smy_dotacion_residentes OUT CLOB
    ) RETURN NUMBER
    IS
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_residente' VALUE t.id_residente,
                   'id_elemento_catalogo' VALUE t.id_elemento_catalogo,
                   'nombre_elemento' VALUE t.nombre_elemento,
                   'categoria' VALUE t.categoria,
                   'cantidad' VALUE t.cantidad,
                   'fecha_entrega' VALUE TO_CHAR(t.fecha_entrega, 'YYYY-MM-DD'),
                   'frecuencia_cambio_meses' VALUE t.frecuencia_cambio_meses,
                   'fecha_proximo_cambio' VALUE TO_CHAR(t.fecha_proximo_cambio, 'YYYY-MM-DD'),
                   'estado_elemento' VALUE t.estado_elemento,
                   'condicion_entrega' VALUE t.condicion_entrega,
                   'notas' VALUE t.notas,
                   'id_usuario_entrega' VALUE t.id_usuario_entrega,
                   'fecha_ultimo_cambio' VALUE TO_CHAR(t.fecha_ultimo_cambio, 'YYYY-MM-DD'),
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO p_json_smy_dotacion_residentes
          FROM smy_dotacion_residentes t
         WHERE t.id = p_id;

        RETURN 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_json_smy_dotacion_residentes := NULL;
            RETURN 0;
    END f_existe_json;

    -- 18. Obtener JSON por PK (Retorna CLOB nativo)
    FUNCTION f_json (
        p_id IN smy_dotacion_residentes.id%TYPE
    ) RETURN CLOB
    IS
        v_json CLOB;
    BEGIN
        SELECT JSON_OBJECT(
                   'id' VALUE t.id,
                   'id_residente' VALUE t.id_residente,
                   'id_elemento_catalogo' VALUE t.id_elemento_catalogo,
                   'nombre_elemento' VALUE t.nombre_elemento,
                   'categoria' VALUE t.categoria,
                   'cantidad' VALUE t.cantidad,
                   'fecha_entrega' VALUE TO_CHAR(t.fecha_entrega, 'YYYY-MM-DD'),
                   'frecuencia_cambio_meses' VALUE t.frecuencia_cambio_meses,
                   'fecha_proximo_cambio' VALUE TO_CHAR(t.fecha_proximo_cambio, 'YYYY-MM-DD'),
                   'estado_elemento' VALUE t.estado_elemento,
                   'condicion_entrega' VALUE t.condicion_entrega,
                   'notas' VALUE t.notas,
                   'id_usuario_entrega' VALUE t.id_usuario_entrega,
                   'fecha_ultimo_cambio' VALUE TO_CHAR(t.fecha_ultimo_cambio, 'YYYY-MM-DD'),
                   'fecha_creacion' VALUE TO_CHAR(t.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS'),
                   'id_usuario_ultima_modificacion' VALUE t.id_usuario_ultima_modificacion
                   RETURNING CLOB
               )
          INTO v_json
          FROM smy_dotacion_residentes t
         WHERE t.id = p_id;

        RETURN v_json;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END f_json;

END PKGSMY_DOTACION_RESIDENTES_DAO;
/
