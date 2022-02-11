require("dotenv").config();
const express = require("express");
var cors = require('cors')
const axios = require('axios')

const fs = require("firebase-admin");
// let taskStatus = require("./scripts/status");
// import { Status } from "./scripts/status.js";
let helper = require("./scripts/helper.js");
let googlePlace = require("./scripts/googlePlace.js")
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

const PORT = process.env.PORT || 3000;
const app = express();
app.listen(PORT);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors())


//Open DB connection
fs.initializeApp({
  credential: fs.credential.cert(serviceAccount),
});
const db = fs.firestore();
const tasklistCollection = db.collection("tasklist");
const usersCollection = db.collection('users')

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

  console.log(data)
  console.log(req.body)

  if (!data || !data.uid || !data.taskname || !data.location || data.isPublic == null) {
    res.status(400).send('data not valid')
    return;
  }

  let booleanIsPublic = helper.getBoolean(data.isPublic)

  let time = Timestamp.now();

  let taskObject = {
    timestamp: time, //backend derived
    taskname: data.taskname, //front end
    location: { //frontend
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      address: data.location.address
    },
    status: `OPEN`, //backend for new tasks of course
    picUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80',//data.picUrl, //needs to be backend from pic URL service
    remarks: data.remarks, //frontend
    isPublic: booleanIsPublic, //frontend
    isComplete: false,
    submittedBy: data.uid //front end uuid of user & required update user Tasks
  };
  console.log(taskObject);
  try {
    let myTaskId;
    let taskIdNew = await tasklistCollection.add(taskObject)
      .then( (results) => {
        console.log(results)
        myTaskId = results.id
      })
      .catch((err) => {
        console.log(err)
      })
    
    usersCollection.doc(data.uid).update({
      submittedTasks: FieldValue.arrayUnion(myTaskId) })
      .then ((res) => {
        console.log(res)
      })
      .catch( (err) => {
        console.log(err)
      })
      
    
    res.status(200).send(`Thank You! Your task: "${data.taskname}" has been added!`);
  } catch (error) {
    console.warn(error)
    res.status(400).send('task could not bet added because: ' + error)
  }


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

app.post("/places", async function (req, res) {
  const data = req.body
  console.log(req)
  console.log(`Searching for: ${data.address}`)
  if (!data) {
    res.status(400).send("Must include address to search")
  } else {
    let results = await googlePlace.findFromAddress(data.address)
    console.log(results)
    res.status(200).send(results)
  }



})