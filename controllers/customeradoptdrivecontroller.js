const adoptionDriveModel = require('../models/adoption-drives');

const getcustomeralldrives = async (req, res) => {
    try {
        const drives = await adoptionDriveModel.getalldrives();

        return res.render('customer/adoption-drives/index', {
            drives,
            msg: req.query.msg || null,
            e: null
        });
    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error loading adoption drives' });
    }
};

module.exports = { getcustomeralldrives };