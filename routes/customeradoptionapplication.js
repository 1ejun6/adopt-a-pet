const express = require('express')
const customeradoptionapplicationcontroller = require('../controllers/customeradoptionapplicationcontroller')
const { authenticated, customer } = require('../middleware')

const router = express.Router()

// CREATE
router.get('/create', authenticated, customer, customeradoptionapplicationcontroller.getcreateform)
router.post('/create', authenticated, customer, customeradoptionapplicationcontroller.createform)


// READ
router.get('/read', authenticated, customer, customeradoptionapplicationcontroller.readform)

// UPDATE
router.get('/update', authenticated, customer, customeradoptionapplicationcontroller.getupdateform)
router.post('/update', authenticated, customer, customeradoptionapplicationcontroller.updateform)

// DELETE
router.post('/:id/delete', authenticated, customer, customeradoptionapplicationcontroller.deleteform)

module.exports = router


