const express = require("express");
const fs = require("firebase-admin");
// let taskStatus = require("./scripts/status");
// import { Status } from "./scripts/status.js";
let helper = require("./scripts/helper.js");
const serviceAccount = require("./resources/taskerdb-11614-firebase-adminsdk-81hw6-ada33abc69.json");

const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

const PORT = process.port.env || 3000;
const app = express();
app.listen(PORT);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//Open DB connection
fs.initializeApp({
  credential: fs.credential.cert(serviceAccount),
});
const db = fs.firestore();
const tasklistCollection = db.collection("tasklist");

//get (get all route)
app.get("/tasks", async function (req, res) {
  let tasks = [];
  const snapshot = tasklistCollection.orderBy("timestamp").get();
  (await snapshot).forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
    tasks.push({ taskid: doc.id, data: doc.data() });
  });
  console.log(`# of Tasks found: ${tasks.length}`);
  res.send(tasks);
});

//task (get single)
app.get("/task/:taskId", async function (req, res) {
  let tasks = [];
  try {
    const singleTask = await tasklistCollection.doc(req.params.taskId).get();

    tasks.push({ taskid: singleTask.id, data: singleTask.data() });

    res.status(200).send(tasks);
  } catch (err) {
    console.log(err);
    res.status(404).send(`Task not found for task ID: ${req.params.taskId}`);
  }
});

//add (post)
app.post("/add", async function (req, res) {
  const data = req.body;
  let time = Timestamp.now();

  let taskObject = {
    timestamp: time,
    taskname: data.taskname,
    location: {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
    status: `OPEN`,
    picUrl: data.picUrl,
  };
  console.log(taskObject);
  tasklistCollection.add(taskObject);

  res.status(200).send(`Task added: ${data.taskname}`);
});

//delete{id} delete route
app.delete("/delete/:taskId", async function (req, res) {
  const taskIdToDelete = req.params.taskId;
  console.log(taskIdToDelete);
  await tasklistCollection.doc(taskIdToDelete).delete();
  res.status(200).send("Task Deleted");
});

//Update Path /update to change status to complete
app.put("/update/:taskId", async function (req, res) {
  const taskIdToUpdate = req.params.taskId;
  const snapshot = await tasklistCollection.doc(taskIdToUpdate).get();
  let reqStatusChange = req.body.status;

  let updateStatus = helper.findStatus(reqStatusChange);
  if (updateStatus !== "NONE") {
    await tasklistCollection
      .doc(taskIdToUpdate)
      .update({ status: updateStatus });

    res
      .status(200)
      .send(`${snapshot.data().taskname} marked as ${updateStatus}`);
  } else {
    res.status(400).send(`'${req.body.status}' is not a valid status!`);
  }
});
