/**
 * <tensei-shared-canvas>
 * Section 3 — Shared surface.
 * One canvas everyone sees, with three simultaneous live cursors: Maya on the
 * live pods, the AI on the readiness-probe diff, Devan on the IRSA role change.
 */
class TenseiSharedCanvas extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="shared">
        <div class="shared-head">
          <span class="t">Shared surface · everyone sees the same thing</span>
          <span class="n">payments-service · prod-eks-1</span>
        </div>
        <div class="shared-grid">
          <div style="position:relative;">
            <p class="panel-note">Live pods — Maya is looking here</p>
            <div class="topo">
              <div class="node-row"><span class="k">Pod 1</span><span class="v">payments-7f9…a2</span><span class="pill bad">CrashLoop</span></div>
              <div class="node-row"><span class="k">Pod 2</span><span class="v">payments-7f9…b8</span><span class="pill bad">CrashLoop</span></div>
              <div class="node-row"><span class="k">Pod 3</span><span class="v">payments-7f9…c1</span><span class="pill ok">Running</span></div>
              <div class="node-row"><span class="k">Node</span><span class="v">ip-10-0-3-21</span><span class="pill ok">Healthy</span></div>
            </div>
            <div class="cursor c-cust float" style="top: 44px; left: 150px;"><div class="arrow"></div><span class="tag">Maya</span></div>
          </div>

          <div style="position:relative;">
            <p class="panel-note">Deploy diff · 14:32 — AI and Devan are both in here</p>
            <div class="diff">
              <div class="row ctx">  readinessProbe:</div>
              <div class="row ctx">    httpGet: { path: /healthz }</div>
              <div class="row rm hl-ai">-   timeoutSeconds: 5</div>
              <div class="row add hl-ai">+   timeoutSeconds: 1</div>
              <div class="row ctx">  serviceAccount:</div>
              <div class="row rm hl-hum">-   role: payments-irsa-v2</div>
              <div class="row add hl-hum">+   role: payments-irsa-v3</div>
            </div>
            <div class="cursor c-ai float" style="top: 58px; left: 168px;"><div class="arrow"></div><span class="tag">AI</span></div>
            <div class="cursor c-hum float" style="top: 128px; left: 150px; animation-delay: 1.1s;"><div class="arrow"></div><span class="tag">Devan</span></div>
          </div>
        </div>
        <p class="concurrent-caption">Two different findings in the <b>same file</b>, being examined <b>at the same time</b> — the AI on the probe, Devan on the IAM role.</p>
      </div>
    `;
  }
}
customElements.define('tensei-shared-canvas', TenseiSharedCanvas);
