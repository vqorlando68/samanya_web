-- =============================================================================
-- ESPECIFICACIÓN Y CUERPO: PKGCA_SMY_RESIDENTE_ACUDIENTE
-- FAMILIA: pkgca_ (Sentencias DML mono-tabla cuando NO es por el ID)
-- ESTÁNDAR ARQUITECTÓNICO: oracle-plsql-architecture
-- =============================================================================

CREATE OR REPLACE PACKAGE PKGCA_SMY_RESIDENTE_ACUDIENTE
AS
    /*
    || =========================================================================
    || Paquete: PKGCA_SMY_RESIDENTE_ACUDIENTE
    || Propósito: Sentencias DML sobre la tabla SMY_RESIDENTE_ACUDIENTE cuando no es por ID
    || Estándar: Parámetro pcl_json IN CLOB, extracción vía JSON_VALUE
    || =========================================================================
    */

    /**
     * Elimina las relaciones de un acudiente con sus residentes asociados
     * Parámetro pcl_json:
     * {
     *   "idAcudiente": 102
     * }
     */
    PROCEDURE pr_eliminar_por_acudiente (
        pcl_json IN CLOB
    );

END PKGCA_SMY_RESIDENTE_ACUDIENTE;
/

CREATE OR REPLACE PACKAGE BODY PKGCA_SMY_RESIDENTE_ACUDIENTE
AS

    PROCEDURE pr_eliminar_por_acudiente (
        pcl_json IN CLOB
    ) IS
        v_id_acudiente smy_residente_acudiente.id_acudiente%TYPE;
    BEGIN
        v_id_acudiente := TO_NUMBER(JSON_VALUE(pcl_json, '$.idAcudiente'));

        IF v_id_acudiente IS NOT NULL THEN
            DELETE FROM smy_residente_acudiente
             WHERE id_acudiente = v_id_acudiente;
        END IF;
    END pr_eliminar_por_acudiente;

END PKGCA_SMY_RESIDENTE_ACUDIENTE;
/
