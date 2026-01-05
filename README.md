# pi-agent-scip

SCIP-based code intelligence tools for [pi-coding-agent](https://github.com/mariozechner/pi). Provides fast, compiler-accurate navigation for **Python** and **TypeScript/JavaScript** projects using Sourcegraph's SCIP indexers under the hood.

Once installed globally and registered as a pi tool, the agent can automatically:

- Build a `.scip/index.scip` for your project (no prompts by default)
- Go to definition
- Find references
- List and search symbols

All of this works **inside pi**, driven by custom tools. You rarely need to call anything manually.

---

## 1. Quick start

1. **☢️ Read the local `PI_INSTRUCTIONS.md` file ☢️** to understand
   what will be changed in your global pi configuration and confirm that it doesn't do anything evil with your system.

2. **Run pi in this repo** and, inside the session, say:

   > Execute instructions in @PI_INSTRUCTIONS.md

   The agent will:

   - Ask for your consent on three steps (global install/link, `AGENTS.md`
     guidance, optional hook registration).
   - Apply the changes using its built-in tools.

After this one-time setup, every `pi` session can see and use the SCIP tools
automatically.

---

## 2. Supported Languages

| Language | Indexer | Detection |
|----------|---------|-----------|
| **Python** | `@sourcegraph/scip-python` | `pyproject.toml`, `setup.py`, `requirements.txt`, or `.py` files |
| **TypeScript/JavaScript** | `@sourcegraph/scip-typescript` | `tsconfig.json`, `jsconfig.json`, `package.json` with TypeScript dep, or `.ts`/`.tsx` files |

Both indexers are shipped as npm dependencies and invoked automatically. You do **not** need to install them separately.

For **multi-language projects** (e.g., Python backend + TypeScript frontend), both languages are detected and indexed together.

---

## 3. Requirements

- Node.js **18+** (for pi and this package)
- For Python: ideally a `pyproject.toml` (optional but recommended for better `scip-python` behavior)
- For TypeScript: ideally a `tsconfig.json` (will be inferred if missing)

---

## 4. Agent behavior

Once `@qualisero/pi-agent-scip` is installed, the agent will prefer:

- `scip_find_definition` for definitions
- `scip_find_references` for usages
- `scip_list_symbols` / `scip_search_symbols` for symbol overviews
- `scip_project_tree` for high-level structure

Inside pi, the SCIP tools are available to the agent. It calls them
automatically; you rarely need to invoke them directly.

---

## 5. CLI status helper

```bash
pi-agent-scip-status
```

Run from a project root to see index presence, indexer availability, and the
last log entry.

---

## 6. Workspace support

For monorepos and workspaces:

- **pnpm workspaces**: Detected via `pnpm-workspace.yaml`
- **Yarn workspaces**: Detected via `workspaces` field in `package.json`

The TypeScript indexer will automatically index all workspace packages.
