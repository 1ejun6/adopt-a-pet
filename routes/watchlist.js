const express = require('express');
const watchlistController = require('../controllers/watchlistController');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, customer, watchlistController.index);
router.post("/fill-info", authenticated, customer, watchlistController.getUserComments);
router.post("/create", authenticated, customer, watchlistController.processCreatedPets);
router.get("/update", authenticated, customer, watchlistController.getUpdateForm);
router.post("/update", authenticated, customer, watchlistController.processUpdate);
module.exports = router;