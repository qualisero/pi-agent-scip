# pi-agent-scip: pi agent integration instructions

This file is meant to be **run or followed inside a pi agent session**. It describes
how to integrate `@qualisero/pi-agent-scip` with your global pi configuration in a
minimal, opt-in way.

If you are in a pi session, you can simply say:

> Execute instructions in @PI_INSTRUCTIONS.md

and the agent should:

- Read this file.
- Ask you the opt-in questions below.
- Apply the changes to your global pi configuration according to your answers,
  using the built-in `bash`, `read`, `edit`, and `write` tools.

---

## Step 1: Install or link @qualisero/pi-agent-scip as a global pi extension (**strongly recommended**)

**Goal:** Ensure the `scip_*` tools are discoverable by pi via the standard
extensions location.

There are two common setups:

- **Global npm install**
- **Local dev checkout**

The agent can perform either, with explicit confirmation.

**Question (opt-in):**

> Do you want me to ensure `@qualisero/pi-agent-scip` is installed/linked as a global
> pi extension under `~/.pi/agent/extensions/pi-agent-scip.js`? (yes/no)

If you answer **yes**, the agent should:

1. Ask whether you prefer a global install or local dev checkout:

   > Use the globally installed `@qualisero/pi-agent-scip`, or link this local
   > checkout? (answer `global` or `local`)

2. **If you choose `global`:**

   a. Run:

   ```bash
   npm install -g @qualisero/pi-agent-scip
   ```

   b. Create the symlink:

   ```bash
   mkdir -p ~/.pi/agent/extensions
   ln -snf "$(npm root -g)/@qualisero/pi-agent-scip/dist/index.js" ~/.pi/agent/extensions/pi-agent-scip.js
   ```

3. **If you choose `local`:**

   a. Determine the absolute path of the current checkout (via `pwd`).

   b. Create the symlink:

   ```bash
   mkdir -p ~/.pi/agent/extensions
   ln -snf "$(pwd)/dist/index.js" ~/.pi/agent/extensions/pi-agent-scip.js
   ```

If you answer **no**, the agent should skip this step.

---

## Step 2: Add global guidance to `~/.pi/agent/AGENTS.md` (optional)

**Goal:** Tell the agent, globally, how to use the `scip_*` tools when they are
available.

**Question (opt-in):**

> Do you want me to update `~/.pi/agent/AGENTS.md` to add guidance for using the
> SCIP tools in Python and TypeScript/JavaScript projects? (yes/no)

If you answer **yes**, the agent should:

1. Open `~/.pi/agent/AGENTS.md` (create it if it doesn't exist).
2. Add or append a short paragraph along these lines:

   > When `@qualisero/pi-agent-scip` is installed and `scip_*` tools are available in a
   > session, prefer them for understanding Python and TypeScript/JavaScript codebases:
   >
   > - Use `scip_find_definition` to locate symbol definitions.
   > - Use `scip_find_references` for impact analysis.
   > - Use `scip_list_symbols` before reading a source file line by line.
   > - Use `scip_search_symbols` to find symbols by name.
   > - Use `scip_project_tree` at the start of work on large/unfamiliar
   >   repos to get a structural overview.

3. Keep any existing content unchanged.

If you answer **no**, skip this step.

---

## Done

After completing the steps above, the agent should confirm:

> pi-agent-scip integration complete. Restart pi in any Python or TypeScript/JavaScript project to use the
> new SCIP tools.

---

## Migration from v0.2.x

If you previously installed version 0.2.x with the old hook/tool setup:

1. Remove old symlinks:
   ```bash
   rm ~/.pi/agent/tools/scip
   rm ~/.pi/agent/hooks/pi-agent-scip-hook.js 2>/dev/null || true
   ```

2. Remove hook entry from `~/.pi/agent/settings.json` if present

3. Follow Step 1 above to create the new extension symlink

The extension automatically provides both the tools and the context injection that the old hook provided.
