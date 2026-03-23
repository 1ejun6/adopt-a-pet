const express = require('express');
const watchlistController = require('../controllers/watchlistController');
const { authenticated, custOnly } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, custOnly, watchlistController.index);
router.get("/add", authenticated, custOnly, watchlistController.addPetsView);
router.post("/add", authenticated, custOnly, watchlistController.processAddedPets);
router.get("/update", authenticated, custOnly, watchlistController.getUpdateForm);

module.exports = router;