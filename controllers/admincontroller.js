const bcrypt = require('bcrypt');
const user = require('../models/users');
const { convertarray } = require('./common');

async function renderindex(req, res, m = null, e = null, deleted = null) {
    try { //find returns a promise
        const accounts = await user.findadminaccounts(); //js objects instead of full mongoose object with extra methods
        return res.render('admin/index', { m, e, deleted, accounts });
    } catch (error) {
        return res.render('admin/index', { m: null, e: 'error loading admin accounts', deleted: null, accounts: [] });
    }
}

async function index(req, res) {
    return renderindex(req, res);
}

async function updateview(req, res) {
    return update(req, res, req.params.id);
}

async function update(req, res, id, m = null, e = null) {
    try {
        const account = await user.findadminbyid(id);
        if (!account) {
            return renderindex(req, res, null, 'admin account not found');
        }
        return res.render('admin/update', { m, e, account });
    } catch (error) {
        return renderindex(req, res, null, 'error loading admin account');
    }
}

function createview(req, res) {
    return res.render('admin/create', { m: null, e: null });
}

async function create(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.render('admin/create', { m: null, e: 'all fields are required' });
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findonebyemail(cemail);
        if (existinguser) {
            return res.render('admin/create', { m: null, e: 'user already exists' });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        await user.createaccount({
            name,
            email: cemail,
            password: hashpassword,
            role: 'admin'
        });
        return renderindex(req, res, 'admin account created', null);
    } catch (error) {
        return res.render('admin/create', { m: null, e: 'error creating admin account' });
    }
}

async function deleteaccounts(req, res) {
    try {
        const sids = convertarray(req.params.id ? req.params.id.split('-') : []);
        if (sids.length === 0) {
            return renderindex(req, res, null, 'select at least one account to delete');
        }
        //$in > match any value inside of sids array
        const deleteaccounts = await user.findadminsbyids(sids);

        //convert object to select value to array
        const arrayids = deleteaccounts.map(a => a._id);
        const arrayemails = deleteaccounts.map(a => a.email);
        await user.deleteadminsbyids(arrayids);
        return renderindex(req, res, null, null, arrayemails);
    } catch (error) {
        return renderindex(req, res, null, 'error deleting admin account/s');
    }
}

async function saveupdate(req, res) {
    try{
        const { name, email, password } = req.body;
        if (!name || !email) {
            //value taken from url path
            return update(req, res, req.params.id, null, 'name and email are required');
        }
        const cemail = email.trim().toLowerCase();
        //not equal to
        const existinguser = await user.findonebyemailexcludingid(cemail, req.params.id);
        if (existinguser) {
            return update(req, res, req.params.id, null, 'email already exists > please enter another email');
        }

        const updatefields = { name, email: cemail };
        if (password && password.trim()) { //update object if password change
            updatefields.password = await bcrypt.hash(password, 10);
        }
        const account = await user.updateadminbyid(req.params.id, updatefields);

        if (!account) {
            return renderindex(req, res, null, 'admin account not found');
        }
        //if user is logged in with session data > checks whether updated account is same as currently logged in admin
        const currentsessionid = req.session && req.session.user && (req.session.user.id || req.session.user._id);
        if (currentsessionid && String(currentsessionid) === String(req.params.id)) {
            req.session.user.email = account.email; //updates session email so navbar updates
        }
        
        return res.render('admin/update', { m: 'admin account updated', e: null, account });
    }catch(error){
        return update(req, res, req.params.id, null, 'error updating admin account');
    }
}

module.exports = {index, createview, create, updateview, deleteaccounts, saveupdate};
