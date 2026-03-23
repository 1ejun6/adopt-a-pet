const express = require('express');
const AdoptionDrive = require('../models/adoption-drives'); 
const {authenticated} = require("../middleware");

const router = express.Router();

router.post('/adoption-drives/rsvp-multiple', authenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        let { driveIds } = req.body;

        // nothing selected
        if (!driveIds) {
            return res.redirect('/customer/adoption-drives?msg=empty');
        }

        // ensure it's always an array
        if (!Array.isArray(driveIds)) {
            driveIds = [driveIds];
        }

        let success = false;
        let already = false;
        let closed = false;
        let cancelled = false;

        for (const id of driveIds) {
            const drive = await AdoptionDrive.getdrivebyid(id);
            if (!drive) continue;

            // status checks
            if (drive.status === 'cancelled') {
                cancelled = true;
                continue;
            }

            if (drive.status === 'closed') {
                closed = true;
                continue;
            }

            // already RSVPed
            if (drive.attendees.some(att => att.toString() === userId.toString())) {
                already = true;
                continue;
            }

            // RSVP
            drive.attendees.push(userId);
            success = true;

            if (drive.attendees.length >= drive.mcapacity) {
                drive.status = 'closed';
            }

            await drive.save();
        }

        // decide message priority
        if (success) return res.redirect('/customer/adoption-drives?msg=success');
        if (already) return res.redirect('/customer/adoption-drives?msg=already');
        if (closed) return res.redirect('/customer/adoption-drives?msg=closed');
        if (cancelled) return res.redirect('/customer/adoption-drives?msg=cancelled');

        return res.redirect('/customer/adoption-drives?msg=error');

    } catch (err) {
        console.log('multiple rsvp error:', err);
        return res.redirect('/customer/adoption-drives?msg=error');
    }
});

module.exports = router;