class RegistrationInterface {
  constructor() {
    if (!this.getNumberRegistrations) {
      throw new Error("registrationHelper must have items!");
    }
  }
}

module.exports = RegistrationInterface;
