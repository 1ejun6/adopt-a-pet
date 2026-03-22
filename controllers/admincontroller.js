const express = require('express');
const bcrypt = require('bcrypt');
const user = require('../models/users');
const appointment = require('../models/appointments')
const { authenticated, admin } = require('../middleware');
const { convertarray } = require('./common');
const { default: mongoose, Mongoose, mongo } = require('mongoose');

const router = express.Router();

async function index(req, res, m = null, e = null, deleted = null) {
    try { //find returns a promise
        const accounts = await user.find({ role: 'admin' }).lean(); //js objects instead of full mongoose object with extra methods
        return res.render('admin/index', { m, e, deleted, accounts });
    } catch (error) {
        return res.render('admin/index', { m: null, e: 'error loading admin accounts', deleted: null, accounts: [] });
    }
}

async function update(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'admin' }).lean();
        if (!account) {
            return index(req, res, null, 'admin account not found');
        }
        return res.render('admin/update', { m, e, account });
    } catch (error) {
        return index(req, res, null, 'error loading admin account');
    }
}

router.get('/', authenticated, admin, async (req, res) => { //async used because index uses async
    return index(req, res);
});

router.get('/create', authenticated, admin, (req, res) => {
    return res.render('admin/create', { m: null, e: null });
});

router.post('/create', authenticated, admin, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.render('admin/create', { m: null, e: 'all fields are required' });
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findOne({ email: cemail });
        if (existinguser) {
            return res.render('admin/create', { m: null, e: 'user already exists' });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const newadmin = new user({
            name,
            email: cemail,
            password: hashpassword,
            role: 'admin'
        });
        await newadmin.save();
        return index(req, res, 'admin account created', null);
    } catch (error) {
        return res.render('admin/create', { m: null, e: 'error creating admin account' });
    }
});

router.post('/delete', authenticated, admin, async (req, res) => {
    try {
        const sids = convertarray(req.body.selectedid);
        if (sids.length === 0) {
            return index(req, res, null, 'select at least one account to delete');
        }
        //$in > match any value inside of sids array
        const deleteaccounts = await user.find({ _id: { $in: sids }, role: 'admin' }).select('email').lean();

        //convert object to select value to array
        const arrayids = deleteaccounts.map(a => a._id);
        const arrayemails = deleteaccounts.map(a => a.email);
        await user.deleteMany({ _id: { $in: arrayids }, role: 'admin' });
        return index(req, res, null, null, arrayemails);
    } catch (error) {
        return index(req, res, null, 'error deleting admin account/s');
    }
});

router.post('/update', authenticated, admin, async (req, res) => {
    const sids = convertarray(req.body.selectedid);
    if (sids.length !== 1) {
        return index(req, res, null, 'select exactly one account to update');
    }

    return update(req, res, sids[0]);
});

router.post('/update/:id', authenticated, admin, async (req, res) => {
    try{
        const { name, email, password } = req.body;
        if (!name || !email) {
            //value taken from url path
            return update(req, res, req.params.id, null, 'name and email are required');
        }
        const cemail = email.trim().toLowerCase();
        //not equal to
        const existinguser = await user.findOne({ email: cemail, _id: { $ne: req.params.id } });
        if (existinguser) {
            return update(req, res, req.params.id, null, 'email already exists > please enter another email');
        }

        const updatefields = { name, email: cemail };
        if (password && password.trim()) { //update object if password change
            updatefields.password = await bcrypt.hash(password, 10);
        }
        const account = await user.findOneAndUpdate(
            { _id: req.params.id, role: 'admin' }, //filter
            { $set: updatefields }, //update operator
            //updated document > schema validators > query context
            { returnDocument: 'after', runValidators: true, context: 'query' }
        ).lean();

        if (!account) {
            return index(req, res, null, 'admin account not found');
        }
        //if user is logged in with session data > checks whether updated account is same as currently logged in admin
        if (req.session && req.session.user && String(req.session.user.id) === String(account._id)) {
            req.session.user.email = account.email; //updates session email so navbar updates
        }
        
        return res.render('admin/update', { m: 'admin account updated', e: null, account });
    }catch(error){
        return update(req, res, req.params.id, null, 'error updating admin account');
    }
});

router.get('/confirmAppointments', authenticated, admin, async(req, res) => {

    const allAppointments = await appointment.listAllAppointments();
    let users_list = []

    for (a of allAppointments) {

            
        users_to_add = await user.findOne(a.userid);
        users_list.push({
            name: users_to_add.name,
            email: users_to_add.email
        });
    }

    return res.render('admin/confirmAppointments', {m: null, e: null, allAppointments, users_list});
});

router.post('/confirmAppointments', authenticated, admin, async(req, res) => {

    const confirmedAppointments = req.body.appointmentIds;
    let confirmedAppointmentList = []

    if (confirmedAppointments) {
        if (!Array.isArray(confirmedAppointments)) {
            confirmedAppointmentList = [confirmedAppointments];
        } else {
            confirmedAppointmentList = confirmedAppointments;
        }
        for (b of confirmedAppointmentList) {
            await appointment.confirmAppointment(b, "Appointment Confirmed!");
        }
    }

    const allAppointments = await appointment.listAllAppointments();
    let users_list = []

    for (a of allAppointments) {
        users_list.push(await user.findOne(a.userid));
    }

    return res.render('admin/confirmAppointments', {m: null, e: null, allAppointments, users_list});
});

module.exports = router;
