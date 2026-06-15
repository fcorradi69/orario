import { app } from "./app.js";
import { Store } from "./store.js";
import { Binding } from "./binding.js";
import { Validator } from "./validator.js";

export class CalcoloComponent extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = /*html*/ `
              <header>
                <div class="title">Calcolo orario</div>
                <div class="subtitle" js-model="Data"></div>
              </header>

              <div class="content">
                <div>
                  Orario giornaliero: <span js-model="OrarioGiornaliero"></span>
                </div>
                <div>
                  Pausa minima: <span js-model="PausaMinima"></span>
                </div>
                <div class="inputs-grid" style="margin-top: 30px">
                  <label>Entrata:</label>
                  <input js-model="Entrata1" type="text" inputmode="numeric" placeholder="00:00" maxlength="5">
                  <label>Uscita:</label>
                  <input js-model="Uscita1" type="text" inputmode="numeric" placeholder="00:00" maxlength="5">
                  <label>Entrata:</label>
                  <input js-model="Entrata2" type="text" inputmode="numeric" placeholder="00:00" maxlength="5">
                  <label>Uscita:</label>
                  <input class="input" js-model="Uscita2" type="text" placeholder="00:00" disabled >
                  <!-- <div class="input" js-model="Uscita2">&nbsp;</div> -->
                </div>
                <div id="log"></div>
                <input type="file" id="fileupload" style="display: none">
              </div>
              <div class="footer buttons-group" style="margin-top: 10px">
                <button id="CalcolaButton">
                  <icon-component icon="calcola" size="42" text="Calcolo"/>
                </button>
                <button id="AzzeraButton">
                  <icon-component icon="azzera" size="42" text="Azzera"/>
                </button>
                <button id="DefaultsButton">
                  <icon-component icon="defaults" size="42" text="Defaults"/>
                </button>
                <button id="ImportButton">
                  <icon-component icon="import" size="42" text="Importa"/>
                </button>
                <button id="ExportButton">
                  <icon-component icon="export" size="42" text="Esporta"/>
                </button>
              </div>
              <confirm-dialog message="Sicuro di voler azzerare?"></confirm-dialog>
            `;
    this.orario;
    this.binding = new Binding(this);
    this.inputs = this.querySelectorAll("input[js-model]");
    this.inputs.forEach((element) => {
      element.addEventListener("focus", (event) => element.select());
      element.addEventListener("blur", (event) => {
        if (element.value.indexOf(":") === -1) {
          let value = element.value.padStart(4, "0");
          this.orario[element.attributes["js-model"].value] = value.substring(0, 2) + ":" + value.substring(2);
          element.value = this.orario[element.attributes["js-model"].value];
        } else {
          let value = element.value.replace(":", "").padStart(4, "0");
          this.orario[element.attributes["js-model"].value] = value.substring(0, 2) + ":" + value.substring(2);
          element.value = this.orario[element.attributes["js-model"].value];
        }
      });
    });
    this.fileupload = this.querySelector("#fileupload");
    this.CalcolaButton = this.querySelector("#CalcolaButton");
    this.AzzeraButton = this.querySelector("#AzzeraButton");
    this.DefaultsButton = this.querySelector("#DefaultsButton");
    this.ImportButton = this.querySelector("#ImportButton");
    this.ExportButton = this.querySelector("#ExportButton");
    this.confirmdialog = this.querySelector("confirm-dialog");
  }

  async connectedCallback() {
    this.classList.add("page", "page-in");
    this.DataBind();
    //this.inputs[0].focus();

    this.CalcolaButton.addEventListener("click", (event) => {
      this.CalcoloOre();
    });

    this.AzzeraButton.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform" && !event.currentTarget.matches(":active")) this.confirmdialog.show();
    });

    this.confirmdialog.addEventListener("close", (event) => {
      if (event.detail) {
        this.Azzera();
      }
    })

    this.DefaultsButton.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform" && !event.currentTarget.matches(":active")) {
        this.classList.remove("page-in");
        this.classList.add("page-out");
        document.querySelector(".page-out").addEventListener("animationend", () => app.navigate("defaults"));
      }
    });

    this.ImportButton.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform" && !event.target.matches(":active")) this.fileupload.click();
    });

    this.fileupload.addEventListener("change", (event) => {
      if (event.target.files.length === 0) return;
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        let value = "";
        reader.onload = () => {
          value = reader.result?.toString() ?? "";
        };

        reader.onloadend = () => {
          let json = JSON.parse(value);
          Store.set(json);
          this.DataBind();
        };

        reader.readAsText(file, "uft8");
      }
      fileupload.value = "";
    });

    this.ExportButton.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform" && !event.currentTarget.matches(":active")) {
        const json = JSON.stringify(this.orario, null, 2) ?? "{}";
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "orario.json";
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  DataBind = () => {
    Store.get().then((data) => {
      this.orario = new Proxy(data, new Validator());
      this.binding.DataSource(this.orario);
    });
  };

  CalcoloOre = () => {
    let og = this.orario.OrarioGiornaliero.split(":");
    let pausaminima = this.orario.PausaMinima.split(":");
    let entrata1 = this.orario.Entrata1.split(":");
    let uscita1 = this.orario.Uscita1.split(":");
    let entrata2 = this.orario.Entrata2.split(":");
    let pausaminimaminuti = +pausaminima[0] * 60 + +pausaminima[1];
    let pausaminuti = 0;

    if (uscita1[0] > 0 && entrata2[0] >= uscita1[0]) {
      let pausastart = new Date().setHours(+uscita1[0], +uscita1[1], 0);
      let pausaend = new Date().setHours(+entrata2[0], +entrata2[1], 0);
      pausaminuti = Math.floor((pausaend - pausastart) / 1000 / 60);
    }

    if (pausaminuti <= pausaminimaminuti) {
      pausaminuti = pausaminimaminuti;
    }

    let ore = new Date();
    ore.setHours(+og[0], +og[1], 0);
    ore.setHours(ore.getHours() + +entrata1[0], ore.getMinutes() + +entrata1[1]);
    ore.setHours(ore.getHours(), ore.getMinutes() + pausaminuti, 0);
    this.orario.Uscita2 = `${ore.getHours().toString().padStart(2, "0")}:${ore.getMinutes().toString().padStart(2, "0")}`;
    this.orario.Id = Store.Storeid();
    Store.set(this.orario).then(() => {
      this.DataBind();
      //this.inputs[0].focus();
    });
  };

  Azzera = () => {
    Store.delete().then(() => {
      this.DataBind();
      //this.inputs[0].focus();
    });
  };

  Import = () => {
    app.Import().then(() => this.DataBind());
  };

  Export = () => {
    app.Export();
  };

  async disconnectedCallback() {
    this.innerHTML = "";
    this.remove();
  }
}
customElements.define("calcolo-component", CalcoloComponent);