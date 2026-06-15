export class Orario {
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