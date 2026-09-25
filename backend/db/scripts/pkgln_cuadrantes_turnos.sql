-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_CUADRANTES_TURNOS
-- PROCESO: Programación de Horarios, Asignación de Turnos y Control de Cobertura
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Lógica de Negocio)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_CUADRANTES_TURNOS
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_CUADRANTES_TURNOS
    || Propósito: Gestionar la planificación de turnos de personal asistencial,
    ||            asignación de empleados por fecha y verificación de reglas de
    ||            cobertura mínima de cuidadores y enfermería.
    || REGLA ESTRICTA ARQUITECTÓNICA:
    || - CERO sentencias SELECT directas sobre tablas (se delegan en pkgca_ / DAOs).
    || - CERO sentencias DML directas (INSERT, UPDATE, DELETE).
    || - Control transaccional mediante p_do_commit al éxito y ROLLBACK al fallo.
    || =========================================================================
    */

    /**
     * Asigna un trabajador a una franja de turno en una fecha determinada
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "idTrabajador": 202,
     *   "idTurno": 301,
     *   "fechaTurno": "2025-02-18",
     *   "observaciones": "Asignacion de guardia matutina"
     * }
     */
    PROCEDURE pr_asignar_turno_trabajador (
        pcl_json IN CLOB
    );

    /**
     * Retorna la validación de cobertura mínima para un turno en una fecha delegando en pkgca_
     * Parámetro pcl_json: { "idTurno": 301, "fecha": "2025-02-18" }
     */
    FUNCTION f_validar_cobertura_json (
        pcl_json IN CLOB
    ) RETURN CLOB;

    /**
     * Programa turnos por rango de fechas para uno o varios colaboradores activos
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "idTurno": 301,
     *   "fechaInicio": "2026-09-24",
     *   "fechaFin": "2026-09-30",
     *   "colaboradores": [201, 202, 203],
     *   "observaciones": "Ronda programada"
     * }
     */
    PROCEDURE pr_programar_turnos_rango (
        pcl_json IN CLOB
    );

END PKGLN_CUADRANTES_TURNOS;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_CUADRANTES_TURNOS
AS
    vro_error smy_errores%ROWTYPE;

    PROCEDURE pr_asignar_turno_trabajador (
        pcl_json IN CLOB
    ) IS
        v_id_trabajador smy_empleados.id%TYPE;
        v_id_turno      smy_plantillas_turno.id%TYPE;
        v_fecha_str     VARCHAR2(30);
        vro_empleado    smy_empleados%ROWTYPE;
        vro_turno_asig  smy_turnos_asignados%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_trabajador := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTrabajador'));
        v_id_turno      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTurno'));
        v_fecha_str     := JSON_VALUE(pcl_json, '$.fechaTurno');

        -- 2. Validaciones de negocio sin SELECT directo
        IF v_id_trabajador IS NULL OR v_id_turno IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'Identificador de trabajador y turno son obligatorios.');
        END IF;

        IF PKGSMY_EMPLEADOS_DAO.f_existe(v_id_trabajador, vro_empleado) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20002, 'El trabajador indicado no existe.');
        END IF;

        IF vro_empleado.id_estado_empleado <> 1 THEN
            RAISE_APPLICATION_ERROR(-20003, 'No se puede asignar turno a un colaborador que no se encuentre activo.');
        END IF;

        -- 3. Asignación directa de secuencia
        vro_turno_asig.id                   := SEQ_SMY_TURNOS_ASIGNADOS.NEXTVAL;
        vro_turno_asig.id_empleado          := v_id_trabajador;
        vro_turno_asig.id_plantilla_turno   := v_id_turno;
        IF v_fecha_str IS NOT NULL THEN
            vro_turno_asig.fecha_turno      := TO_DATE(SUBSTR(v_fecha_str, 1, 10), 'YYYY-MM-DD');
        ELSE
            vro_turno_asig.fecha_turno      := f_fecha_actual;
        END IF;
        vro_turno_asig.id_estado_turno      := 1; -- Programado / Confirmado
        vro_turno_asig.observaciones        := JSON_VALUE(pcl_json, '$.observaciones');
        vro_turno_asig.fecha_creacion       := f_fecha_actual;

        -- Inserción delegada al DAO exclusivo
        PKGSMY_TURNOS_ASIGNADOS_DAO.p_insertar(vro_turno_asig);

        -- Commit controlado
        p_do_commit('pkgln_cuadrantes_turnos.pr_asignar_turno_trabajador');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_CUADRANTES_TURNOS';
            vro_error.nombre_metodo   := 'PR_ASIGNAR_TURNO_TRABAJADOR';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_asignar_turno_trabajador;

    FUNCTION f_validar_cobertura_json (
        pcl_json IN CLOB
    ) RETURN CLOB
    IS
        vcl_resultado CLOB;
    BEGIN
        -- Delegación obligatoria a la capa de proceso pkgcn_ (CERO SELECT directo en pkgln_)
        vcl_resultado := PKGCN_CUADRANTES_TURNOS.fn_validar_cobertura_json(pcl_json);
        RETURN vcl_resultado;
    EXCEPTION
        WHEN OTHERS THEN
            vro_error.nombre_programa := 'PKGLN_CUADRANTES_TURNOS';
            vro_error.nombre_metodo   := 'F_VALIDAR_COBERTURA_JSON';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END f_validar_cobertura_json;

    PROCEDURE pr_programar_turnos_rango (
        pcl_json IN CLOB
    ) IS
        v_id_turno      smy_plantillas_turno.id%TYPE;
        v_fecha_ini_str VARCHAR2(30);
        v_fecha_fin_str VARCHAR2(30);
        v_fecha_ini     DATE;
        v_fecha_fin     DATE;
        v_curr_fecha    DATE;
        v_observaciones VARCHAR2(500);
        vro_empleado    smy_empleados%ROWTYPE;
        vro_turno_asig  smy_turnos_asignados%ROWTYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_turno      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTurno'));
        v_fecha_ini_str := JSON_VALUE(pcl_json, '$.fechaInicio');
        v_fecha_fin_str := JSON_VALUE(pcl_json, '$.fechaFin');
        v_observaciones := JSON_VALUE(pcl_json, '$.observaciones');

        -- 2. Validaciones de negocio sin SELECT directo
        IF v_id_turno IS NULL OR v_fecha_ini_str IS NULL OR v_fecha_fin_str IS NULL THEN
            RAISE_APPLICATION_ERROR(-20010, 'El turno, la fecha de inicio y la fecha de fin son obligatorios.');
        END IF;

        v_fecha_ini := TO_DATE(SUBSTR(v_fecha_ini_str, 1, 10), 'YYYY-MM-DD');
        v_fecha_fin := TO_DATE(SUBSTR(v_fecha_fin_str, 1, 10), 'YYYY-MM-DD');

        IF v_fecha_ini > v_fecha_fin THEN
            RAISE_APPLICATION_ERROR(-20011, 'La fecha inicial no puede ser posterior a la fecha final.');
        END IF;

        -- 3. Iteración por el rango de fechas programando los colaboradores indicados
        v_curr_fecha := v_fecha_ini;
        WHILE v_curr_fecha <= v_fecha_fin LOOP
            FOR r_colab IN (
                SELECT id_empleado
                  FROM JSON_TABLE(pcl_json, '$.colaboradores[*]'
                       COLUMNS (id_empleado NUMBER PATH '$'))
            ) LOOP
                IF PKGSMY_EMPLEADOS_DAO.f_existe(r_colab.id_empleado, vro_empleado) AND vro_empleado.id_estado_empleado = 1 THEN
                    -- Asignación directa de secuencia
                    vro_turno_asig.id                 := SEQ_SMY_TURNOS_ASIGNADOS.NEXTVAL;
                    vro_turno_asig.id_empleado        := r_colab.id_empleado;
                    vro_turno_asig.id_plantilla_turno := v_id_turno;
                    vro_turno_asig.fecha_turno        := v_curr_fecha;
                    vro_turno_asig.id_estado_turno    := 1; -- Programado / Confirmado
                    vro_turno_asig.observaciones      := v_observaciones;
                    vro_turno_asig.fecha_creacion     := f_fecha_actual;

                    -- Inserción delegada al DAO exclusivo
                    PKGSMY_TURNOS_ASIGNADOS_DAO.p_insertar(vro_turno_asig);
                END IF;
            END LOOP;

            v_curr_fecha := v_curr_fecha + 1;
        END LOOP;

        -- Commit controlado
        p_do_commit('pkgln_cuadrantes_turnos.pr_programar_turnos_rango');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_CUADRANTES_TURNOS';
            vro_error.nombre_metodo   := 'PR_PROGRAMAR_TURNOS_RANGO';
            vro_error.parametros      := pcl_json;
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_programar_turnos_rango;

END PKGLN_CUADRANTES_TURNOS;
/
