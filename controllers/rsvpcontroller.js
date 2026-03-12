const express = require('express');
const AdoptionDrive = require('../models/adoption-drives'); 
const {authenticated} = require("../middleware");

const router = express.Router();

router.post("/adoption-drives/:id/rsvp", authenticated , async (req, res) => {
    try {
        const driveId = req.params.id;
        const userId = req.session.user.id;

        const drive = await AdoptionDrive.findById(driveId);

        if (!drive) {
            return res.redirect('/adoption-drives?msg=notfound');
        }

        if (drive.status === 'cancelled') {
            return res.redirect('/adoption-drives?msg=cancelled');
        }

        if (drive.status === 'closed') {
            return res.redirect('/adoption-drives?msg=closed');
        }

        if (drive.attendees.includes(userId)) {
            return res.redirect('/adoption-drives?msg=already');
        }

        drive.attendees.push(userId);

        if (drive.attendees.length >= drive.maxCapacity) {
            drive.status = 'closed';
        }

        await drive.save();
        return res.redirect('/adoption-drives?msg=success');

    } catch (err) {
        console.log('RSVP error:', err);
        return res.redirect('/adoption-drives?msg=error');
    }
})

module.exports = router;