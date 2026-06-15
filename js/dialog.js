export class ConfirmDialog extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /*html*/ `
          <dialog>
            <section>
              <article style="justify-content: center;">
                <div style="display: flex; align-items: center; justify-content: flex-start; gap: 10px; padding: 10px; fill: orange; width: 100%;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
                  </svg>
                  <div id="message"></div>
                </div>
              </article>
              <footer>
                <button id="yes-button" class="ripple">Sì</button>
                <button id="no-button" class="ripple">No</button>
              </footer>
            </section>
          </dialog>
        `;

    this.dialog = this.querySelector("dialog");
    this.yesbutton = this.querySelector("#yes-button");
    this.nobutton = this.querySelector("#no-button");
    this.dialogmessage = this.querySelector("#message");
    this.message = "";
    this.closeEvent = (value = null) => new CustomEvent("close", { bubbles: true, cancelable: false, composed: true, detail: value });
  }

  set message(newvalue) {
    this.setAttribute("message", newvalue);
  }

  get message() {
    return this.getAttribute("message");
  }

  static get observedAttributes() {
    return ["message"];
  }

  attributeChangedCallback(property, oldvalue, newvalue) {
    if (oldvalue !== newvalue) {
      switch (property) {
        case "message":
          this.message = newvalue;
          break;
      }
      this.render();
    }
  }

  async connectedCallback() {
    this.yesbutton.addEventListener("click", (event) => {
      this.dialog.close();
      this.dispatchEvent(this.closeEvent(true));
    });

    this.nobutton.addEventListener("click", (event) => {
      this.dialog.close();
      this.dispatchEvent(this.closeEvent(false));
    });
  }

  async disconnectedCallback() {
    this.innerHTML = "";
  }

  show() {
    this.dialog.showModal();
  }

  render() {
    this.dialogmessage.textContent = this.message;
  }
}

customElements.define("confirm-dialog", ConfirmDialog);