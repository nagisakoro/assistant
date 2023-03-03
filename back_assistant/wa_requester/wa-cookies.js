class WaCookies {
  constructor() {
    this._cookies = "";
  }

  get getCurrentCookies() {
    return this._cookies;
  }
}

module.exports = new WaCookies();
