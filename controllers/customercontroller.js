const bcrypt = require('bcrypt');
const user = require('../models/users');

async function read(req, res, id, m = null, e = null) {
    try {
        const account = await user.findcustomerbyid(id);
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        return res.render('customer/read', { m, e, account });
    } catch (error) {
        return res.render('error', { e: 'error loading your account' });
    }
}

async function update(req, res, id, m = null, e = null) {
    try {
        const account = await user.findcustomerbyid(id);
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        return res.render('customer/update', { m, e, account });
    } catch (error) {
        return res.render('error', { e: 'error loading your account' });
    }
}

async function dashboard(req, res) {
    return res.render('customer/index', { m: `${req.session.user.email}` });
}

async function readaccount(req, res) {
    return read(req, res, req.session.user.id, null, null);
}

async function updateview(req, res) {
    return update(req, res, req.session.user.id, null, null);
}

async function updateaccount(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email) {
            return update(req, res, req.session.user.id, null, 'name and email are required');
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findonebyemailexcludingid(cemail, req.session.user.id);
        if (existinguser) {
            return update(req, res, req.session.user.id, null, 'email already exists > please enter another email');
        }

        const updatefields = { name, email: cemail };
        if (password && password.trim()) { //update object if password change
            updatefields.password = await bcrypt.hash(password, 10);
        }

        const account = await user.updatecustomerbyid(req.session.user.id, updatefields);

        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }

        req.session.user.email = account.email; //updates session email so navbar updates
        return res.render('customer/update', { m: 'account updated', e: null, account });
    } catch (error) {
        return update(req, res, req.session.user.id, null, 'error updating account');
    }
}

module.exports = { dashboard, readaccount, updateview, updateaccount };