const bcrypt = require('bcrypt');
const user = require('../models/users');

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

function registerview(req, res) {
    res.render('register', { m: null, e: null });
}

function loginview(req, res) {
    res.render('login', { m: null, e: null });
}

function logout(req, res) {
    req.session.destroy((err) => { 
        if (err) {
            console.log('session destroy error >', err);
            return res.render('error', { e: 'error logging out' });
        }
        res.clearCookie('sid'); //clear session sid
        return res.redirect('/login');
    });
}

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.render('register', { m: null, e: 'all fields are required' });
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findonebyemail(cemail);

        if (existinguser) {
            return res.render('register', { m: null, e: 'user already exists' });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        await user.createaccount({
            name,
            email: cemail,
            password: hashpassword
        });

        return res.render('login', { m: 'registration successful', e: null });
    } catch (error) {
        console.log(error);
        return res.render('register', { m: null, e: 'error registering user' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.render('login', { m: null, e: 'email and password are required' });
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findonebyemail(cemail);
        if (!existinguser) {
            return res.render('login', { m: null, e: 'invalid email or password' });
        }

        const match = await bcrypt.compare(password, existinguser.password);
        if (!match) {
            return res.render('login', { m: null, e: 'invalid email or password' });
        }

        await regeneratesession(req);
        req.session.user = {
            id: String(existinguser._id),
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
}

module.exports = {registerview, loginview, logout, register, login};
