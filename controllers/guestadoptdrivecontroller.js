const adoptionDriveModel = require('../models/adoption-drives');

const getguestalldrives = async (req, res) => {
    try {
        const today = new Date();

        // Fetch upcoming drives from database
        const drives = await adoptionDriveModel.getalldrivesdescending();

        const msg = req.query.msg || null;
        res.render('adoption-drives/index', { drives, currentuser: req.session.user || null, msg });
    } catch (err) {
        console.log('Error fetching adoption drives:', err);
        res.render('error', { e: 'Could not load adoption drives' });
    }
};

module.exports = { getguestalldrives };