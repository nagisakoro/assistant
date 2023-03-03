class LocalStorageService {
  static setEmail(value) {
    localStorage.setItem("email", value);
  }

  static getEmail() {
    return localStorage.getItem("email") || "";
  }
}
