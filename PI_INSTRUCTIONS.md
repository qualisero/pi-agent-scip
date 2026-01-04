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

## Step 1: Install or link @qualisero/pi-agent-scip as a global pi tool (**strongly recommended**)

**Goal:** Ensure the `scip_*` tools are discoverable by pi via the standard
custom-tools location.

There are two common setups:

- **Global npm install**
- **Local dev checkout**

The agent can perform either, with explicit confirmation.

**Question (opt-in):**

> Do you want me to ensure `@qualisero/pi-agent-scip` is installed/linked as a global
> pi tool under `~/.pi/agent/tools/scip`? (yes/no)

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
   mkdir -p ~/.pi/agent/tools
   ln -snf "$(npm root -g)/@qualisero/pi-agent-scip" ~/.pi/agent/tools/scip
   ```

3. **If you choose `local`:**

   a. Determine the absolute path of the current checkout (via `pwd`).

   b. Create the symlink:

   ```bash
   mkdir -p ~/.pi/agent/tools
   ln -snf "$(pwd)" ~/.pi/agent/tools/scip
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

## Step 3: Enable the pi-agent-scip hook (optional)

**Goal:** On session start, automatically detect Python and TypeScript/JavaScript projects and inject a
system message that nudges the model to prefer the `scip_*` tools.

The `pi-agent-scip` package ships a compiled hook at `dist/hook.js`.

**Question (opt-in):**

> Do you want me to register the `pi-agent-scip` hook in `~/.pi/agent/settings.json`
> so it runs on every pi session? (yes/no)

If you answer **yes**, the agent should:

1. Determine the absolute path to `dist/hook.js` in the current checkout.
2. Open (or create) `~/.pi/agent/settings.json`.
3. Ensure there is a `hooks` array that includes that path:

   ```jsonc
   {
     "hooks": [
       "/absolute/path/to/pi-agent-scip/dist/hook.js"
     ]
   }
   ```

   If `settings.json` already has other hooks or settings, preserve them and
   only append the new hook path if not already present.

If you answer **no**, skip this step.

---

## Done

After completing the steps above, the agent should confirm:

> pi-agent-scip integration complete. Restart pi in any Python or TypeScript/JavaScript project to use the
> new SCIP tools.
