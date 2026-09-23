-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_DOTACION_RESIDENTES
-- PROCESO: Dotación de Ingreso, Inventario y Ciclos de Recambio de Residentes
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Lógica de Negocio)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_DOTACION_RESIDENTES
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_DOTACION_RESIDENTES
    || Propósito: Gestionar el flujo de negocio para entrega de dotación en el
    ||            momento del ingreso del residente (usando catálogo sugerido,
    ||            con opción de excluir o aumentar artículos), control de
    ||            fechas de cambio/reposición con cálculo automático, y registro
    ||            de historial de renovaciones periódicas.
    || Estándar: Sin sentencias DML directas, interacción vía DAOs por PK,
    ||           consultas vía pkgca_, commit controlado vía p_do_commit.
    || =========================================================================
    */

    /**
     * Consulta el catálogo de dotación disponible para configuración o selección
     */
    PROCEDURE pr_consultar_catalogo (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * Crea o actualiza un elemento del catálogo maestro de dotación
     */
    PROCEDURE pr_guardar_articulo_catalogo (
        pcl_json IN CLOB
    );

    /**
     * Consulta la dotación asignada a un residente específico con su semáforo de cambio
     */
    PROCEDURE pr_consultar_dotacion_residente (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    );

    /**
     * Registra la entrega inicial o paquete de dotación al ingresar el residente
     */
    PROCEDURE pr_registrar_entrega_ingreso (
        pcl_json IN CLOB
    );

    /**
     * Agrega un artículo adicional o personalizado a la dotación de un residente
     */
    PROCEDURE pr_agregar_articulo_residente (
        pcl_json IN CLOB
    );

    /**
     * Registra el recambio o renovación periódica de un artículo de dotación
     */
    PROCEDURE pr_registrar_recambio (
        pcl_json IN CLOB
    );

END PKGLN_DOTACION_RESIDENTES;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_DOTACION_RESIDENTES
AS

    PROCEDURE pr_consultar_catalogo (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        PKGCA_SMY_DOTACION_CATALOGO.p_consultar_catalogo(
            pcl_json => pcl_json,
            p_cursor => p_cursor
        );
    END pr_consultar_catalogo;

    PROCEDURE pr_guardar_articulo_catalogo (
        pcl_json IN CLOB
    ) IS
        v_id              NUMBER;
        v_id_org          NUMBER;
        v_nombre          VARCHAR2(150);
        v_categoria       VARCHAR2(100);
        v_cantidad        NUMBER;
        v_frecuencia      NUMBER;
        v_descripcion     VARCHAR2(500);
        v_es_sugerido     NUMBER;
        v_estado          VARCHAR2(20);
        v_id_usuario      NUMBER;
        vro_cat           smy_dotacion_catalogo%ROWTYPE;
        vro_error         smy_errores%ROWTYPE;
    BEGIN
        v_id          := TO_NUMBER(JSON_VALUE(pcl_json, '$.id'));
        v_id_org      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idOrganizacion'));
        v_nombre      := TRIM(JSON_VALUE(pcl_json, '$.nombreElemento'));
        v_categoria   := NVL(TRIM(JSON_VALUE(pcl_json, '$.categoria')), 'General');
        v_cantidad    := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.cantidadDefecto')), 1);
        v_frecuencia  := TO_NUMBER(JSON_VALUE(pcl_json, '$.frecuenciaCambioMeses'));
        v_descripcion := TRIM(JSON_VALUE(pcl_json, '$.descripcion'));
        v_es_sugerido := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.esSugeridoIngreso')), 1);
        v_estado      := NVL(TRIM(JSON_VALUE(pcl_json, '$.estado')), 'ACTIVO');
        v_id_usuario  := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));

        IF v_nombre IS NULL THEN
            RAISE_APPLICATION_ERROR(-20010, 'El nombre del elemento del catálogo es obligatorio.');
        END IF;

        IF v_id IS NOT NULL AND v_id > 0 THEN
            IF PKGSMY_DOTACION_CATALOGO_DAO.f_existe(v_id, vro_cat) = FALSE THEN
                RAISE_APPLICATION_ERROR(-20011, 'El elemento del catálogo especificado no existe.');
            END IF;

            vro_cat.nombre_elemento                := v_nombre;
            vro_cat.categoria                      := v_categoria;
            vro_cat.cantidad_defecto               := v_cantidad;
            vro_cat.frecuencia_cambio_meses        := v_frecuencia;
            vro_cat.descripcion                    := v_descripcion;
            vro_cat.es_sugerido_ingreso            := v_es_sugerido;
            vro_cat.estado                         := v_estado;
            vro_cat.id_usuario_ultima_modificacion := v_id_usuario;

            PKGSMY_DOTACION_CATALOGO_DAO.p_actualizar(vro_cat);
        ELSE
            vro_cat.id                             := SEQ_SMY_DOTACION_CATALOGO.NEXTVAL;
            vro_cat.id_organizacion                := v_id_org;
            vro_cat.nombre_elemento                := v_nombre;
            vro_cat.categoria                      := v_categoria;
            vro_cat.cantidad_defecto               := v_cantidad;
            vro_cat.frecuencia_cambio_meses        := v_frecuencia;
            vro_cat.descripcion                    := v_descripcion;
            vro_cat.es_sugerido_ingreso            := v_es_sugerido;
            vro_cat.estado                         := v_estado;
            vro_cat.fecha_creacion                 := f_fecha_actual;
            vro_cat.id_usuario_ultima_modificacion := v_id_usuario;

            PKGSMY_DOTACION_CATALOGO_DAO.p_insertar(vro_cat);
        END IF;

        p_do_commit('pkgln_dotacion_residentes.pr_guardar_articulo_catalogo');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_DOTACION_RESIDENTES';
            vro_error.nombre_metodo   := 'PR_GUARDAR_ARTICULO_CATALOGO';
            vro_error.parametros      := SUBSTR(pcl_json, 1, 4000);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_guardar_articulo_catalogo;

    PROCEDURE pr_consultar_dotacion_residente (
        pcl_json IN  CLOB,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        PKGCA_SMY_DOTACION_RESIDENTES.p_consultar_por_residente(
            pcl_json => pcl_json,
            p_cursor => p_cursor
        );
    END pr_consultar_dotacion_residente;

    PROCEDURE pr_registrar_entrega_ingreso (
        pcl_json IN CLOB
    ) IS
        v_id_residente    NUMBER;
        v_id_usuario      NUMBER;
        vro_residente     smy_residentes%ROWTYPE;
        vro_item          smy_dotacion_residentes%ROWTYPE;
        vro_error         smy_errores%ROWTYPE;
        v_fecha_hoy       DATE;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_id_usuario   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));
        v_fecha_hoy    := f_fecha_actual;

        IF v_id_residente IS NULL THEN
            RAISE_APPLICATION_ERROR(-20012, 'El identificador del residente es obligatorio para registrar su dotación.');
        END IF;

        IF PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente, vro_residente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20013, 'El residente especificado no existe.');
        END IF;

        -- Iterar por cada artículo entregado (proveniente del catálogo sugerido o personalizado)
        FOR r_art IN (
            SELECT id_elemento_catalogo,
                   nombre_elemento,
                   categoria,
                   cantidad,
                   frecuencia_cambio_meses,
                   condicion_entrega,
                   notas
            FROM JSON_TABLE(pcl_json, '$.articulos[*]'
                COLUMNS (
                    id_elemento_catalogo    NUMBER        PATH '$.idElementoCatalogo',
                    nombre_elemento         VARCHAR2(150) PATH '$.nombreElemento',
                    categoria               VARCHAR2(100) PATH '$.categoria',
                    cantidad                NUMBER        PATH '$.cantidad',
                    frecuencia_cambio_meses NUMBER        PATH '$.frecuenciaCambioMeses',
                    condicion_entrega       VARCHAR2(50)  PATH '$.condicionEntrega',
                    notas                   VARCHAR2(500) PATH '$.notas'
                )
            )
        ) LOOP
            IF TRIM(r_art.nombre_elemento) IS NOT NULL AND NVL(r_art.cantidad, 0) > 0 THEN
                vro_item.id                             := SEQ_SMY_DOTACION_RESIDENTES.NEXTVAL;
                vro_item.id_residente                   := v_id_residente;
                vro_item.id_elemento_catalogo           := r_art.id_elemento_catalogo;
                vro_item.nombre_elemento                := TRIM(r_art.nombre_elemento);
                vro_item.categoria                      := NVL(TRIM(r_art.categoria), 'General');
                vro_item.cantidad                       := NVL(r_art.cantidad, 1);
                vro_item.fecha_entrega                  := v_fecha_hoy;
                vro_item.frecuencia_cambio_meses        := r_art.frecuencia_cambio_meses;
                
                -- Cálculo de fecha de próximo recambio según periodicidad en meses
                IF r_art.frecuencia_cambio_meses IS NOT NULL AND r_art.frecuencia_cambio_meses > 0 THEN
                    vro_item.fecha_proximo_cambio       := ADD_MONTHS(v_fecha_hoy, r_art.frecuencia_cambio_meses);
                ELSE
                    vro_item.fecha_proximo_cambio       := NULL;
                END IF;

                vro_item.estado_elemento                := 'ENTREGADO';
                vro_item.condicion_entrega              := NVL(TRIM(r_art.condicion_entrega), 'Nuevo');
                vro_item.notas                          := TRIM(r_art.notas);
                vro_item.id_usuario_entrega             := v_id_usuario;
                vro_item.fecha_ultimo_cambio            := v_fecha_hoy;
                vro_item.fecha_creacion                 := v_fecha_hoy;
                vro_item.id_usuario_ultima_modificacion := v_id_usuario;

                PKGSMY_DOTACION_RESIDENTES_DAO.p_insertar(vro_item);
            END IF;
        END LOOP;

        p_do_commit('pkgln_dotacion_residentes.pr_registrar_entrega_ingreso');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_DOTACION_RESIDENTES';
            vro_error.nombre_metodo   := 'PR_REGISTRAR_ENTREGA_INGRESO';
            vro_error.parametros      := SUBSTR(pcl_json, 1, 4000);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_entrega_ingreso;

    PROCEDURE pr_agregar_articulo_residente (
        pcl_json IN CLOB
    ) IS
        v_id_residente    NUMBER;
        v_id_catalogo     NUMBER;
        v_nombre          VARCHAR2(150);
        v_categoria       VARCHAR2(100);
        v_cantidad        NUMBER;
        v_frecuencia      NUMBER;
        v_condicion       VARCHAR2(50);
        v_notas           VARCHAR2(500);
        v_id_usuario      NUMBER;
        v_fecha_hoy       DATE;
        vro_residente     smy_residentes%ROWTYPE;
        vro_item          smy_dotacion_residentes%ROWTYPE;
        vro_error         smy_errores%ROWTYPE;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));
        v_id_catalogo  := TO_NUMBER(JSON_VALUE(pcl_json, '$.idElementoCatalogo'));
        v_nombre       := TRIM(JSON_VALUE(pcl_json, '$.nombreElemento'));
        v_categoria    := NVL(TRIM(JSON_VALUE(pcl_json, '$.categoria')), 'General');
        v_cantidad     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.cantidad')), 1);
        v_frecuencia   := TO_NUMBER(JSON_VALUE(pcl_json, '$.frecuenciaCambioMeses'));
        v_condicion    := NVL(TRIM(JSON_VALUE(pcl_json, '$.condicionEntrega')), 'Nuevo');
        v_notas        := TRIM(JSON_VALUE(pcl_json, '$.notas'));
        v_id_usuario   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));
        v_fecha_hoy    := f_fecha_actual;

        IF v_id_residente IS NULL THEN
            RAISE_APPLICATION_ERROR(-20014, 'El identificador del residente es obligatorio.');
        END IF;

        IF v_nombre IS NULL THEN
            RAISE_APPLICATION_ERROR(-20015, 'El nombre del artículo a entregar es obligatorio.');
        END IF;

        IF PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente, vro_residente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20016, 'El residente especificado no existe.');
        END IF;

        vro_item.id                             := SEQ_SMY_DOTACION_RESIDENTES.NEXTVAL;
        vro_item.id_residente                   := v_id_residente;
        vro_item.id_elemento_catalogo           := v_id_catalogo;
        vro_item.nombre_elemento                := v_nombre;
        vro_item.categoria                      := v_categoria;
        vro_item.cantidad                       := v_cantidad;
        vro_item.fecha_entrega                  := v_fecha_hoy;
        vro_item.frecuencia_cambio_meses        := v_frecuencia;

        IF v_frecuencia IS NOT NULL AND v_frecuencia > 0 THEN
            vro_item.fecha_proximo_cambio       := ADD_MONTHS(v_fecha_hoy, v_frecuencia);
        ELSE
            vro_item.fecha_proximo_cambio       := NULL;
        END IF;

        vro_item.estado_elemento                := 'ENTREGADO';
        vro_item.condicion_entrega              := v_condicion;
        vro_item.notas                          := v_notas;
        vro_item.id_usuario_entrega             := v_id_usuario;
        vro_item.fecha_ultimo_cambio            := v_fecha_hoy;
        vro_item.fecha_creacion                 := v_fecha_hoy;
        vro_item.id_usuario_ultima_modificacion := v_id_usuario;

        PKGSMY_DOTACION_RESIDENTES_DAO.p_insertar(vro_item);

        p_do_commit('pkgln_dotacion_residentes.pr_agregar_articulo_residente');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_DOTACION_RESIDENTES';
            vro_error.nombre_metodo   := 'PR_AGREGAR_ARTICULO_RESIDENTE';
            vro_error.parametros      := SUBSTR(pcl_json, 1, 4000);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_agregar_articulo_residente;

    PROCEDURE pr_registrar_recambio (
        pcl_json IN CLOB
    ) IS
        v_id_dotacion    NUMBER;
        v_motivo         VARCHAR2(200);
        v_condicion_nv   VARCHAR2(50);
        v_observaciones  VARCHAR2(500);
        v_id_usuario     NUMBER;
        v_fecha_hoy      DATE;
        vro_dotacion     smy_dotacion_residentes%ROWTYPE;
        vro_historial    smy_dotacion_historial%ROWTYPE;
        vro_error        smy_errores%ROWTYPE;
    BEGIN
        v_id_dotacion   := TO_NUMBER(JSON_VALUE(pcl_json, '$.idDotacionResidente'));
        v_motivo        := NVL(TRIM(JSON_VALUE(pcl_json, '$.motivo')), 'Cumplimiento de ciclo de recambio programado');
        v_condicion_nv  := NVL(TRIM(JSON_VALUE(pcl_json, '$.condicionNuevo')), 'Nuevo de paquete');
        v_observaciones := TRIM(JSON_VALUE(pcl_json, '$.observaciones'));
        v_id_usuario    := TO_NUMBER(JSON_VALUE(pcl_json, '$.idUsuario'));
        v_fecha_hoy     := f_fecha_actual;

        IF v_id_dotacion IS NULL THEN
            RAISE_APPLICATION_ERROR(-20017, 'El identificador del registro de dotación es obligatorio.');
        END IF;

        IF PKGSMY_DOTACION_RESIDENTES_DAO.f_existe(v_id_dotacion, vro_dotacion) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20018, 'El artículo de dotación del residente no existe.');
        END IF;

        -- 1. Grabar evento en el historial de recambios
        vro_historial.id                     := SEQ_SMY_DOTACION_HISTORIAL.NEXTVAL;
        vro_historial.id_dotacion_residente  := v_id_dotacion;
        vro_historial.fecha_cambio           := v_fecha_hoy;
        vro_historial.motivo                 := v_motivo;
        vro_historial.condicion_nuevo        := v_condicion_nv;
        vro_historial.observaciones          := v_observaciones;
        vro_historial.id_usuario_registra    := v_id_usuario;
        vro_historial.fecha_creacion         := v_fecha_hoy;

        PKGSMY_DOTACION_HISTORIAL_DAO.p_insertar(vro_historial);

        -- 2. Actualizar el registro de dotación con la nueva fecha y próximo vencimiento
        vro_dotacion.fecha_ultimo_cambio            := v_fecha_hoy;
        vro_dotacion.condicion_entrega              := v_condicion_nv;
        vro_dotacion.id_usuario_ultima_modificacion := v_id_usuario;

        IF vro_dotacion.frecuencia_cambio_meses IS NOT NULL AND vro_dotacion.frecuencia_cambio_meses > 0 THEN
            vro_dotacion.fecha_proximo_cambio := ADD_MONTHS(v_fecha_hoy, vro_dotacion.frecuencia_cambio_meses);
        ELSE
            vro_dotacion.fecha_proximo_cambio := NULL;
        END IF;

        PKGSMY_DOTACION_RESIDENTES_DAO.p_actualizar(vro_dotacion);

        p_do_commit('pkgln_dotacion_residentes.pr_registrar_recambio');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_DOTACION_RESIDENTES';
            vro_error.nombre_metodo   := 'PR_REGISTRAR_RECAMBIO';
            vro_error.parametros      := SUBSTR(pcl_json, 1, 4000);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_recambio;

END PKGLN_DOTACION_RESIDENTES;
/
