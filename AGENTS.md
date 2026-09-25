# Estándar Arquitectónico PL/SQL Oracle

Este repositorio contiene y aplica el estándar arquitectónico corporativo para el desarrollo en Oracle PL/SQL.

## Directrices Mandatorias para el Agente

0. **Consulta Previa Obligatoria de Graphify**:
   - **Antes de planificar o ejecutar cualquier modificación de código en la aplicación**, la primera acción obligatoria debe ser consultar el grafo de dependencias de Graphify (`python -m graphify query "<consulta>"` o herramientas de grafo) para identificar con exactitud los componentes, archivos y dependencias impactadas.
   - Si se detecta que se han modificado o creado archivos estructurales desde la última ejecución o extracción del grafo, se debe actualizar obligatoriamente el grafo (`python -m graphify update .` o `npm run graphify`) **antes** de proceder con la búsqueda y análisis.

Cada vez que se solicite generar, modificar, revisar, optimizar, refactorizar o proponer código PL/SQL o de aplicación:

1. **Clasificación Previa Obligatoria**: Identificar la responsabilidad y ubicar el código en su familia correspondiente:
   - `pkg<tabla>_dao`: Acceso a datos exclusivo de UNA tabla por PK/ROWID (plantilla oficial de 18 métodos). Sin COMMIT/ROLLBACK.
   - `pkgca_<nombre_tabla>`: Consultas, filtros multi-criterio (`SYS_REFCURSOR`), estados, fechas y **sentencias DML sobre UNA tabla cuando NO es por el ID**.
     * **Regla de existencia**: Los paquetes que empiezan por `pkgca_` **solo deben existir para la tabla correspondiente cuando su DML (o filtros/consultas) no es por el ID**. Nunca deben crearse con nombres de procesos.
     * **Sentencia DML mono-tabla**: Si la sentencia DML es sobre una tabla, debe ir obligatoriamente en un `pkgca_` + nombre de la tabla que está usando si no es por el ID (si es por ID va en `_dao`).
     * **Atomicidad DML**: **Solamente puede haber UN método por cada sentencia DML**.
     * **Parámetros de entrada**: Recibe obligatoriamente un parámetro `pcl_json IN CLOB` con el documento JSON.
     * **Extracción de campos**: Se extrae obligatoriamente utilizando `JSON_VALUE(pcl_json, '$.campo')`.
   - `pkgcn_<nombre_proceso>`: Sentencias DML de proceso que involucran **MÁS DE UNA TABLA en la misma sentencia SQL** (ej. INSERT...SELECT, UPDATE...WHERE EXISTS, MERGE...USING), o sentencias `SELECT` sobre **MÁS DE UNA TABLA sobre solamente JSON** (`RETURNING CLOB`) para el proceso.
     * **Solo debe tener UN método por cada sentencia DML**.
     * La sentencia DML o consulta SELECT sobre solamente JSON debe involucrar **COMO MÍNIMO DOS TABLAS**.
     * **NO contiene sentencias DML mono-tabla**: Si un proceso requiere modificar tabla A y tabla B con sentencias independientes, cada una se ejecuta vía su respectivo `_dao` o `pkgca_<nombre_tabla>`, orquestándose en `pkgln_`.
     * **Parámetros de entrada**: Recibe obligatoriamente un parámetro `pcl_json IN CLOB` con el documento JSON y extrae usando `JSON_VALUE(pcl_json, '$.campo')`.
     * No contiene lógica de negocio, validaciones complejas ni COMMIT/ROLLBACK.
   - `pkgln_`: **Lógica de negocio**, validaciones y reglas de dominio del caso de uso.
     * **Parámetros de entrada**: Recibe obligatoriamente un parámetro `pcl_json IN CLOB` con el documento JSON y extrae usando `JSON_VALUE(pcl_json, '$.campo')`.
     * **Sin sentencias DML directas** (INSERT, UPDATE, DELETE) y **sin sentencias SELECT directas sobre tablas**.
     * **Búsquedas por ID / PK**: Se realizan exclusivamente mediante `pkg<tabla>_dao` (`f_traer`, `f_existe`).
     * **Búsquedas por otros criterios** (nombre, email, estado, filtros): Se realizan exclusivamente mediante paquetes `pkgca_<tabla>` llamando a la función de búsqueda.
     * **Asignación de secuencias**: Utilizar asignación directa (`vro_auditoria.id := SEQ_SMY_AUDITORIA_ACCESOS.NEXTVAL;`), **nunca hacer SELECT ... FROM DUAL**.
     * Orquesta el flujo: valida con DAO (`IF pkg<tabla>_dao.f_existe(...)`), actualiza con DAO (`pkg<tabla>_dao.p_actualizar(...)`), inserta con DAO (`pkgsmy_auditoria_accesos_dao.p_insertar(...)`), o invoca `pkgcn_` si aplica una sentencia multi-tabla.
     * **Control transaccional (COMMIT controlado)**: En `pkgln_` se ejecuta el COMMIT al completar el proceso, pero **nunca mediante `COMMIT;` directo**. Se debe invocar obligatoriamente el procedimiento `p_do_commit('<objeto>.<metodo>');` enviando como parámetro el contexto (nombre del paquete + nombre del método, ej: `p_do_commit('pkgln_auth.pr_registrar_dispositivo_push');`).
     * Captura `WHEN OTHERS`, ejecuta `ROLLBACK;`, puebla `vro_error smy_errores%ROWTYPE;` (asignando directamente `vro_error.parametros := pcl_json;` ya que el campo en `SMY_ERRORES` es CLOB, sin `SUBSTR`), invoca `uti_ge_excepciones_pkg.p_grabar_log(vro_error);` y lanza `RAISE_APPLICATION_ERROR(-20000, 'Se presento un error comunicarse con soporte. Número error: ' || vro_error.id || ' - ' || SQLERRM);`.

2. **Prohibición Absoluta de la Nomenclatura `JOIN`**:
   - **Queda terminantemente prohibido el uso de la sintaxis ANSI JOIN** (`JOIN`, `INNER JOIN`, `LEFT JOIN`, `LEFT OUTER JOIN`, `RIGHT JOIN`, `FULL JOIN`, `CROSS JOIN`).
   - Las consultas multi-tabla se construyen exclusivamente con la **sintaxis tradicional de Oracle**:
     * Tablas separadas por comas en el `FROM`: `FROM smy_residentes r, smy_centros c, smy_estados_residentes e`
     * Condiciones de relación en el `WHERE`: `WHERE r.id_centro = c.id AND r.id_estado_residente = e.id`
     * Outer Joins (uniones externas) exclusivamente con el operador nativo `(+)`: `WHERE r.id_nivel_movilidad = m.id(+)`

3. **Manejo de Parámetros y JSON**:
   - Parámetros de entrada en `pkgca_`, `pkgcn_` y `pkgln_`: siempre en un `pcl_json IN CLOB`, extrayendo los campos con `JSON_VALUE`.
   - Multi-fila siempre retorna `SYS_REFCURSOR`.
   - JSON de salida siempre nativo con `JSON_OBJECT` / `JSON_ARRAYAGG` y `RETURNING CLOB`. Cero concatenación de cadenas.

4. **Manejo de Fechas y Zona Horaria (Bogotá, Colombia)**:
   - Todas las fechas del sistema deben registrar y calcularse con la zona horaria oficial de Bogotá, Colombia (UTC-5 / `America/Bogota`).
   - Queda prohibido el uso directo de `SYSDATE` o `CURRENT_DATE`.
   - Se debe utilizar obligatoriamente la función corporativa `f_fecha_actual` (`RETURN DATE`), la cual resuelve `(SYSTIMESTAMP AT TIME ZONE 'America/Bogota')`.

5. **Actualización Obligatoria de `build_all.sql`**:
   - **Cada vez que se cree un objeto o archivo de script en la base de datos** (`f_`, `p_`, `pkgsmy_*_dao`, `pkgca_`, `pkgcn_`, `pkgln_`), es **estricta y obligatoriamente mandatorio actualizar el archivo maestro `backend/db/scripts/build_all.sql`**:
     * Agregar la directiva `@@<nombre_archivo>.sql` en la sección y orden de dependencias correspondiente.
     * Actualizar los contadores totales de objetos en el encabezado, mensajes informativos y resumen final de compilación.

6. **Formato de Respuesta**:
   - 1. Clasificación arquitectónica.
   - 2. Justificación técnica.
   - 3. Package Specification (`.pks`).
   - 4. Package Body (`.pkb`).
   - 5. Consideraciones técnicas.
   - 6. Validación contra el estándar.

Para ver la especificación completa, consultar [oracle-plsql-architecture/SKILL.md](file:///c:/Repositorios/SAMANYA_WEB/.agents/skills/oracle-plsql-architecture/SKILL.md).
