const express = require('express')
const adminadoptionapplicationcontroller = require('../controllers/adminadoptionapplicationcontroller')
const { authenticated, admin } = require('../middleware')

const router = express.Router()

router.get('/', authenticated, admin, adminadoptionapplicationcontroller.getadminallforms)

module.exports = router