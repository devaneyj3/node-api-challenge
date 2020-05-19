const express = require('express');

const routes = express.Router(); 

const projectsDB = require('./data/helpers/projectModel');
const actionsBD = require('./data/helpers/actionModel');

//GET all projects with error handling
routes.get('/', async(req, res) => {
    const projects = await projectsDB.get();
    try {
        if(projects.length < 1) {
            res.status(404).json({message: "No users in the database"})
        } else {
            res.status(200).send(projects)
        }
    } catch {
        dbError(res)
    }
})

//POST projects to database and error handling with middleware
routes.post('/', validateProject, async (req, res) => {
    try {
        const addProject = await projectsDB.insert(req.body);
        res.status(201).send(addProject)
    } catch {
        dbError(res);
    }

})
//GET by project ID and error handlers
routes.get('/:id', async(req, res) => {
    const id = paramsId(req)
    const getProjectByID = await projectsDB.get(id);
    try {
        if(getProjectByID ) {
            res.status(200).send(getProjectByID)
        } else {
            IDNotInDB(res)
        }
    } catch {
        dbError(res)
    }
})

//DELETE project by ID and error handling
routes.delete('/:id', async(req, res) => {
    const id = paramsId(req)
    const deletByProjectID = await projectsDB.remove(id)
    console.log(deletByProjectID)
    try {
        if(deletByProjectID > 0 ) {
            res.status(200).send(`User ${id} has be deleted`)
        } else {
            IDNotInDB(res)
        }
    } catch {
        dbError(res)
    }
})

//UPDATE a user and error handling
routes.put('/:id', validateProject, async(req, res) => {
    const id = paramsId(req)
    const updateUser = await projectsDB.update(id, req.body)
    try {
        if( updateUser) {
            res.status(200).send(updateUser)
        } else {
            IDNotInDB(res)
        }
    } catch {
        dbError(res)
    }
})

routes.get('/:id/actions', validateUserId, async(req, res) => {
    const id = paramsId(req)
    const getAction = await projectsDB.getProjectActions(id)
    try {
        if( getAction.length > 0 ) {
            res.status(200).send(getAction)
        } else {
            res.status(404).json({message: 'There are no actions for this user'})
        }
    } catch {
        dbError(res)
    }
})

routes.post('/:id/actions', validateUserId, validateActions, async(req, res) => {
    const id = paramsId(req)
    console.log(id)
    req.body.project_id = id; 
    console.log(req.body)

    try {
        const updateUserAction = await actionsBD.insert(req.body)
        if( updateUserAction) {
            res.status(200).send(updateUserAction)
        } else {
            IDNotInDB(res)
        }
    } catch {
        dbError(res)
    }
})

//UPDATE a user actions and error handling
routes.put('/:id/actions/:actionID', validateUserId, validateActionId, validateActions, async(req, res) => {
    const { actionID } = req.params;
    try {
        const updateUsersAction = await actionsBD.update(actionID, req.body)
        console.log(updateUsersAction)
        res.status(200).send(updateUsersAction)
    } catch {
        dbError(res)
    }
})

//Delete a user and error handling
routes.delete('/:id/actions/:actionID', validateUserId, validateActionId, async(req, res) => {
    const { actionID } = req.params;
    await actionsBD.remove(actionID)
    try {
        res.status(200).send(`action id: ${actionID} has been removed`)
    } catch {
        dbError(res)
    }
})


function dbError(res) {
    return res.status(500).json({message: "There was an error with the database"})
}

function paramsId(req) {
    const { id } = req.params;
    return id
}

function IDNotInDB(res) {
    return res.status(404).json({message: "This user ID is not in the database"})
}

function IDnotInDatabase(id, users) {

  const isIdinDatabase = users.filter(user => user.id == id)
  
  if(isIdinDatabase.length > 0) {
    return 1;
  } else {
    return 0
  }

}

//middleware
function validateProject(req, res, next) {
    if(Object.keys(req.body).length == 2 && req.body.name !== "" && req.body.description !== ""){
        next();
    } else if( req.body.name === "" || req.body.description === "") {
        res.status(400).json({message: "You need to enter a name and description"})
    } else {
        res.status(400).json({message: "You are missing a name and description field"})
    }
}
async function validateUserId(req, res, next) {
// if the id parameter is valid, store that user object as req.user
  const id = paramsId(req)
  const users = await projectsDB.get();
  const checkIdArray = IDnotInDatabase(id, users);
  // if the id parameter does not match any user id in the database, cancel the request and respond with status 400 and { message: "invalid user id" } 
  if(checkIdArray === 0 ) {
      res.status(400).json({message: "Invalid user ID"})
    } else {
      next()
    }
}


function validateActions(req,res,next) {
    if(Object.keys(req.body).length == 2 && req.body.notes !== "" && req.body.description !== ""){
        next();
    } else if( req.body.description === "" || req.body.notes === "") {
        res.status(400).json({message: "You need to enter description and notes"})
    } else {
        res.status(400).json({message: "You are missing a notes and description field"})
    }
}
async function validateActionId(req, res, next) {
const { actionID } = req.params;
const userID = paramsId(req)
  const action = await actionsBD.get(actionID)

  if(action === null) {
      res.status(404).json({message: "There is no action with that id"})
} else if(action.project_id !== parseInt(userID)) {
    res.status(404).json({message: "This user does not have any that action ID"})
    } else {
        next()
    }
}


module.exports = routes;