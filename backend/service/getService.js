const collection = require('../scripts/firestoreHelper')

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
        const snapshot = await collection.tasklist.orderBy("timestamp").get();
        snapshot.forEach (doc => {
            console.log(doc.id, '=>', doc.data())
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
        const snapshot = await collection.tasklist.orderBy("timestamp").get();
        snapshot.forEach (doc => {
            console.log(doc.id, '=>', doc.data())
            if (doc.data().isPublic === true) {
                tasks.push({ taskid: doc.id, data: doc.data() }); 
             }
        } )
        return tasks;
    } catch (err) {
        console.log(err)
    }
}


// async function getPublicTasks() {
//     console.log('getting public tasks')
//     let tasks = [];

//     const snapshot = collection.tasklist.orderBy("timestamp").get()
//         .then( (snapshot) => snapshot.forEach((doc) => {
//             if (doc.data().isPublic === true) {
//                 tasks.push({ taskid: doc.id, data: doc.data() }); 
//              }
//                 }))
//         .then( () => {
//             console.log('public tasks returned ' + tasks.length)
//             return tasks;
//         })
                              
//         .catch((err) => {
//             console.warn(err)
//         })
// }


