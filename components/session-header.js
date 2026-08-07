/**
 * <tensei-session-header>
 * Section 2 — Session header / intro.
 * Frames the scenario: all three participants on prod-eks-1 at once, working
 * the same problem in parallel rather than waiting their turn.
 */
class TenseiSessionHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <p class="overline">Continuous awareness · no case number</p>
      <h1 class="lede">All three of us are on prod-eks-1 right now — working the same problem at the same time.</h1>
      <p class="lede-sub">Maya steers, the AI digs, and Devan (a human specialist who's ambiently on-call across several sessions) leaned in the moment it touched security. Nobody is waiting their turn.</p>
    `;
  }
}
customElements.define('tensei-session-header', TenseiSessionHeader);
