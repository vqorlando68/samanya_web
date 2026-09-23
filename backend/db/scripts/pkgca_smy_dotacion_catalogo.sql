-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_DOTACION_CATALOGO
-- FAMILIA: pkgca_ (Consultas avanzadas, filtros multi-criterio, SYS_REFCURSOR y JSON nativo sobre SMY_DOTACION_CATALOGO)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_DOTACION_CATALOGO
AS
    /**
     * Retorna cursor multi-fila con los elementos del catálogo general de dotación
     * Parámetro pcl_json: Documento JSON con filtros opcionales:
     * { "idOrganizacion": 1, "categoria": "Lencería", "estado": "ACTIVO", "esSugeridoIngreso": 1 }
     */
    PROCEDURE p_consultar_catalogo (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    );

    /**
     * Retorna el catálogo sugerido para ingreso en formato JSON nativo (CLOB)
     * Parámetro pcl_json: { "idOrganizacion": 1 }
     */
    FUNCTION f_obtener_catalogo_json (
        pcl_json    IN  CLOB
    ) RETURN CLOB;

END PKGCA_SMY_DOTACION_CATALOGO;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_DOTACION_CATALOGO
AS

    PROCEDURE p_consultar_catalogo (
        pcl_json    IN  CLOB,
        p_cursor    OUT SYS_REFCURSOR
    ) IS
        v_id_org        NUMBER;
        v_categoria     VARCHAR2(100);
        v_estado        VARCHAR2(20);
        v_es_sugerido   NUMBER;
    BEGIN
        v_id_org      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idOrganizacion'));
        v_categoria   := JSON_VALUE(pcl_json, '$.categoria');
        v_estado      := JSON_VALUE(pcl_json, '$.estado');
        v_es_sugerido := TO_NUMBER(JSON_VALUE(pcl_json, '$.esSugeridoIngreso'));

        -- Consulta con sintaxis tradicional Oracle (CERO ANSI JOIN)
        OPEN p_cursor FOR
            SELECT 
                dc.id,
                dc.id_organizacion,
                NVL(o.razon_social, 'General') AS organizacion,
                dc.nombre_elemento,
                dc.categoria,
                dc.cantidad_defecto,
                dc.frecuencia_cambio_meses,
                dc.descripcion,
                dc.es_sugerido_ingreso,
                dc.estado,
                TO_CHAR(dc.fecha_creacion, 'YYYY-MM-DD HH24:MI:SS') AS fecha_creacion
            FROM smy_dotacion_catalogo dc,
                 smy_organizaciones o
            WHERE dc.id_organizacion = o.id(+)
              AND (v_id_org IS NULL OR dc.id_organizacion = v_id_org OR dc.id_organizacion IS NULL)
              AND (v_categoria IS NULL OR dc.categoria = v_categoria)
              AND (v_estado IS NULL OR dc.estado = v_estado)
              AND (v_es_sugerido IS NULL OR dc.es_sugerido_ingreso = v_es_sugerido)
            ORDER BY dc.categoria, dc.nombre_elemento;
    END p_consultar_catalogo;

    FUNCTION f_obtener_catalogo_json (
        pcl_json    IN  CLOB
    ) RETURN CLOB IS
        v_id_org       NUMBER;
        vcl_resultado  CLOB;
    BEGIN
        v_id_org := TO_NUMBER(JSON_VALUE(pcl_json, '$.idOrganizacion'));

        SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                       'id'                    VALUE dc.id,
                       'idOrganizacion'        VALUE dc.id_organizacion,
                       'nombreElemento'        VALUE dc.nombre_elemento,
                       'categoria'             VALUE dc.categoria,
                       'cantidadDefecto'       VALUE dc.cantidad_defecto,
                       'frecuenciaCambioMeses' VALUE dc.frecuencia_cambio_meses,
                       'descripcion'           VALUE dc.descripcion,
                       'esSugeridoIngreso'     VALUE dc.es_sugerido_ingreso,
                       'estado'                VALUE dc.estado
                       RETURNING CLOB
                   )
                   RETURNING CLOB
               )
          INTO vcl_resultado
          FROM smy_dotacion_catalogo dc
         WHERE (v_id_org IS NULL OR dc.id_organizacion = v_id_org OR dc.id_organizacion IS NULL)
           AND dc.estado = 'ACTIVO'
           AND dc.es_sugerido_ingreso = 1;

        RETURN NVL(vcl_resultado, '[]');
    END f_obtener_catalogo_json;

END PKGCA_SMY_DOTACION_CATALOGO;
/
