class CheckInterface {
  constructor() {
    if (!this.getActiveSipTailLog) {
      throw new Error("checkHelper must have items!");
    }
  }
}

module.exports = CheckInterface;
