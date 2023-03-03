class BPMCommon {
  static getUserEmailFromCasePage() {
    try {
      const userEmail = sysValues.CURRENT_USER.displayValue;

      if (typeof userEmail === "string" && userEmail.length > 0) {
        return userEmail;
      }
      throw new Error("not userEmail");
    } catch (err) {
      return "stub";
    }
  }
}
