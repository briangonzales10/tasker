// import { Status } from "./status";
const Status = require("./status.js");
exports.findStatus = function findStat(name) {
  let fixedName = name.toLowerCase();
  if (fixedName === "open") return Status.Status.open.getStatus();
  else if (fixedName === "complete") return Status.Status.complete.getStatus();
  else if (fixedName === "rejected") return Status.Status.rejected.getStatus();
  else if (fixedName === "abandoned")
    return Status.Status.abandoned.getStatus();
  else return Status.Status.none.getStatus();
};

exports.findStatus2 = function find(name) {
  let fixedName = name.toLowerCase();
  const enumMap = {
    open: "OPEN",
    complete: "COMPLETE",
    rejected: "REJECTED",
    abandoned: "ABANDONED",
  };

  if (fixedName in enumMap) {
    return enumMap[fixedName];
  } else {
    return "NONE";
  }
};

exports.getBoolean = function getBoolean(stringValue) {
  if (stringValue === 'true') {
    return true;
  }
  else if (stringValue === 'false') {
    return false;
  } else {
    return true;
  }
}
