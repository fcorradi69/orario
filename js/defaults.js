import { app } from "./app.js";
import { Store } from "./store.js";
import { Binding } from "./binding.js";
import { Validator } from "./validator.js";

export class DefaultsComponent extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /*html*/ `
                 <header>
                   <button id="DefaultsCloseButton" class="leading" style="height: 42px" >
                     <icon-component icon="arrow", size="42" />
                   </button>
                   <div class="title">Dati defaults</div>
                   <div class="subtitle">Orario giornaliero e pausa minima</div>
                 </header>
                 <div class="content">
                   <div class="inputs-grid" style="grid-template-columns: 100px 1fr;">
                     <label>Giornaliero:</label>
                     <input js-model="OrarioGiornaliero" type="text" inputmode="numeric" placeholder="0:00" maxlength="5">
                     <label>Pausa:</label>
                     <input js-model="PausaMinima" type="text" inputmode="numeric" placeholder="0:00" maxlength="5">
                   </div>
                 </div>
                `;
    this.orario;
    this.binding = new Binding(this);
    this.inputs = this.querySelectorAll("input[js-model]");
    this.inputs.forEach((element) => {
      element.addEventListener("focus", (event) => element.select());
      element.addEventListener("blur", (event) => {
        if (element.value.indexOf(":") === -1) {
          let value = "";

          if (element.value.length <= 3) {
            value = element.value.padStart(3, "0");
            this.orario[element.attributes["js-model"].value] = `${value.substring(0, 1)}:${value.substring(1)}`;
          } else {
            value = element.value.substring(0, 4);
            this.orario[element.attributes["js-model"].value] = `${value.substring(0, 2)}:${value.substring(2, 4)}`;
          }

          element.value = this.orario[element.attributes["js-model"].value];
        }
      });
    });

    this.DefaultsCloseButton = this.querySelector("#DefaultsCloseButton");
  }

  DataBind = () => {
    Store.get().then((result) => {
      this.orario = new Proxy(result, new Validator());
      this.binding.DataSource(this.orario);
    });
  };

  async connectedCallback() {
    this.classList.add("page", "page-in-right");
    this.DataBind();
    this.DefaultsCloseButton.addEventListener("click", () => {
      Store.set(this.orario).then(() => {
        this.classList.remove("page-in-right");
        this.classList.add("page-out-right");
        document.querySelector(".page-out-right").addEventListener("animationend", () => app.navigate("calcolo"));
      });
    });
  }

  async disconnectedCallback() {
    this.innerHTML = "";
    this.remove();
  }
}

customElements.define("defaults-component", DefaultsComponent);