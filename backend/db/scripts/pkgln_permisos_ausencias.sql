-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_PERMISOS_AUSENCIAS
-- PROCESO: Solicitud, Aprobación y Gestión de Permisos, Bajas e Incapacidades
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Lógica de Negocio)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_PERMISOS_AUSENCIAS
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_PERMISOS_AUSENCIAS
    || Propósito: Gestionar el flujo de aprobación o rechazo de solicitudes de
    ||            ausencias, vacaciones e incapacidades médicas del personal.
    || Estándar: Sin DML directos, parámetros CLOB JSON, uso exclusivo de DAOs
    ||           y p_do_commit para control transaccional.
    || =========================================================================
    */

    /**
     * Aprueba o rechaza una solicitud de permiso y actualiza el estado del colaborador
     * Parámetro pcl_json:
     * {
     *   "idSolicitud": 401,
     *   "idEstadoPermiso": 2, // 2 = Aprobado, 3 = Rechazado
     *   "comentariosAdmin": "Aprobada incapacidad médica por 3 días."
     * }
     */
    PROCEDURE pr_gestionar_solicitud_permiso (
        pcl_json IN CLOB
    );

END PKGLN_PERMISOS_AUSENCIAS;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_PERMISOS_AUSENCIAS
AS
    vro_error smy_errores%ROWTYPE;

    PROCEDURE pr_gestionar_solicitud_permiso (
        pcl_json IN CLOB
    ) IS
        v_id_solicitud       smy_solicitudes_permisos.id%TYPE;
        v_id_estado_permiso  smy_solicitudes_permisos.id_estado_permiso%TYPE;
        v_comentarios        VARCHAR2(500);

        vro_permiso          smy_solicitudes_permisos%ROWTYPE;
        vro_empleado         smy_empleados%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_solicitud      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idSolicitud'));
        v_id_estado_permiso := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoPermiso'));
        v_comentarios       := TRIM(JSON_VALUE(pcl_json, '$.comentariosAdmin'));

        -- 2. Validaciones de negocio
        IF v_id_solicitud IS NULL OR v_id_estado_permiso IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'Identificador de la solicitud y nuevo estado son obligatorios.');
        END IF;

        IF PKGSMY_SOLICITUDES_PERMISOS_DAO.f_existe(v_id_solicitud, vro_permiso) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20002, 'La solicitud de permiso indicada no existe.');
        END IF;

        -- 3. Actualizar solicitud vía DAO
        vro_permiso.id_estado_permiso   := v_id_estado_permiso;
        vro_permiso.observaciones_admin := v_comentarios;
        vro_permiso.fecha_respuesta     := f_fecha_actual;

        PKGSMY_SOLICITUDES_PERMISOS_DAO.p_actualizar(vro_permiso);

        -- 4. Si la solicitud fue aprobada (estado = 2), actualizar estado del trabajador a 'En Permiso' (2)
        IF v_id_estado_permiso = 2 THEN
            IF PKGSMY_EMPLEADOS_DAO.f_existe(vro_permiso.id_empleado, vro_empleado) = TRUE THEN
                vro_empleado.id_estado_empleado := 2; -- En Permiso
                PKGSMY_EMPLEADOS_DAO.p_actualizar(vro_empleado);
            END IF;
        END IF;

        -- 5. Commit controlado
        p_do_commit('pkgln_permisos_ausencias.pr_gestionar_solicitud_permiso');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_PERMISOS_AUSENCIAS';
            vro_error.nombre_metodo   := 'PR_GESTIONAR_SOLICITUD_PERMISO';
            vro_error.parametros      := SUBSTR(pcl_json, 1, 4000);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_gestionar_solicitud_permiso;

END PKGLN_PERMISOS_AUSENCIAS;
/
