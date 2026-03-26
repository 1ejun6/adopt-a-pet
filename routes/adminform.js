const express = require('express')
const adminformcontroller = require('../controllers/adminformcontroller')
const { authenticated, admin } = require('../middleware')

const router = express.Router()

router.get('/', authenticated, admin, adminformcontroller.getadminallforms)

module.exports = router