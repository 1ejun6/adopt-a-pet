const express = require('express')
const adminadoptionapplicationcontroller = require('../controllers/adminadoptionapplicationcontroller')
const { authenticated, admin } = require('../middleware')

const router = express.Router()

router.get('/', authenticated, admin, adminadoptionapplicationcontroller.getadminadoptionapplications)
router.get('/edit', authenticated, admin, adminadoptionapplicationcontroller.getupdateadoptionapplication)
router.get('/edit/:id', authenticated, admin, adminadoptionapplicationcontroller.getupdateadoptionapplication)

router.post('/edit/:id', authenticated, admin, adminadoptionapplicationcontroller.updateadoptionapplication)

module.exports = router
