const collection = require('../scripts/firestoreHelper')

//Collection Field names
const IS_COMPLETE = 'isComplete';
const IS_PUBLIC = 'isPublic';
const LOCATION = {address: 'address', latitude: 'latitude', longitude: 'longitude'}
const PICURL = 'picUrl';
const REMARKS = 'remarks';
const STATUS = 'status';
const SUBMITTED_BY = 'submittedBy';
const TASK_NAME_LABEL = 'taskname';
const TIMESTAMP_LABEL = 'timestamp';

exports.getTasks = async function getTasks(adminId) {
    console.log('getting getTasks()')
    if (adminId == process.env.adminUid) {  //only ADMIN allowed to view all public & private tasks
       return await getAllTasks();
    } else {
       return await getPublicTasks();
    }
}

//get public & private tasks
async function getAllTasks() {  
    try {
        let tasks = []
        const snapshot = await collection.tasklist.orderBy(TIMESTAMP_LABEL).get();
        snapshot.forEach (doc => {
            // console.log(doc.id, '=>', doc.data())
            tasks.push({ taskid: doc.id, data: doc.data() });              
        } )
        return tasks;
    } catch (err) {
        console.log(err)
    }
}

async function getPublicTasks() {
    try {
        let tasks = []
        const snapshot = await collection.tasklist.orderBy(TIMESTAMP_LABEL).get();
        snapshot.forEach (doc => {
            // console.log(doc.id, '=>', doc.data())
            if (doc.data().isPublic === true) {
                tasks.push({ taskid: doc.id, data: doc.data() }); 
             }
        } )
        return tasks;
    } catch (err) {
        console.log(err)
    }
}

exports.getUserTasks = async function getUserTasks(userId) {
    // let user = await collection.users.doc(userId).get()
    // let userTasks = user.data().submittedTasks.taskid;
    // console.log(userTasks)
    // console.log(userTasks[1])

    let tasks = []
    try {
        const snapshot = await collection.tasklist.where(SUBMITTED_BY, '==', userId).get();
        snapshot.forEach (doc => {
            console.log(doc.id, '=>', doc.data())
            tasks.push({ taskid: doc.id, data: doc.data() }); 

        } )
        return tasks;
    } catch (err) {
        console.log(err)
    }
}

exports.getSingleTask = async function getSingleTask(taskId) {
    let task;
    try {
      const singleTask = await collection.tasklist.doc(taskId).get();
  
      task = { taskid: singleTask.id, data: singleTask.data() };
  
    //   res.status(200).send(task);
    } catch (err) {
      console.log(err);

    }
    return task;
}

exports.submitTask = async function submitTask(data) {
    let booleanIsPublic = helper.getBoolean(data.isPublic);

    let time = Timestamp.now();

    let taskObject = {
            timestamp: time, //backend derived
            taskname: data.taskname, //front end
            location: {
            //frontend
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            address: data.location.address,
            },
            status: `OPEN`, //backend for new tasks of course
            picUrl:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80", //data.picUrl, //needs to be backend from pic URL service
            remarks: data.remarks, //frontend
            isPublic: booleanIsPublic, //frontend
            isComplete: false,
            submittedBy: data.uid, //front end uuid of user & required update user Tasks
        };
    console.log(taskObject);
    try {
        let myTaskId;
        let taskIdNew = await collection.tasklist
        .add(taskObject)
        .then((results) => {
            console.log(results);
            myTaskId = results.id;
        })
        .catch((err) => {
            console.log(err);
        });

        collection.users
        .doc(data.uid)
        .update({
            submittedTasks: FieldValue.arrayUnion(myTaskId),
        })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    } catch (err) {
        console.log(error)
    }
}