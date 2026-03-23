const adoptionDriveModel = require('../models/adoption-drives');

const getadminalldrives = async (req, res) => {
    try {
        const drives = await adoptionDriveModel.getalldrives();

        return res.render('admin/adoption-drives/index', {
            drives,
            e: null
        });
    } catch (error) {
        console.log(error);
        return res.render('admin/adoption-drives/index', {
            drives: [],
            e: 'error loading drives'
        });
    }
};

const getadmincreateform = (req, res) => {
    return res.render('admin/adoption-drives/create', { e: null });
};

const createadmindrive = async (req, res) => {
    try {
        const { title, location, eventdate, description, mcapacity } = req.body;

        await adoptionDriveModel.createdrive({
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
        return res.render('admin/adoption-drives/create', {
            e: 'error creating drive'
        });
    }
};

const getadmineditform = async (req, res) => {
    try {
        const drive = await adoptionDriveModel.getdrivebyid(req.params.id);

        if (!drive) {
            return res.render('error', { e: 'drive not found' });
        }

        return res.render('admin/adoption-drives/edit', {
            drive,
            e: null
        });
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error loading drive' });
    }
};

const updateadmindrive = async (req, res) => {
    try {
        const { title, location, eventdate, description, mcapacity, status } = req.body;

        const drive = await adoptionDriveModel.updatedrive(
            req.params.id,
            {
                title,
                location,
                eventdate,
                description,
                mcapacity,
                status
            }
        );

        if (!drive) {
            return res.render('error', { e: 'drive not found' });
        }

        return res.redirect('/admin/adoption-drives');
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error updating drive' });
    }
};

const deleteadmindrive = async (req, res) => {
    try {
        const drive = await adoptionDriveModel.deletedrive(req.params.id);

        if (!drive) {
            return res.render('error', { e: 'drive not found' });
        }

        return res.redirect('/admin/adoption-drives');
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error deleting drive' });
    }
};

module.exports = { getadminalldrives, getadmincreateform, createadmindrive, getadmineditform, updateadmindrive, deleteadmindrive };