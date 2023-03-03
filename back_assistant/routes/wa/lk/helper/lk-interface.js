class lkInterface {
  constructor() {
    if (!this.getLkInfo) {
      throw new Error("lkHelper must have items!");
    }
  }
}

module.exports = lkInterface;
