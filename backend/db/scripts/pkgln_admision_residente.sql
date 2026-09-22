-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGLN_ADMISION_RESIDENTE
-- PROCESO: Admisión, Registro Integral y Gestión de Fichas de Residentes
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture (Lógica de Negocio)
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGLN_ADMISION_RESIDENTE
AS
    /*
    || =========================================================================
    || Paquete: PKGLN_ADMISION_RESIDENTE
    || Propósito: Gestionar el flujo de negocio de admisión de nuevos residentes,
    ||            validación de cupos y habitaciones, asignación de cuidados,
    ||            y vinculación con su acudiente responsable inicial.
    || Estándar: Sin sentencias DML directas, interacción vía DAOs por PK,
    ||           parámetros CLOB JSON, commit controlado vía p_do_commit.
    || =========================================================================
    */

    /**
     * Registra la admisión completa de un nuevo residente y su acudiente opcional
     * Parámetro pcl_json:
     * {
     *   "idCentro": 1,
     *   "tipoIdentificacion": "CC",
     *   "identificacion": "24.312.890",
     *   "nombres": "Blanca",
     *   "apellidos": "Gomez de Restrepo",
     *   "fechaNacimiento": "1942-05-14",
     *   "genero": "F",
     *   "habitacion": "104",
     *   "cama": "104-A",
     *   "eps": "Sanitas EPS",
     *   "planComplementario": "Colmedica",
     *   "tipoSangre": "O+",
     *   "idNivelMovilidad": 2,
     *   "idTipoDieta": 3,
     *   "alertasClinicas": "Alergia a penicilina",
     *   "medicamentos": [
     *       {
     *           "medicamento": "Losartan 50mg",
     *           "cantidad": "1 tableta",
     *           "frecuencia": "Cada 12 horas",
     *           "fechaFin": "2026-12-31",
     *           "indicaciones": "Tomar con abundante agua"
     *       }
     *   ],
     *   "acudienteAsociado": {
     *       "nombres": "Claudia Patricia",
     *       "apellidos": "Restrepo Gomez",
     *       "identificacion": "52.489.120",
     *       "idParentesco": 1,
     *       "telefono": "3108459921",
     *       "email": "claudia@gmail.com"
     *   }
     * }
     */
    PROCEDURE pr_registrar_residente (
        pcl_json IN CLOB
    );

    /**
     * Actualiza la información personal, ubicación, dieta o consideraciones clínicas de un residente existente
     * Parámetro pcl_json:
     * {
     *   "idResidente": 105,
     *   "nombres": "Blanca Ines",
     *   "apellidos": "Gomez de Restrepo",
     *   "identificacion": "24.312.890",
     *   "idTipoIdentificacion": 1,
     *   "fechaNacimiento": "1942-05-14",
     *   "idGenero": 2,
     *   "eps": "Sanitas EPS",
     *   "planComplementario": "Colmedica",
     *   "tipoSangre": "O+",
     *   "habitacion": "108",
     *   "cama": "108-B",
     *   "idNivelMovilidad": 3,
     *   "idTipoDieta": 2,
     *   "alertasClinicas": "Nueva dieta blanda prescrita",
     *   "idEstadoResidente": 1
     * }
     */
    PROCEDURE pr_actualizar_residente (
        pcl_json IN CLOB
    );

END PKGLN_ADMISION_RESIDENTE;
/

CREATE OR REPLACE PACKAGE BODY PKGLN_ADMISION_RESIDENTE
AS
    vro_error smy_errores%ROWTYPE;

    PROCEDURE pr_registrar_residente (
        pcl_json IN CLOB
    ) IS
        v_id_centro            smy_residentes.id_centro%TYPE;
        v_identificacion       smy_residentes.identificacion%TYPE;
        v_nombres              smy_residentes.nombres%TYPE;
        v_apellidos            smy_residentes.apellidos%TYPE;
        v_habitacion           smy_residentes.habitacion%TYPE;
        v_cama                 smy_residentes.cama%TYPE;
        v_fecha_nac_str        VARCHAR2(30);

        vro_residente          smy_residentes%ROWTYPE;
        vro_acudiente          smy_acudientes%ROWTYPE;
        vro_res_acu            smy_residente_acudiente%ROWTYPE;
        vro_med                smy_medicamentos_prescritos%ROWTYPE;

        -- Datos acudiente asociado
        v_acu_nombres          smy_acudientes.nombres%TYPE;
        v_acu_apellidos        smy_acudientes.apellidos%TYPE;
        v_acu_identificacion   smy_acudientes.identificacion%TYPE;
        v_acu_parentesco       smy_residente_acudiente.id_parentesco%TYPE;
        v_acu_telefono         smy_acudientes.telefono_principal%TYPE;
        v_acu_email            smy_acudientes.email%TYPE;
    BEGIN
        -- 1. Extracción con JSON_VALUE
        v_id_centro      := TO_NUMBER(JSON_VALUE(pcl_json, '$.idCentro'));
        v_identificacion := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        v_nombres        := TRIM(JSON_VALUE(pcl_json, '$.nombres'));
        v_apellidos      := TRIM(JSON_VALUE(pcl_json, '$.apellidos'));
        v_habitacion     := TRIM(JSON_VALUE(pcl_json, '$.habitacion'));
        v_cama           := TRIM(JSON_VALUE(pcl_json, '$.cama'));
        v_fecha_nac_str  := JSON_VALUE(pcl_json, '$.fechaNacimiento');

        -- 2. Validaciones de negocio
        IF v_id_centro IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'El identificador del centro es obligatorio.');
        END IF;
        IF v_nombres IS NULL OR v_apellidos IS NULL THEN
            RAISE_APPLICATION_ERROR(-20002, 'Los nombres y apellidos del residente son obligatorios.');
        END IF;
        IF v_identificacion IS NULL THEN
            RAISE_APPLICATION_ERROR(-20003, 'El número de identificación del residente es obligatorio.');
        END IF;
        IF v_habitacion IS NULL THEN
            RAISE_APPLICATION_ERROR(-20004, 'La asignación de habitación es obligatoria para la admisión.');
        END IF;

        -- 3. Asignación directa de secuencia y estructuración del registro
        vro_residente.id                     := SEQ_SMY_RESIDENTES.NEXTVAL;
        vro_residente.id_centro              := v_id_centro;
        vro_residente.codigo_expediente      := 'RES-' || TO_CHAR(f_fecha_actual, 'YYYY') || '-' || LPAD(TO_CHAR(vro_residente.id), 4, '0');
        vro_residente.id_tipo_identificacion := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoIdentificacion')), 1);
        vro_residente.identificacion         := v_identificacion;
        vro_residente.nombres                := v_nombres;
        vro_residente.apellidos              := v_apellidos;
        IF v_fecha_nac_str IS NOT NULL THEN
            vro_residente.fecha_nacimiento   := TO_DATE(SUBSTR(v_fecha_nac_str, 1, 10), 'YYYY-MM-DD');
        ELSE
            vro_residente.fecha_nacimiento   := TO_DATE('1945-01-01', 'YYYY-MM-DD');
        END IF;
        vro_residente.id_genero              := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idGenero')), 1);
        vro_residente.habitacion             := v_habitacion;
        vro_residente.cama                   := NVL(v_cama, v_habitacion || '-A');
        vro_residente.eps                    := JSON_VALUE(pcl_json, '$.eps');
        vro_residente.plan_complementario    := JSON_VALUE(pcl_json, '$.planComplementario');
        vro_residente.tipo_sangre            := NVL(JSON_VALUE(pcl_json, '$.tipoSangre'), 'O+');
        vro_residente.id_nivel_movilidad     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idNivelMovilidad')), 1);
        vro_residente.id_tipo_dieta          := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoDieta')), 1);
        vro_residente.alertas_clinicas       := JSON_VALUE(pcl_json, '$.alertasClinicas');
        vro_residente.id_estado_residente    := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoResidente')), 1);
        IF JSON_VALUE(pcl_json, '$.fechaIngreso') IS NOT NULL THEN
            vro_residente.fecha_ingreso      := TO_DATE(SUBSTR(JSON_VALUE(pcl_json, '$.fechaIngreso'), 1, 10), 'YYYY-MM-DD');
        ELSE
            vro_residente.fecha_ingreso      := f_fecha_actual;
        END IF;
        vro_residente.fecha_creacion         := f_fecha_actual;

        -- 4. Inserción delegada al DAO exclusivo de la tabla
        PKGSMY_RESIDENTES_DAO.p_insertar(vro_residente);

        -- 5. Si incluye acudiente asociado, se procesa vía sus respectivos DAOs
        v_acu_nombres := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.nombres'));
        IF v_acu_nombres IS NOT NULL THEN
            v_acu_apellidos      := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.apellidos'));
            v_acu_identificacion := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.identificacion'));
            v_acu_parentesco     := NVL(TO_NUMBER(JSON_VALUE(pcl_json, '$.acudienteAsociado.idParentesco')), 1);
            v_acu_telefono       := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.telefono'));
            v_acu_email          := TRIM(JSON_VALUE(pcl_json, '$.acudienteAsociado.email'));

            vro_acudiente.id                     := SEQ_SMY_ACUDIENTES.NEXTVAL;
            vro_acudiente.id_tipo_identificacion := 1;
            vro_acudiente.identificacion         := NVL(v_acu_identificacion, 'PENDIENTE');
            vro_acudiente.nombres                := v_acu_nombres;
            vro_acudiente.apellidos              := v_acu_apellidos;
            vro_acudiente.telefono_principal     := v_acu_telefono;
            vro_acudiente.email                  := v_acu_email;
            vro_acudiente.fecha_creacion         := f_fecha_actual;
            PKGSMY_ACUDIENTES_DAO.p_insertar(vro_acudiente);

            -- Registro de la relación Residente-Acudiente
            vro_res_acu.id                 := SEQ_SMY_RESIDENTE_ACUDIENTE.NEXTVAL;
            vro_res_acu.id_residente       := vro_residente.id;
            vro_res_acu.id_acudiente       := vro_acudiente.id;
            vro_res_acu.id_parentesco      := v_acu_parentesco;
            vro_res_acu.es_principal       := 1;
            vro_res_acu.es_responsable_pago:= 1;
            vro_res_acu.autorizado_salidas := 1;
            vro_res_acu.fecha_creacion     := f_fecha_actual;
            PKGSMY_RESIDENTE_ACUDIENTE_DAO.p_insertar(vro_res_acu);
        END IF;

        -- 5.1 Si incluye medicamentos prescritos, se insertan vía su DAO exclusivo
        FOR r_med IN (
            SELECT medicamento,
                   cantidad,
                   frecuencia,
                   fecha_fin,
                   indicaciones
            FROM JSON_TABLE(pcl_json, '$.medicamentos[*]'
                COLUMNS (
                    medicamento  VARCHAR2(120) PATH '$.medicamento',
                    cantidad     VARCHAR2(50)  PATH '$.cantidad',
                    frecuencia   VARCHAR2(100) PATH '$.frecuencia',
                    fecha_fin    VARCHAR2(30)  PATH '$.fechaFin',
                    indicaciones VARCHAR2(500) PATH '$.indicaciones'
                )
            )
        ) LOOP
            IF TRIM(r_med.medicamento) IS NOT NULL THEN
                vro_med.id                     := SEQ_SMY_MEDICAMENTOS_PRESCRITOS.NEXTVAL;
                vro_med.id_residente           := vro_residente.id;
                vro_med.nombre_medicamento     := TRIM(r_med.medicamento);
                vro_med.dosis                  := NVL(TRIM(r_med.cantidad), '1 toma');
                vro_med.cantidad               := TRIM(r_med.cantidad);
                vro_med.id_via_administracion  := 1; -- Vía oral estándar
                vro_med.horarios_fijos         := TRIM(r_med.frecuencia);
                vro_med.indicaciones           := TRIM(r_med.indicaciones);
                vro_med.requiere_foto_comp     := 'N';
                vro_med.fecha_inicio           := f_fecha_actual;
                IF r_med.fecha_fin IS NOT NULL AND LENGTH(TRIM(r_med.fecha_fin)) >= 10 THEN
                    vro_med.fecha_fin          := TO_DATE(SUBSTR(r_med.fecha_fin, 1, 10), 'YYYY-MM-DD');
                ELSE
                    vro_med.fecha_fin          := NULL;
                END IF;
                vro_med.id_estado_medicamento  := 1; -- Activo
                vro_med.fecha_creacion         := f_fecha_actual;
                PKGSMY_MEDICAMENTOS_PRESCRITOS_DAO.p_insertar(vro_med);
            END IF;
        END LOOP;

        -- 6. Control transaccional mediante p_do_commit
        p_do_commit('pkgln_admision_residente.pr_registrar_residente');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ADMISION_RESIDENTE';
            vro_error.nombre_metodo   := 'PR_REGISTRAR_RESIDENTE';
            vro_error.parametros      := SUBSTR(pcl_json, 1, 4000);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_registrar_residente;

    PROCEDURE pr_actualizar_residente (
        pcl_json IN CLOB
    ) IS
        v_id_residente smy_residentes.id%TYPE;
        vro_residente  smy_residentes%ROWTYPE;
    BEGIN
        v_id_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idResidente'));

        IF v_id_residente IS NULL THEN
            RAISE_APPLICATION_ERROR(-20005, 'El identificador del residente es obligatorio.');
        END IF;

        -- Consultar estado actual mediante DAO
        IF PKGSMY_RESIDENTES_DAO.f_existe(v_id_residente, vro_residente) = FALSE THEN
            RAISE_APPLICATION_ERROR(-20006, 'El residente indicado no existe.');
        END IF;

        -- Actualizar campos proporcionados
        IF JSON_VALUE(pcl_json, '$.nombres') IS NOT NULL THEN
            vro_residente.nombres := TRIM(JSON_VALUE(pcl_json, '$.nombres'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.apellidos') IS NOT NULL THEN
            vro_residente.apellidos := TRIM(JSON_VALUE(pcl_json, '$.apellidos'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.identificacion') IS NOT NULL THEN
            vro_residente.identificacion := TRIM(JSON_VALUE(pcl_json, '$.identificacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idTipoIdentificacion') IS NOT NULL THEN
            vro_residente.id_tipo_identificacion := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoIdentificacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.fechaNacimiento') IS NOT NULL THEN
            vro_residente.fecha_nacimiento := TO_DATE(SUBSTR(JSON_VALUE(pcl_json, '$.fechaNacimiento'), 1, 10), 'YYYY-MM-DD');
        END IF;
        IF JSON_VALUE(pcl_json, '$.idGenero') IS NOT NULL THEN
            vro_residente.id_genero := TO_NUMBER(JSON_VALUE(pcl_json, '$.idGenero'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.eps') IS NOT NULL THEN
            vro_residente.eps := TRIM(JSON_VALUE(pcl_json, '$.eps'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.planComplementario') IS NOT NULL THEN
            vro_residente.plan_complementario := TRIM(JSON_VALUE(pcl_json, '$.planComplementario'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.tipoSangre') IS NOT NULL THEN
            vro_residente.tipo_sangre := TRIM(JSON_VALUE(pcl_json, '$.tipoSangre'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.habitacion') IS NOT NULL THEN
            vro_residente.habitacion := TRIM(JSON_VALUE(pcl_json, '$.habitacion'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.cama') IS NOT NULL THEN
            vro_residente.cama := TRIM(JSON_VALUE(pcl_json, '$.cama'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idNivelMovilidad') IS NOT NULL THEN
            vro_residente.id_nivel_movilidad := TO_NUMBER(JSON_VALUE(pcl_json, '$.idNivelMovilidad'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.idTipoDieta') IS NOT NULL THEN
            vro_residente.id_tipo_dieta := TO_NUMBER(JSON_VALUE(pcl_json, '$.idTipoDieta'));
        END IF;
        IF JSON_VALUE(pcl_json, '$.alertasClinicas') IS NOT NULL THEN
            vro_residente.alertas_clinicas := JSON_VALUE(pcl_json, '$.alertasClinicas');
        END IF;
        IF JSON_VALUE(pcl_json, '$.fechaIngreso') IS NOT NULL THEN
            vro_residente.fecha_ingreso := TO_DATE(SUBSTR(JSON_VALUE(pcl_json, '$.fechaIngreso'), 1, 10), 'YYYY-MM-DD');
        END IF;
        IF JSON_VALUE(pcl_json, '$.idEstadoResidente') IS NOT NULL THEN
            vro_residente.id_estado_residente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idEstadoResidente'));
        END IF;

        -- Modificación delegada al DAO
        PKGSMY_RESIDENTES_DAO.p_actualizar(vro_residente);

        -- Commit controlado
        p_do_commit('pkgln_admision_residente.pr_actualizar_residente');

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            IF SQLCODE BETWEEN -20999 AND -20001 THEN
                RAISE;
            END IF;
            vro_error.nombre_programa := 'PKGLN_ADMISION_RESIDENTE';
            vro_error.nombre_metodo   := 'PR_ACTUALIZAR_RESIDENTE';
            vro_error.parametros      := SUBSTR(pcl_json, 1, 4000);
            uti_ge_excepciones_pkg.p_grabar_log(vro_error);
            RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);
    END pr_actualizar_residente;

END PKGLN_ADMISION_RESIDENTE;
/
