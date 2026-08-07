/**
 * <tensei-presence-rail>
 * Section 1 — Presence rail.
 * Shows all three teammates (customer, AI, human specialist) active at the
 * same moment. Establishes continuous co-presence with no case number.
 */
class TenseiPresenceRail extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="rail">
        <span class="room-label">Working session</span>
        <div class="presence">
          <div class="who now">
            <div class="avatar a-cust">M</div>
            <div><div class="name">Maya</div><div class="status"><span class="live-dot cust"></span> reviewing pods</div></div>
          </div>
          <div class="who now">
            <div class="avatar a-ai">AI</div>
            <div><div class="name">Support agent</div><div class="status"><span class="live-dot ai"></span> reading kubelet logs</div></div>
          </div>
          <div class="who now">
            <div class="avatar a-hum">DK</div>
            <div><div class="name">Devan · EKS</div><div class="status"><span class="live-dot hum"></span> inspecting IAM/IRSA</div></div>
          </div>
        </div>
        <div class="spacer"></div>
        <span class="all-here">3 working together</span>
      </div>
    `;
  }
}
customElements.define('tensei-presence-rail', TenseiPresenceRail);
