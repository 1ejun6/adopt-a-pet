const express = require('express')
const customerformcontroller = require('../controllers/customerformcontroller')
const { authenticated, customer } = require('../middleware')

const router = express.Router()

// CREATE
router.get('/create', authenticated, customer, customerformcontroller.getcreateform)
router.post('/create', authenticated, customer, customerformcontroller.createform)


// READ
router.get('/user', authenticated, customer, customerformcontroller.readform)

// UPDATE
router.get('/update', authenticated, customer, customerformcontroller.getupdateform)
router.post('/update', authenticated, customer, customerformcontroller.updateform)

// DELETE
router.post('/:id/delete', authenticated, customer, customerformcontroller.deleteform)

module.exports = router


