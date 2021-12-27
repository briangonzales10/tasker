exports.Status = class Status {
  static open = new Status("OPEN");
  static rejected = new Status("REJECTED");
  static complete = new Status("COMPLETE");
  static abandoned = new Status("ABANDONED");
  static none = new Status("NONE");

  constructor(status) {
    this.status = status;
  }
  getStatus() {
    return this.status;
  }
};
