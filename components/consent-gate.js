/**
 * <tensei-consent-gate title="..." blast="...">
 * Section 5 — Consent gate (reusable primitive).
 * The one place the accent colour earns its keep: a bounded, reversible action
 * the human approves before the AI executes. Nested inside the timeline, but
 * kept as its own component so any track can raise a gate.
 *
 * Attributes:
 *   title — the action being proposed
 *   blast — the blast radius / reversibility note
 */
class TenseiConsentGate extends HTMLElement {
  static get observedAttributes() { return ['title', 'blast']; }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const title = this.getAttribute('title') || 'Proposed action';
    const blast = this.getAttribute('blast') || '';
    this.innerHTML = `
      <div class="gate">
        <div class="gate-title">${title}</div>
        <div class="blast">${blast}</div>
        <div class="actions">
          <button class="btn approve" type="button">Approve</button>
          <button class="btn redirect" type="button">Redirect</button>
        </div>
      </div>
    `;
  }
}
customElements.define('tensei-consent-gate', TenseiConsentGate);
