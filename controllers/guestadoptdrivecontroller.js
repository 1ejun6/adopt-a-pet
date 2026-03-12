const express = require('express');
const AdoptionDrive = require('../models/adoption-drives'); 

const router = express.Router();

// GET /adoption-drives (public page)
router.get('/adoption-drives', async (req, res) => {
    try {
        const today = new Date();

        // Fetch upcoming drives from database
        const drives = await AdoptionDrive.find({})
            .sort({ eventDate: -1 })
            .lean();

        const msg = req.query.msg || null;
        res.render('adoption-drives/index', { drives, currentuser: req.session.user || null, msg}); 
    } catch (err) {
        console.log('Error fetching adoption drives:', err);
        res.render('error', { e: 'Could not load adoption drives' });
    }
});

module.exports = router;