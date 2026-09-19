-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCN_DASHBOARD_ADMINISTRADOR
-- FAMILIA: pkgcn_ (Consultas y sentencias multi-tabla que generan JSON CLOB o cursores)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCN_DASHBOARD_ADMINISTRADOR
AS
    /*
    || =========================================================================
    || Paquete: PKGCN_DASHBOARD_ADMINISTRADOR
    || Propósito: Sentencias SQL multi-tabla y generación de JSON CLOB / cursores
    ||            para el proceso de Dashboard del Administrador de Centro Médico.
    || Estándar: oracle-plsql-architecture (Familia pkgcn_ por proceso multi-tabla)
    || Reglas:
    || 1. Parámetro de entrada exclusivamente en formato pcl_json IN CLOB.
    || 2. Nomenclatura SQL tradicional SIN cláusula JOIN (unión vía WHERE y (+)).
    || 3. Generación nativa de JSON en UNA SOLA sentencia SELECT con JSON_OBJECT RETURNING CLOB.
    || 4. Sin lógica de negocio ni COMMIT / ROLLBACK.
    || =========================================================================
    */

    /**
     * Retorna el resumen consolidado del dashboard en formato JSON nativo (CLOB)
     * Ejecuta una ÚNICA sentencia SELECT multi-tabla proyectando el documento JSON.
     * Parámetro pcl_json: { "idCentro": 1 }
     */
    FUNCTION fn_obtener_resumen_json (
        pcl_json IN CLOB
    ) RETURN CLOB;

    /**
     * Retorna cursor multi-tabla con las alertas operativas prioritarias del turno activo
     * Parámetro pcl_json: { "idCentro": 1 }
     */
    PROCEDURE pr_consultar_alertas_prioritarias (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

END PKGCN_DASHBOARD_ADMINISTRADOR;
/

CREATE OR REPLACE PACKAGE BODY PKGCN_DASHBOARD_ADMINISTRADOR
AS

    FUNCTION fn_obtener_resumen_json (
        pcl_json IN CLOB
    ) RETURN CLOB
    IS
        vcl_resultado CLOB;
    BEGIN
        -- Sentencia SELECT ÚNICA multi-tabla sobre solamente JSON nativo (RETURNING CLOB)
        SELECT JSON_OBJECT(
                   'idCentro'            VALUE c.id,
                   'nombreCentro'        VALUE c.nombre_centro,
                   'capacidadTotal'      VALUE NVL(c.capacidad_residentes, 40),
                   'totalResidentes'     VALUE (
                       SELECT COUNT(1)
                         FROM smy_residentes r
                        WHERE r.id_centro = c.id
                          AND r.id_estado_residente = 1
                   ),
                   'porcentajeOcupacion' VALUE CASE
                                            WHEN NVL(c.capacidad_residentes, 0) > 0 THEN
                                                ROUND((
                                                    (SELECT COUNT(1)
                                                       FROM smy_residentes r
                                                      WHERE r.id_centro = c.id
                                                        AND r.id_estado_residente = 1) / c.capacidad_residentes
                                                ) * 100)
                                            ELSE 0
                                         END,
                   'personalActivoTurno' VALUE (
                       SELECT COUNT(1)
                         FROM smy_turnos_asignados ta,
                              smy_empleados e
                        WHERE ta.id_empleado = e.id
                          AND e.id_centro = c.id
                          AND ta.id_estado_turno = 1
                          AND TRUNC(ta.fecha_turno) = TRUNC(f_fecha_actual)
                   ),
                   'permisosPendientes'  VALUE (
                       SELECT COUNT(1)
                         FROM smy_solicitudes_permisos sp,
                              smy_empleados e
                        WHERE sp.id_empleado = e.id
                          AND e.id_centro = c.id
                          AND sp.id_estado_permiso = 1
                   ),
                   'incidentesActivos'   VALUE (
                       SELECT COUNT(DISTINCT i.id)
                         FROM smy_incidentes i,
                              smy_incidente_residentes ir,
                              smy_residentes r
                        WHERE i.id = ir.id_incidente
                          AND ir.id_residente = r.id
                          AND r.id_centro = c.id
                          AND i.id_estado_incidente IN (1, 2)
                   ),
                   'fechaGeneracion'     VALUE TO_CHAR(f_fecha_actual, 'YYYY-MM-DD"T"HH24:MI:SS')
                   RETURNING CLOB
               )
          INTO vcl_resultado
          FROM smy_centros c
         WHERE c.id = TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));

        RETURN vcl_resultado;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END fn_obtener_resumen_json;

    PROCEDURE pr_consultar_alertas_prioritarias (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_id_centro smy_centros.id%TYPE;
    BEGIN
        v_id_centro := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));

        -- Consulta multi-tabla tradicional Oracle (CERO JOIN)
        OPEN p_cursor FOR
            SELECT i.id,
                   r.id_centro,
                   r.nombres || ' ' || r.apellidos AS nombre_residente,
                   r.habitacion,
                   ti.nombre_tipo_incidente AS tipo_incidente,
                   si.nombre_severidad_incidente AS severidad,
                   i.descripcion,
                   i.acciones_tomadas,
                   i.fecha_hora_evento AS fecha_incidente
              FROM smy_incidentes i,
                   smy_incidente_residentes ir,
                   smy_residentes r,
                   smy_tipos_incidentes ti,
                   smy_severidades_incidentes si
             WHERE i.id = ir.id_incidente
               AND ir.id_residente = r.id
               AND i.id_tipo_incidente = ti.id(+)
               AND i.id_severidad_incidente = si.id(+)
               AND r.id_centro = v_id_centro
               AND i.id_estado_incidente IN (1, 2)
             ORDER BY i.fecha_hora_evento DESC;
    END pr_consultar_alertas_prioritarias;

END PKGCN_DASHBOARD_ADMINISTRADOR;
/
