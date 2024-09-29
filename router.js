const express = require('express')
const router = express.Router()
const {signup, signin, authenticateToken,
     createTask, getTasks, searchTasks, updateTask,
      deleteTask, getTasksByPriority, getTodayTask,
       getUser, createCategory, getCategories,
        getTasksByCategory, deleteCategory, searchCategory } = require('./controller.js')


router.post('/signin', signin)

router.post('/signup', signup)

router.get('/tasks', authenticateToken, getTasks)

router.post('/tasks', authenticateToken, createTask)

router.get('/tasks/search', authenticateToken, searchTasks)

// router.get('/tasks/:id', authenticateToken, getTask)

router.get('/user', authenticateToken, getUser)

router.put('/tasks/:id', authenticateToken, updateTask)

router.delete('/tasks/:id', authenticateToken, deleteTask)

router.get('/tasks/now', authenticateToken, getTodayTask)

router.get('/tasks/priority/:priority', authenticateToken, getTasksByPriority)

router.post('/categories', authenticateToken, createCategory)

router.get('/categories', authenticateToken, getCategories)

router.delete('/categories/:_id', authenticateToken, deleteCategory)

router.get('/tasks/category/:_id', authenticateToken, getTasksByCategory)

router.get('/categories/search/:name', authenticateToken, searchCategory);






module.exports = router