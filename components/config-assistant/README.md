# Config Assistant — component

Proactive, guided configuration for the AWS console. It shows the workload's
Kubernetes manifest (like the EKS **Resources** YAML editor) and the assistant
reads it against the target nodes.

Scenario: a workload is headed for a GPU node group the platform team tainted
`dedicated=gpuGroup:NoSchedule`. The manifest has no matching toleration, so the
pods would land in **Pending**. The assistant:

- **Flags it inline** — a dashed annotation appears in the manifest exactly where
  the missing `tolerations` block belongs.
- **Inserts the fix** — **Insert toleration** drops the correct block into the pod
  spec and the finding turns green.
- **Explains why** — a finding panel shows the real scheduler event and the cause.
- **Deploys either way** — leaving it unfixed shows "recommendation not applied,"
  which is the handoff into the next feature (the Pending-pods incident).

There's also a **"describe what you're building"** chat that recommends a starter
manifest (toleration + replica count) and applies it in one click.

## Files

| File | What it is |
|------|------------|
| `config-assistant.html` | The component markup + a runnable preview page |
| `config-assistant.css`  | All styles (every class prefixed `.ca-`) |
| `config-assistant.js`   | Behavior (IIFE, scoped per `.ca-root`) |

Open `config-assistant.html` in a browser to see it running on its own.

## How to merge into the combined page

1. **CSS** — link `config-assistant.css`, or paste its contents into the shared
   stylesheet. All rules are scoped under `.ca-root`, so nothing leaks.
2. **HTML** — copy the `<section class="ca-root"> … </section>` block from
   `config-assistant.html` (marked `COMPONENT START` / `COMPONENT END`) into the
   page where this section should appear.
3. **JS** — include `config-assistant.js` once, or paste its contents into the
   shared script. It auto-wires every `.ca-root` on the page after load.

That's it — no build step, no framework.

## Why it won't clash with other components

- Every class is prefixed `.ca-` and every CSS rule is scoped under `.ca-root`.
- The JavaScript is wrapped in an IIFE (no globals) and finds elements by
  `data-ca-*` attributes **within each `.ca-root`** — it never uses global IDs,
  so two components can't step on each other.

## Changing the scenario or wording

Everything the assistant knows lives in constants at the top of
`config-assistant.js`:

- `CA_MANIFEST` — the manifest lines shown in the editor. `{replicas}` is a
  placeholder the chat can set.
- `CA_TOLERATION` + `CA_INSERT_AFTER` — the block the assistant recommends, and
  the manifest line it's inserted after.
- `CA_TAINT`, `CA_EVENT`, `CA_SRC` — the taint name, the scheduler event shown in
  the finding, and the source tag.
- `CA_RECIPES` + `matchRecipe()` — the chat's starter recommendations and how
  free text maps to one.

To use a different scenario, edit those constants. The HTML only needs the
containers (`data-ca-editor`, `data-ca-finding`, `data-ca-deploy-msg`) plus the
chat markup — the editor and finding are rendered by the script.

## Theming for the design session

Colors are CSS variables on `.ca-root`. Override them from the combined
stylesheet without touching the component, e.g. to match an AWS palette:

```css
.ca-root {
  --ca-accent: #146eb4;
  --ca-ai:     #232f3e;
}
```
