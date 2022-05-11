require("dotenv").config();

const express = require("express");
var cors = require("cors");
// const axios = require("axios");
const collection = require("./scripts/firestoreHelper");
const fileUpload = require("express-fileupload");
const path = require('path')
const fs = require('fs')

let helper = require("./scripts/helper.js");
let googlePlace = require("./scripts/googlePlace.js");
let getService = require("./service/getService");

const NO_TASKS = "No Tasks Available!";
const uploadsPath = path.join(__dirname, 'uploads', 'proof')

const PORT = process.env.PORT || 3000;
const app = express();
app.listen(PORT);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(fileUpload({
  safeFileNames: true,
  createParentPath: true,
  preserveExtension: true
}))


// Get (get all route)
app.get("/tasks/:id", async function (req, res) {
  console.log(req.headers)
  console.log(req.params.id)
  try {
    let tasks = await getService.getTasks(req.params.id);
    res.status(200).send(tasks);
    console.log("# of All Tasks:" + tasks.length);
  } catch (err) {
    console.warn(err);
    res.status(400).send(NO_TASKS);
  }
});

// Get all tasks for 1 user
app.get("/mytasks/:id", async function (req, res) {
  console.log(req.headers)
  console.log(req)
  console.log(req.params.id)
  try {
    let tasks = await getService.getUserTasks(req.params.id);
    console.log(tasks)
    res.status(200).send(tasks);
    console.log("# of User Tasks:" + tasks.length);
  } catch (err) {
    console.warn(err);
    res.status(400).send(NO_TASKS);
  }
});

// Task (get single)
app.get("/task/:taskId", async function (req, res) {
  let task;
  console.log(req)
  try {
    task = await getService.getSingleTask(req.params.taskId);

    res.status(200).send(task);
  } catch (err) {
    console.log(err);
    res.status(404).send(`Task not found for task ID: ${req.params.taskId}`);
  }
});

// Add (post)
app.post("/add", async function (req, res) {
  const data = req.body;

  console.log(data);
  console.log(req.body);

  if (
    !data ||
    !data.uid ||
    !data.taskname ||
    !data.location ||
    data.isPublic == null
  ) {
    res.status(400).send("data not valid");
    return;
  }
  try {
    await getService.submitTask(data)

    res.status(200).send(`Thank You! Your task: "${data.taskname}" has been added!`);
  } catch (error) {
    console.warn(error);
    res.status(400).send("task could not bet added");
  }
});

// Delete{id} delete route
app.delete("/delete/:taskId", async function (req, res) {
  const taskIdToDelete = req.params.taskId;

  console.log("DELETING TASK: " + taskIdToDelete);
  await collection.tasklist.doc(taskIdToDelete).delete();
  res.status(200).send("Task Deleted");
});

// Update Path /update to change status to complete
app.put("/update/:taskId", async function (req, res) {
  const taskIdToUpdate = req.params.taskId;
  const snapshot = await collection.tasklist.doc(taskIdToUpdate).get();
  let reqStatusChange = req.body.status;

  let updateStatus = helper.findStatus(reqStatusChange);
  if (updateStatus !== "NONE") {
    await collection.tasklist
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
  const data = req.body;
  console.log(req);
  console.log(`Searching for: ${data.address}`);
  if (!data) {
    res.status(400).send("Must include address to search");
  } else {
    let results = await googlePlace.findFromAddress(data.address);
    console.log(results);
    res.status(200).send(results);
  }
});

// File Uploading
app.post("/upload/:taskId", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  if (!req.params.taskId){
    return res.status(400).send('no task id provided!')
  }

  let fileProof = req.files.proof
  let fileProofName = fileProof.name
  let fileExtension = fileProofName.split('.').pop()
  let fileChangedName = `${req.params.taskId}.${fileExtension}`
  console.log(`
  fileProof: ${fileProof}
  fileProofName: ${fileProofName}
  fileExtension: ${fileExtension}
  fileChangedName: ${fileChangedName}
  `)

  fileProof.mv(path.join(uploadsPath, fileChangedName), function(err) {
    if (err)
    return res.status(500).send(err)
  })
  console.log(`File Uploaded for task ${req.params.taskId}: ${fileProof.name}`)

  res.status(200).send("File uploaded successfully")
})

// Get proof of task completion
app.get("/proof/:taskId",async function (req, res) {
  console.log('Searching for proof')
  let taskId = req.params.taskId
  if (!taskId) {
    console.log('Searching for proof with no task Id')
    return res.status(400).send({'status': 'fail', 'message': 'no task Id Provided'})
  }

  let searchFiles = fs.readdirSync(uploadsPath)
  console.log(searchFiles)

  searchFiles.find(filename => {
    if (filename.includes(taskId)) {
      console.log('starting array search')
      fullFilePath = path.join(uploadsPath, filename)
      console.log(`FilePath Requested: ${fullFilePath}`)
      res.status(200).sendFile(fullFilePath, (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
    else {
      console.log('no proof found')
      res.status(400).send({'status': 'fail', 'message': 'an error occured finding file'})
    }
  })
})