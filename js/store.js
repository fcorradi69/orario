import { Orario } from "./orario.js";

export class Store {
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