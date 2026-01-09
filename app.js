class Orario {
  #og = "7:12";
  #pausaminima = "0:30";
  #defaultvalue = "00:00";
  #pattern = /[.,;-_]/gm;

  #DataCorrente() {
    let data = new Date();
    let giorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
    let mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    let result = `${giorni[data.getDay()]} ${data.getDate()} ${mesi[data.getMonth()]} ${data.getFullYear()}`;
    return result;
  }

  constructor() {
    this.Id = "";
    this.OrarioGiornaliero = this.#og;
    this.PausaMinima = this.#pausaminima;
    this.Data = this.#DataCorrente();
    this.Entrata1 = this.#defaultvalue;
    this.Uscita1 = this.#defaultvalue;
    this.Entrata2 = this.#defaultvalue;
    this.Uscita2 = this.#defaultvalue;
  }
}

class Validator {
  constructor() {
    return {
      get(target, property, receiver) {
        return target[property];
      },

      set(target, property, value) {
        switch (property) {
          case "OrarioGiornaliero":
          case "PausaMinima":
          case "Entrata1":
          case "Uscita1":
          case "Entrata2":
            if (target[property] != value) {
              const pattern1 = /(?:[^0-9:.])+/gm;
              const pattern2 = /[.]+/gm;
              const pattern3 = /(:)\1+/gm;
              target[property] = value.replace(pattern1, "").replace(pattern2, ":").replace(pattern3, "$1");
            }
            return true;
            break;

          default:
            if (target[property] != value) {
              target[property] = value;
            }
            return true;
            break;
        }
      },
    };
  }
}

class Store {
  static storename = "orario";

  static Storeid() {
    const data = new Date();
    return `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, "0")}-${data.getDate().toString().padStart(2, "0")}`;
  }

  static async get() {
    const result = new Orario();

    try {
      let json = localStorage.getItem(this.storename);
      if (json) {
        let data = JSON.parse(json) ?? new Orario();
        if (Object.keys(data).length > 0) return data;
      }
      return result;
    } catch (error) {
      throw error;
      return result;
    }
  }

  static async set(value) {
    if (value) {
      let json = JSON.stringify(value, null, 2);
      localStorage.setItem(this.storename, json);
    }
  }

  static async delete() {
    localStorage.removeItem(this.storename);
  }
}

class Binding {
  constructor(source) {
    this.attributename = "js-model";
    this.elements = source.querySelectorAll(`[${this.attributename}]`);
    this.state;

    this.elements.forEach((element) => {
      let property = element.getAttribute(this.attributename);
      switch (element.type) {
        case "text":
        case "textarea":
          element.addEventListener("keyup", (event) => {
            this.state[property] = element.value;
          });
          break;

        case "select-one":
        case "autocomplete":
          element.addEventListener("change", (event) => {
            this.state[property] = element.value;
          });
          break;

        case "radio":
          element.addEventListener("click", (event) => {
            this.state[property] = element.value;
            element.checked = true;
          });
          break;

        case "checkbox":
          element.addEventListener("click", (event) => {
            this.state[property] = !state[property];
            element.checked = this.state[property];
          });
          break;
      }
    });
  }

  CreateState = (datasource) => {
    return new Proxy(datasource, {
      set: (target, property, value) => {
        target[property] = value;
        this.render();
        return true;
      },
    });
  };

  render = () => {
    this.elements.forEach((element) => {
      let property = element.getAttribute(this.attributename);
      switch (element.type) {
        case "text":
        case "textarea":
        case "select-one":
        case "autocomplete":
          element.value = this.state[property];
          break;

        case "radio":
          element.checked = this.state[property] == element.value;
          break;

        case "checkbox":
          element.checked = this.state[property];
          break;

        default:
          if (!element.type) element.innerHTML = this.state[property];
          break;
      }
    });
  };

  DataSource = (data) => {
    this.state = this.CreateState(data);
    this.render();
  };
}

customElements.define(
  "confirm-dialog",
  class ConfirmDialog extends HTMLElement {
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
);

customElements.define(
  "defaults-component",
  class DefaultsComponent extends HTMLElement {
    constructor() {
      super();

      this.innerHTML = /*html*/ `
                 <header>
                   <button id="DefaultsCloseButton" class="leading" style="height: 42px" >
                     <icon-component icon="arrow", size="42" />
                   </button>
                   <div class="title">Dati defaults</div>
                   <div class="subtitle" style="padding-top: 10px">Orario giornaliero e pausa minima</div>
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
);

customElements.define(
  "icon-component",
  class IconComponent extends HTMLElement {
    constructor() {
      super();

      this.icons = [
        {
          name: "arrow",
          viewbox: "0 0 36 36",
          content: `<path d="M36 19.2251H4.68512L19.7294 34.2694L17.9988 36L0 18.0012L18.0012 0L19.7318 1.7306L4.68512 16.7773H36V19.2251Z"/>`,
        },
        {
          name: "calcola",
          viewbox: "0 0 42 42",
          content: `<path d="M30.9258 19.8516C37.0322 19.8516 42 24.8194 42 30.9258C42 37.0322 37.0322 42 30.9258 42C28.3946 42.0023 25.9398 41.1334 23.9738 39.5391H3.69141C1.65605 39.5391 0 37.883 0 35.8477V3.69141C0 1.65605 1.65605 0 3.69141 0H26.0039C28.0393 0 29.6953 1.65605 29.6953 3.69141V19.9205C30.1039 19.8748 30.5147 19.8518 30.9258 19.8516ZM21.7222 37.0781C20.5003 35.2592 19.849 33.117 19.8516 30.9258C19.849 28.7345 20.5003 26.5924 21.7222 24.7734H21.082C20.7557 24.7734 20.4428 24.6437 20.2121 24.413C19.9814 24.1822 19.8518 23.8693 19.8518 23.543C19.8518 23.2167 19.9814 22.9037 20.2121 22.673C20.4428 22.4422 20.7557 22.3126 21.082 22.3125H23.543C23.6693 22.3125 23.7914 22.3315 23.9062 22.367C24.8981 21.5514 26.0242 20.9145 27.2344 20.4848V3.69141C27.234 3.36517 27.1043 3.0524 26.8736 2.82172C26.6429 2.59104 26.3301 2.46129 26.0039 2.46094H3.69141C3.36517 2.46129 3.0524 2.59104 2.82172 2.82172C2.59103 3.0524 2.46128 3.36517 2.46094 3.69141V35.8477C2.46129 36.1739 2.59103 36.4867 2.82172 36.7174C3.0524 36.948 3.36517 37.0778 3.69141 37.0781H21.7222ZM35.8477 29.6953C36.174 29.6953 36.487 29.825 36.7177 30.0557C36.9485 30.2865 37.0781 30.5994 37.0781 30.9258C37.0781 31.2521 36.9485 31.5651 36.7177 31.7959C36.487 32.0266 36.174 32.1563 35.8477 32.1563H30.9258C30.5994 32.1563 30.2865 32.0266 30.0557 31.7959C29.825 31.5651 29.6953 31.2521 29.6953 30.9258V26.0039C29.6953 25.6776 29.825 25.3646 30.0557 25.1338C30.2865 24.9031 30.5994 24.7734 30.9258 24.7734C31.2521 24.7734 31.5651 24.9031 31.7959 25.1338C32.0266 25.3646 32.1562 25.6776 32.1562 26.0039V29.6953H35.8477ZM30.9258 39.5391C35.6751 39.5391 39.5391 35.6751 39.5391 30.9258C39.5391 26.1765 35.6751 22.3125 30.9258 22.3125C26.1765 22.3125 22.3125 26.1765 22.3125 30.9258C22.3125 35.6751 26.1765 39.5391 30.9258 39.5391ZM23.543 4.92188C23.8693 4.92188 24.1823 5.05151 24.413 5.28227C24.6438 5.51303 24.7734 5.826 24.7734 6.15234V13.6992C24.7734 14.0256 24.6438 14.3385 24.413 14.5693C24.1823 14.8001 23.8693 14.9297 23.543 14.9297H6.15234C5.826 14.9297 5.51303 14.8001 5.28227 14.5693C5.05151 14.3385 4.92188 14.0256 4.92188 13.6992V6.15234C4.92188 5.826 5.05151 5.51303 5.28227 5.28227C5.51303 5.05151 5.826 4.92188 6.15234 4.92188H23.543ZM22.3125 12.4688V7.38281H7.38281V12.4688H22.3125ZM16.1602 17.3906C16.4865 17.3907 16.7994 17.5204 17.0301 17.7511C17.2608 17.9819 17.3904 18.2948 17.3904 18.6211C17.3904 18.9474 17.2608 19.2603 17.0301 19.4911C16.7994 19.7218 16.4865 19.8515 16.1602 19.8516H6.15234C5.82604 19.8515 5.51313 19.7218 5.28242 19.4911C5.05171 19.2603 4.9221 18.9474 4.9221 18.6211C4.9221 18.2948 5.05171 17.9819 5.28242 17.7511C5.51313 17.5204 5.82604 17.3907 6.15234 17.3906H16.1602ZM8.61328 22.3125C8.93958 22.3126 9.2525 22.4422 9.48321 22.673C9.71392 22.9037 9.84353 23.2167 9.84353 23.543C9.84353 23.8693 9.71392 24.1822 9.48321 24.413C9.2525 24.6437 8.93958 24.7734 8.61328 24.7734H6.15234C5.82604 24.7734 5.51313 24.6437 5.28242 24.413C5.05171 24.1822 4.9221 23.8693 4.9221 23.543C4.9221 23.2167 5.05171 22.9037 5.28242 22.673C5.51313 22.4422 5.82604 22.3126 6.15234 22.3125H8.61328ZM8.61328 27.2344C8.93958 27.2344 9.2525 27.3641 9.48321 27.5949C9.71392 27.8256 9.84353 28.1385 9.84353 28.4648C9.84353 28.7911 9.71392 29.1041 9.48321 29.3348C9.2525 29.5656 8.93958 29.6953 8.61328 29.6953H6.15234C5.82604 29.6953 5.51313 29.5656 5.28242 29.3348C5.05171 29.1041 4.9221 28.7911 4.9221 28.4648C4.9221 28.1385 5.05171 27.8256 5.28242 27.5949C5.51313 27.3641 5.82604 27.2344 6.15234 27.2344H8.61328ZM8.61328 32.1563C8.93958 32.1563 9.2525 32.286 9.48321 32.5167C9.71392 32.7475 9.84353 33.0604 9.84353 33.3867C9.84353 33.713 9.71392 34.026 9.48321 34.2567C9.2525 34.4875 8.93958 34.6171 8.61328 34.6172H6.15234C5.82604 34.6171 5.51313 34.4875 5.28242 34.2567C5.05171 34.026 4.9221 33.713 4.9221 33.3867C4.9221 33.0604 5.05171 32.7475 5.28242 32.5167C5.51313 32.286 5.82604 32.1563 6.15234 32.1563H8.61328ZM16.1602 22.3125C16.4865 22.3126 16.7994 22.4422 17.0301 22.673C17.2608 22.9037 17.3904 23.2167 17.3904 23.543C17.3904 23.8693 17.2608 24.1822 17.0301 24.413C16.7994 24.6437 16.4865 24.7734 16.1602 24.7734H13.5352C13.2089 24.7734 12.8959 24.6437 12.6652 24.413C12.4345 24.1822 12.3049 23.8693 12.3049 23.543C12.3049 23.2167 12.4345 22.9037 12.6652 22.673C12.8959 22.4422 13.2089 22.3126 13.5352 22.3125H16.1602ZM16.1602 27.2344C16.4865 27.2344 16.7994 27.3641 17.0301 27.5949C17.2608 27.8256 17.3904 28.1385 17.3904 28.4648C17.3904 28.7911 17.2608 29.1041 17.0301 29.3348C16.7994 29.5656 16.4865 29.6953 16.1602 29.6953H13.5352C13.2089 29.6953 12.8959 29.5656 12.6652 29.3348C12.4345 29.1041 12.3049 28.7911 12.3049 28.4648C12.3049 28.1385 12.4345 27.8256 12.6652 27.5949C12.8959 27.3641 13.2089 27.2344 13.5352 27.2344H16.1602ZM16.1602 32.1563C16.4865 32.1563 16.7994 32.286 17.0301 32.5167C17.2608 32.7475 17.3904 33.0604 17.3904 33.3867C17.3904 33.713 17.2608 34.026 17.0301 34.2567C16.7994 34.4875 16.4865 34.6171 16.1602 34.6172H13.5352C13.2089 34.6171 12.8959 34.4875 12.6652 34.2567C12.4345 34.026 12.3049 33.713 12.3049 33.3867C12.3049 33.0604 12.4345 32.7475 12.6652 32.5167C12.8959 32.286 13.2089 32.1563 13.5352 32.1563H16.1602ZM23.543 17.3906C23.8693 17.3907 24.1822 17.5204 24.4129 17.7511C24.6436 17.9819 24.7732 18.2948 24.7732 18.6211C24.7732 18.9474 24.6436 19.2603 24.4129 19.4911C24.1822 19.7218 23.8693 19.8515 23.543 19.8516H21.082C20.7557 19.8515 20.4428 19.7218 20.2121 19.4911C19.9814 19.2603 19.8518 18.9474 19.8518 18.6211C19.8518 18.2948 19.9814 17.9819 20.2121 17.7511C20.4428 17.5204 20.7557 17.3907 21.082 17.3906H23.543Z"/>`,
        },
        {
          name: "azzera",
          viewbox: "0 0 42 42",
          content: `<path d="M42 18.606C42 16.5628 40.3373 14.9001 38.2941 14.9001H26.4155L27.1196 12.642L27.1765 3.70588C27.1765 1.66271 25.5138 0 23.4706 0H18.5294C16.4862 0 14.8235 1.66271 14.8235 3.70588V12.2344L15.5894 14.9026H3.70588C1.66271 14.9026 0 16.5653 0 18.6085V27.2209H2.30259L0.410118 42H41.5899L39.6974 27.2209H42V18.606ZM38.7833 39.5294H34.5882V34.5882H32.1176V39.5294H29.6471V32.1176H27.1765V39.5294H24.7059V29.6471H22.2353V39.5294H9.88235V34.5882H7.41176V39.5294H3.21671L4.79294 27.2209H37.2071L38.7833 39.5294ZM2.61882 24.7504H2.47059V18.606C2.47059 17.9241 3.024 17.3707 3.70588 17.3707H18.9371L17.2941 12.0466V3.70588C17.2941 3.024 17.8475 2.47059 18.5294 2.47059H23.4706C24.1525 2.47059 24.7059 3.024 24.7059 3.70588V12.0886L23.058 17.3707H38.2941C38.976 17.3707 39.5294 17.9241 39.5294 18.606V24.7479L2.61882 24.7504ZM19.7647 4.94118H22.2353V7.41176H19.7647V4.94118Z"/>`,
        },
        {
          name: "defaults",
          viewbox: "0 0 42 42",
          content: `<path d="M21 14.8235C17.5955 14.8235 14.8235 17.5955 14.8235 21C14.8235 24.4045 17.5955 27.1765 21 27.1765C24.4045 27.1765 27.1765 24.4045 27.1765 21C27.1765 17.5955 24.4045 14.8235 21 14.8235ZM21 24.7059C18.9568 24.7059 17.2941 23.0432 17.2941 21C17.2941 18.9568 18.9568 17.2941 21 17.2941C23.0432 17.2941 24.7059 18.9568 24.7059 21C24.7059 23.0432 23.0432 24.7059 21 24.7059ZM41.8518 23.4064C41.9432 22.6133 42 21.8128 42 21C42 20.1872 41.9432 19.3867 41.8518 18.5936L35.4579 16.6715C35.1639 15.6784 34.7711 14.7272 34.2868 13.8328L37.4467 7.96024C36.4436 6.70024 35.2998 5.55635 34.0373 4.55082L28.1647 7.71318C27.2679 7.22894 26.3167 6.83859 25.3235 6.54212L23.4064 0.148235C22.6158 0.0568235 21.8153 0 21 0C20.1847 0 19.3842 0.0568235 18.5936 0.148235L16.6765 6.54212C15.6808 6.83612 14.7272 7.22894 13.8353 7.71565L7.96271 4.55329C6.70024 5.55635 5.55635 6.70024 4.55576 7.96271L7.71565 13.8304C7.23141 14.7247 6.84106 15.6784 6.54459 16.6715L0.148235 18.5936C0.0568235 19.3842 0 20.1847 0 21C0 21.8153 0.0568235 22.6158 0.148235 23.4064L6.54212 25.3235C6.83859 26.3192 7.22894 27.2728 7.71318 28.1672L4.55329 34.0373C5.55635 35.2998 6.70024 36.4436 7.96271 37.4467L13.8353 34.2868C14.7296 34.7711 15.6833 35.1614 16.6765 35.4579L18.5936 41.8518C19.3867 41.9432 20.1872 42 21 42C21.8128 42 22.6158 41.9432 23.4064 41.8518L25.3235 35.4579C26.3167 35.1614 27.2704 34.7711 28.1647 34.2868L34.0348 37.4467C35.2973 36.4412 36.4412 35.2973 37.4442 34.0348L34.2868 28.1647C34.7711 27.2704 35.1614 26.3167 35.4579 25.3235L41.8518 23.4064ZM33.4715 23.3396L33.0911 24.6194C32.844 25.452 32.5154 26.25 32.1127 26.9887L31.4802 28.1622L32.1102 29.3358L34.4622 33.7087C34.2176 33.9681 33.9656 34.2201 33.7062 34.4647L28.1647 31.4778L26.9912 32.1102C26.2475 32.5129 25.4495 32.8391 24.6194 33.0886L23.3396 33.4691L22.9567 34.7488L21.5262 39.522C21.3484 39.5269 21.1729 39.5294 21 39.5294C20.8271 39.5294 20.6516 39.5269 20.4738 39.522L19.0433 34.7488L18.6604 33.4691L17.3806 33.0886C16.5505 32.8415 15.7525 32.5129 15.0113 32.1102L13.8378 31.4778L8.29129 34.4598C8.03435 34.2152 7.77988 33.9632 7.53529 33.7038L10.5198 28.1598L9.88729 26.9862C9.48706 26.2451 9.15847 25.4471 8.90894 24.6145L8.53094 23.3372L2.48047 21.5238C2.47306 21.3459 2.47059 21.1705 2.47059 21C2.47059 20.8271 2.47306 20.6516 2.48047 20.4738L8.52847 18.6604L8.90894 17.3806C9.156 16.548 9.48459 15.75 9.88729 15.0113L10.5198 13.8378L7.53529 8.29129C7.77988 8.03435 8.03188 7.77988 8.28882 7.53529L13.8402 10.5247L15.0162 9.88482C15.75 9.48459 16.5455 9.156 17.3781 8.90894L18.6579 8.52847L19.0408 7.24871L20.4713 2.47553C20.6516 2.47306 20.8271 2.47059 21 2.47059C21.1729 2.47059 21.3484 2.47306 21.5262 2.478L22.9567 7.25118L23.3396 8.53094L24.6194 8.91141C25.4471 9.15847 26.2475 9.48706 26.9912 9.88976L28.1647 10.5198L33.7087 7.53529C33.9656 7.77988 34.2201 8.03188 34.4647 8.29129L32.1102 12.6642L31.4802 13.8378L32.1152 15.0113C32.5179 15.7525 32.844 16.548 33.0911 17.3756L33.4715 18.6554L34.7513 19.0384L39.5245 20.4738C39.5269 20.6516 39.5294 20.8271 39.5294 21C39.5294 21.1729 39.5269 21.3484 39.5195 21.5262L33.4715 23.3396Z"/>`,
        },
        {
          name: "import",
          viewbox: "0 0 42 42",
          content: `<path d="M21 31.3888L9.01024 19.4559L10.752 17.7042L19.7647 26.6749V0H22.2353V26.6749L31.2455 17.7067L32.9873 19.4584L21 31.3888ZM39.5294 19.908V35.8927C39.5294 36.5746 38.976 37.128 38.2941 37.128H3.70588C3.024 37.128 2.47059 36.5746 2.47059 35.8927V19.8956H0V35.8927C0 37.9359 1.66271 39.5986 3.70588 39.5986H38.2941C40.3373 39.5986 42 37.9359 42 35.8927V19.908H39.5294Z"/>`,
        },
        {
          name: "export",
          viewbox: "0 0 42 42",
          content: `<path d="M10.7693 14.301L8.99541 12.5528L21 0L33.0046 12.5528L31.2307 14.2985L22.2353 4.89323V31.8975H19.7647V4.89323L10.7693 14.301ZM39.5294 22.0107V38.2379C39.5294 38.9301 38.976 39.4919 38.2941 39.4919H3.70588C3.024 39.4919 2.47059 38.9301 2.47059 38.2379V21.9982H0V38.2379C0 40.3121 1.66271 42 3.70588 42H38.2941C40.3373 42 42 40.3121 42 38.2379V22.0107H39.5294Z"/>`,
        },
      ];
    }

    async connectedCallback() {
      const size = this.getAttribute("size");
      const name = this.getAttribute("icon");
      const text = this.getAttribute("text") ?? "";
      const icon = this.icons.find((item) => item.name === name);
      this.innerHTML = `
              <svg width="${size}" height="${size}" viewBox="${icon.viewbox}" xmlns="http://www.w3.org/2000/svg">${icon.content}</svg>
            `;
      if (text) {
        this.setAttribute("style", "display: flex; flex-direction: column; align-items: center;");
        this.innerHTML += `<span>${text}</span>`;
      }
    }
  }
);

customElements.define(
  "calcolo-component",
  class CalcoloComponent extends HTMLElement {
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
                  <div class="input" js-model="Uscita2">&nbsp;</div>
                </div>
                <div id="log"></div>
                <input type="file" id="fileupload" style="display: none">
              </div>
              <div class="footer buttons-group" style="margin-top: 30px">
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

      this.AzzeraButton.addEventListener("click", (event) => {
        this.confirmdialog.show();
      });

      this.confirmdialog.addEventListener("close", event => {
        if (event.detail) {
          this.Azzera();
        }
      })

      this.DefaultsButton.addEventListener("click", (event) => {
        this.classList.remove("page-in");
        this.classList.add("page-out");
        document.querySelector(".page-out").addEventListener("animationend", () => app.navigate("defaults"));
      });

      this.ImportButton.addEventListener("click", (event) => {
        this.fileupload.click();
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

      this.ExportButton.addEventListener("click", (event) => {
        const json = JSON.stringify(this.orario, null, 2) ?? "{}";
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "orario.json";
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
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
);

const app = {
  routeid: "orario.route",

  init() {
    const route = sessionStorage.getItem(this.routeid) ?? "calcolo";
    this.navigate(route);
  },

  navigate(route = "start") {
    sessionStorage.setItem(this.routeid, route);
    const root = document.querySelector("#app");
    root.innerHTML = `<${route}-component></${route}-component>`;
  },
};

app.init();