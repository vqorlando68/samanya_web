-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_DOTACION_RESIDENTES
-- FAMILIA: pkgca_ (Consultas multi-criterio, SYS_REFCURSOR, alertas y DML mono-tabla no-PK)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_DOTACION_RESIDENTES
AS
    /**
     * Retorna cursor multi-fila con los elementos de dotación asignados a un residente
     * Parámetro pcl_json: { "idResidente": 1, "estadoElemento": "ENTREGADO" }
     */
    PROCEDURE p_consultar_por_residente (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    );

    /**
     * Retorna cursor multi-fila con las alertas de recambio de dotación (vencidos o próximos a vencer)
     * Parámetro pcl_json: { "idCentro": 1, "diasAnticipacion": 30 }
     */
    PROCEDURE p_consultar_alertas_recambio (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    );

    /**
     * Retorna cursor multi-fila con el historial de renovaciones/cambios de un elemento de dotación
     * Parámetro pcl_json: { "idDotacionResidente": 10 }
     */
    PROCEDURE p_consultar_historial (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    );

    /**
     * Sentencia DML mono-tabla no-PK: Actualiza el estado de toda la dotación de un residente
     * Parámetro pcl_json: { "idResidente": 1, "nuevoEstado": "RETIRADO", "idUsuario": 2 }
     */
    PROCEDURE p_actualizar_estado_por_residente (
        pcl_json    IN  CLOB
    );

END PKGCA_SMY_DOTACION_RESIDENTES;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_DOTACION_RESIDENTES
AS

    PROCEDURE p_consultar_por_residente (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    ) IS
        v_id_residente NUMBER;
        v_estado       VARCHAR2(30);
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_estado       := JSON_VALUE(pcl_json, '$.estadoElemento');

        -- Consulta con sintaxis tradicional Oracle (CERO JOIN ANSI)
        OPEN p_cursor FOR
            SELECT 
                dr.id,
                dr.id_residente,
                r.nombres || ' ' || r.apellidos AS nombre_residente,
                r.habitacion,
                r.cama,
                dr.id_elemento_catalogo,
                dr.nombre_elemento,
                dr.categoria,
                dr.cantidad,
                TO_CHAR(dr.fecha_entrega, 'YYYY-MM-DD') AS fecha_entrega,
                dr.frecuencia_cambio_meses,
                TO_CHAR(dr.fecha_proximo_cambio, 'YYYY-MM-DD') AS fecha_proximo_cambio,
                TO_CHAR(dr.fecha_ultimo_cambio, 'YYYY-MM-DD') AS fecha_ultimo_cambio,
                dr.estado_elemento,
                dr.condicion_entrega,
                dr.notas,
                dr.id_usuario_entrega,
                NVL(u.nombre_completo, 'Personal Administrativo') AS usuario_entrega,
                CASE 
                    WHEN dr.fecha_proximo_cambio IS NULL THEN NULL
                    ELSE TRUNC(dr.fecha_proximo_cambio - f_fecha_actual)
                END AS dias_para_cambio,
                CASE 
                    WHEN dr.estado_elemento IN ('SOLICITADO', 'EN TRAMITE') THEN 'SOLICITADO'
                    WHEN dr.fecha_proximo_cambio IS NULL THEN 'SIN_VENCIMIENTO'
                    WHEN dr.fecha_proximo_cambio < f_fecha_actual THEN 'VENCIDO'
                    WHEN dr.fecha_proximo_cambio <= (f_fecha_actual + 30) THEN 'PROXIMO'
                    ELSE 'VIGENTE'
                END AS semaforo_cambio
            FROM smy_dotacion_residentes dr,
                 smy_residentes r,
                 smy_usuarios u
            WHERE dr.id_residente = r.id
              AND dr.id_usuario_entrega = u.id(+)
              AND dr.id_residente = v_id_residente
              AND (v_estado IS NULL OR dr.estado_elemento = v_estado)
            ORDER BY 
                CASE 
                    WHEN dr.estado_elemento IN ('SOLICITADO', 'EN TRAMITE') THEN 1
                    WHEN dr.fecha_proximo_cambio IS NOT NULL AND dr.fecha_proximo_cambio < f_fecha_actual THEN 2
                    WHEN dr.fecha_proximo_cambio IS NOT NULL AND dr.fecha_proximo_cambio <= (f_fecha_actual + 30) THEN 3
                    ELSE 4
                END,
                dr.categoria,
                dr.nombre_elemento;
    END p_consultar_por_residente;

    PROCEDURE p_consultar_alertas_recambio (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    ) IS
        v_id_centro          NUMBER;
        v_dias_anticipacion  NUMBER;
    BEGIN
        v_id_centro         := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_dias_anticipacion := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.diasAnticipacion')), 30);

        OPEN p_cursor FOR
            SELECT 
                dr.id AS id_dotacion_residente,
                dr.id_residente,
                r.identificacion,
                r.nombres || ' ' || r.apellidos AS nombre_residente,
                r.habitacion,
                r.cama,
                c.id AS id_centro,
                c.nombre_centro,
                dr.nombre_elemento,
                dr.categoria,
                dr.cantidad,
                TO_CHAR(dr.fecha_entrega, 'YYYY-MM-DD') AS fecha_entrega,
                dr.frecuencia_cambio_meses,
                TO_CHAR(dr.fecha_proximo_cambio, 'YYYY-MM-DD') AS fecha_proximo_cambio,
                TRUNC(dr.fecha_proximo_cambio - f_fecha_actual) AS dias_restantes,
                CASE 
                    WHEN dr.fecha_proximo_cambio < f_fecha_actual THEN 'VENCIDO'
                    ELSE 'PROXIMO'
                END AS nivel_alerta
            FROM smy_dotacion_residentes dr,
                 smy_residentes r,
                 smy_centros c
            WHERE dr.id_residente = r.id
              AND r.id_centro = c.id
              AND r.id_estado_residente = 1 -- Residentes activos
              AND dr.estado_elemento = 'ENTREGADO'
              AND dr.fecha_proximo_cambio IS NOT NULL
              AND dr.fecha_proximo_cambio <= (f_fecha_actual + v_dias_anticipacion)
              AND (v_id_centro IS NULL OR r.id_centro = v_id_centro)
            ORDER BY dr.fecha_proximo_cambio ASC;
    END p_consultar_alertas_recambio;

    PROCEDURE p_consultar_historial (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    ) IS
        v_id_dotacion NUMBER;
    BEGIN
        v_id_dotacion := TO_NUMBER(JSON_VALUE(pcl_json, '$.idDotacionResidente'));

        OPEN p_cursor FOR
            SELECT 
                dh.id,
                dh.id_dotacion_residente,
                TO_CHAR(dh.fecha_cambio, 'YYYY-MM-DD HH24:MI') AS fecha_cambio,
                dh.motivo,
                dh.condicion_nuevo,
                dh.observaciones,
                NVL(u.nombre_completo, 'Personal de Turno') AS usuario_registra
            FROM smy_dotacion_historial dh,
                 smy_usuarios u
            WHERE dh.id_usuario_registra = u.id(+)
              AND dh.id_dotacion_residente = v_id_dotacion
            ORDER BY dh.fecha_cambio DESC;
    END p_consultar_historial;

    PROCEDURE p_actualizar_estado_por_residente (
        pcl_json    IN  CLOB
    ) IS
        v_id_residente NUMBER;
        v_nuevo_estado VARCHAR2(30);
        v_id_usuario   NUMBER;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_nuevo_estado := JSON_VALUE(pcl_json, '$.nuevoEstado');
        v_id_usuario   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));

        UPDATE smy_dotacion_residentes
           SET estado_elemento                 = v_nuevo_estado,
               id_usuario_ultima_modificacion  = v_id_usuario
         WHERE id_residente = v_id_residente;
    END p_actualizar_estado_por_residente;

END PKGCA_SMY_DOTACION_RESIDENTES;
/
