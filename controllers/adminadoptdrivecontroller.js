const express = require('express');
const AdoptionDrive = require('../models/adoption-drives');
const { authenticated, admin } = require('../middleware');

const router = express.Router();

router.use(authenticated);
router.use(admin);

// show all drives
router.get('/adoption-drives', async (req, res) => {
    try {
        const drives = await AdoptionDrive.find({})
            .sort({ eventdate: 1 })
            .lean();

        return res.render('admin/adoption-drives/manage-drive', {
            drives,
            e: null
        });
    } catch (error) {
        console.log(error);
        return res.render('admin/adoption-drives/manage-drive', {
            drives: [],
            e: 'error loading drives'
        });
    }
});

// show create form
router.get('/adoption-drives/create', (req, res) => {
    return res.render('admin/adoption-drives/create-drive', { e: null });
});

// create drive
router.post('/adoption-drives/create', async (req, res) => {
    try {
        const { title, location, eventdate, description, mcapacity } = req.body;

        await AdoptionDrive.create({
            title,
            location,
            eventdate,
            description,
            mcapacity,
            attendees: [],
            cby: req.session.user.id,
            status: 'open'
        });

        return res.redirect('/admin/adoption-drives');
    } catch (error) {
        console.log(error);
        return res.render('admin/adoption-drives/create-drive', {
            e: 'error creating drive'
        });
    }
});

// show edit form
router.get('/adoption-drives/:id/edit', async (req, res) => {
    try {
        const drive = await AdoptionDrive.findById(req.params.id).lean();

        if (!drive) {
            return res.render('error', { e: 'drive not found' });
        }

        return res.render('admin/adoption-drives/edit-drive', {
            drive,
            e: null
        });
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error loading drive' });
    }
});

// update drive
router.post('/adoption-drives/:id/edit', async (req, res) => {
    try {
        const { title, location, eventdate, description, mcapacity, status } = req.body;

        const drive = await AdoptionDrive.findByIdAndUpdate(
            req.params.id,
            {
                title,
                location,
                eventdate,
                description,
                mcapacity,
                status
            },
            { new: true, runValidators: true }
        );

        if (!drive) {
            return res.render('error', { e: 'drive not found' });
        }

        return res.redirect('/admin/adoption-drives');
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error updating drive' });
    }
});

// delete drive
router.post('/adoption-drives/:id/delete', async (req, res) => {
    try {
        const drive = await AdoptionDrive.findByIdAndDelete(req.params.id);

        if (!drive) {
            return res.render('error', { e: 'drive not found' });
        }

        return res.redirect('/admin/adoption-drives');
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error deleting drive' });
    }
});

module.exports = router;