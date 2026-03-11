const express = require('express');
const bcrypt = require('bcrypt');
const user = require('../models/users');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

async function read(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
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
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        return res.render('customer/update', { m, e, account });
    } catch (error) {
        return res.render('error', { e: 'error loading your account' });
    }
}

router.get('/', authenticated, customer, async (req, res) => {
    return res.render('customer-index', { m: `${req.session.user.email}` });
});

router.get('/read', authenticated, customer, async (req, res) => {
    return read(req, res, req.session.user.id, null, null);
});

router.get('/update', authenticated, customer, async (req, res) => {
    return update(req, res, req.session.user.id, null, null);
});

router.post('/update', authenticated, customer, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email) {
            return update(req, res, req.session.user.id, null, 'name and email are required');
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findOne({ email: cemail, _id: { $ne: req.session.user.id } });
        if (existinguser) {
            return update(req, res, req.session.user.id, null, 'email already exists > please enter another email');
        }

        const updatefields = { name, email: cemail };
        if (password && password.trim()) { //update object if password change
            updatefields.password = await bcrypt.hash(password, 10);
        }

        const account = await user.findOneAndUpdate(
            { _id: req.session.user.id, role: 'customer' },
            { $set: updatefields },
            { returnDocument: 'after', runValidators: true, context: 'query' }
        ).lean();

        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }

        req.session.user.email = account.email; //updates session email so navbar updates
        return res.render('customer/update', { m: 'account updated', e: null, account });
    } catch (error) {
        return update(req, res, req.session.user.id, null, 'error updating account');
    }
});

module.exports = router;