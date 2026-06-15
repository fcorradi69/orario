import "./calcolo.js";
import "./defaults.js";
import "./dialog.js";
import "./icons.js";

export const app = {
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