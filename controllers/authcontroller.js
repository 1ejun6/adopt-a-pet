const express = require('express');
const bcrypt = require('bcrypt');
const user = require('../models/users');
const { authenticated } = require('../middleware');

const router = express.Router();

function regeneratesession(req) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => { //method > create new session
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
}

function savesession(req) {
    return new Promise((resolve, reject) => {
        req.session.save((error) => { //method > save session to store
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
}

router.get('/register', (req, res) => {
    res.render('register', { m: null, e: null });
});

router.get('/login', (req, res) => {
    res.render('login', { m: null, e: null });
});

router.get('/logout', authenticated, (req, res) => {
    req.session.destroy((err) => { 
        if (err) {
            console.log('session destroy error >', err);
            return res.render('error', { e: 'error logging out' });
        }
        res.clearCookie('sid'); //clear session sid
        return res.redirect('/login');
    });
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.render('register', { m: null, e: 'all fields are required' });
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findOne({ email: cemail });

        if (existinguser) {
            return res.render('register', { m: null, e: 'user already exists' });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const newuser = new user({
            name,
            email: cemail,
            password: hashpassword
        });

        await newuser.save();
        return res.render('login', { m: 'registration successful', e: null });
    } catch (error) {
        console.log(error);
        return res.render('register', { m: null, e: 'error registering user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.render('login', { m: null, e: 'email and password are required' });
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findOne({ email: cemail });
        if (!existinguser) {
            return res.render('login', { m: null, e: 'invalid email or password' });
        }

        const match = await bcrypt.compare(password, existinguser.password);
        if (!match) {
            return res.render('login', { m: null, e: 'invalid email or password' });
        }

        await regeneratesession(req);
        req.session.user = {
            id: existinguser._id,
            email: existinguser.email,
            role: existinguser.role
        };
        await savesession(req);

        if (existinguser.role === 'admin') {
            return res.redirect('/admin');
        }

        return res.redirect('/customer');
    } catch (error) {
        return res.render('login', { m: null, e: 'error logging in' });
    }
});

module.exports = router;
