export class Binding {
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