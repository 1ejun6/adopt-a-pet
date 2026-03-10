const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const { authenticated, admin, customer } = require('../middleware');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register', { m: null, e: null });
});

router.get('/login', (req, res) => {
    res.render('login', { m: null, e: null });
});

router.get('/', (req, res) => {
    return res.render('index');
});

router.get('/index.html', (req, res) => {
    return res.render('index');
});

router.get('/home', authenticated, customer, (req, res) => {
    return res.render('customer-index', { m: `${req.session.user.email}` });
});

router.get('/admin', authenticated, admin, (req, res) => {
    return res.render('admin-index', {m: `${req.session.user.email}`});
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
        const existinguser = await User.findOne({ email: cemail });

        if (existinguser) {
            return res.render('register', { m: null, e: 'user already exists' });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const newuser = new User({
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
        const existinguser = await User.findOne({ email: cemail });
        if (!existinguser) {
            return res.render('login', { m: null, e: 'invalid email or password' });
        }

        const match = await bcrypt.compare(password, existinguser.password);
        if (!match) {
            return res.render('login', { m: null, e: 'invalid email or password' });
        }

        req.session.regenerate((e) => {
            if (e) {
                console.log('session regenerate error >', e);
                return res.render('login', { m: null, e: 'error logging in' });
            }

            req.session.user = {
                id: existinguser._id,
                email: existinguser.email,
                role: existinguser.role
            };

            req.session.save((e) => {
                if (e) {
                    console.log('session save error >', e);
                    return res.render('login', { m: null, e: 'error logging in' });
                }

                if (existinguser.role === 'admin') {
                    return res.redirect('/admin');
                }

                return res.redirect('/home');
            });
        });
    } catch (error) {
        console.log('login error >', error);
        return res.render('login', { m: null, e: 'error logging in' });
    }
});

module.exports = router;