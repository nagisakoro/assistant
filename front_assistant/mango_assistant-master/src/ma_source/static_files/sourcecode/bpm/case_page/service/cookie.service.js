class CookieService {
  static get(name) {
    try {
      let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
      return matches ? decodeURIComponent(matches[1]) : "";
    } catch (err) {
      return "";
    }
  }
}
