class AuthService {
  static check() {
    if (/^[\w.]+@mangotele\.com$/i.test($(`div#mango-assistant div#mango-assistant-header .ma-container__auth-email`).val())) {
      MaViewService.setAvailable();
      return;
    }
    MaViewService.setDisable();
  }
}
