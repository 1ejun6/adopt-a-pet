const express = require('express');
const AdoptionDrive = require('../models/adoption-drives');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

router.get('/adoption-drives', authenticated, customer, async (req, res) => {
    try {
        const drives = await AdoptionDrive.find({})
            .sort({ eventdate: 1 })
            .lean();

        return res.render('customer/adoption-drives/ad-index', {
            drives,
            msg: req.query.msg || null
        });
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error loading adoption drives' });
    }
});

module.exports = router;