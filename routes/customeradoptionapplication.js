const express = require('express')
const customeradoptionapplicationcontroller = require('../controllers/customeradoptionapplicationcontroller')
const { authenticated, customer } = require('../middleware')

const router = express.Router()

router.get('/create', authenticated, customer, customeradoptionapplicationcontroller.getcreateadoptionapplication)
router.post('/create', authenticated, customer, customeradoptionapplicationcontroller.createadoptionapplication)

router.get('/', authenticated, customer, customeradoptionapplicationcontroller.readadoptionapplications)

router.get('/action', authenticated, customer, customeradoptionapplicationcontroller.handleaction)

router.get('/edit/:id', authenticated, customer, customeradoptionapplicationcontroller.getupdateadoptionapplication)
router.post('/edit/:id', authenticated, customer, customeradoptionapplicationcontroller.updateadoptionapplication)

router.post('/delete/:id', authenticated, customer, customeradoptionapplicationcontroller.deleteadoptionapplication)

module.exports = router