---
trigger: always_on
description: Consult the graphify knowledge graph at graphify-out/ for codebase and architecture questions.
---

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- **Consulta Obligatoria Previa**: Antes de planificar o ejecutar cualquier modificación de código en la aplicación, la primera acción obligatoria debe ser consultar el grafo de dependencias de Graphify (`python -m graphify query "<consulta>"` o herramientas de grafo) para identificar los componentes afectados.
- **Actualización Obligatoria ante Cambios**: Si se detecta que se han modificado o creado archivos estructurales desde la última ejecución, se debe actualizar el grafo (`python -m graphify update .` o `npm run graphify`) antes de realizar la búsqueda.
- For codebase or architecture questions, when `graphify-out/graph.json` exists, first run `graphify query "<question>"` (CLI) or `query_graph` (MCP). Use `graphify path "<A>" "<B>"` / `shortest_path` for relationships and `graphify explain "<concept>"` / `get_node` for focused concepts. These return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output.
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
