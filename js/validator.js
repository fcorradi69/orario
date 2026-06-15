export class Validator {
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