const express = require('express');
const server = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const rsvpcontroller = require('./controllers/rsvpcontroller');
const adminadoptdriveroutes = require('./routes/adminadoptdrive');
const customeradoptdriveroutes = require('./routes/customeradoptdrive');
const guestadoptdriveroutes = require('./routes/guestadoptdrive');
const authroutes = require('./routes/auth');
const adminroutes = require('./routes/admin');
const customerroutes = require('./routes/customer');
const petadminroutes = require('./routes/petadmin');
const petcustomerroutes = require('./routes/petcustomer');
const adoptcontroller = require("./controllers/adoptcontroller")

dotenv.config({ path: './.env' });

server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));
server.use(express.static('public'));

server.use(session({
    name: 'sid',
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false
}));

server.use((req, res, next) => { //on every request
    res.locals.currentuser = req.session ? req.session.user : null; //temporary storage box for one request
    next();
});

server.use('/admin', adminroutes);
server.use('/customer', customerroutes);
server.use('/', authroutes);
server.use('/admin/adoption-drives', adminadoptdriveroutes);
server.use('/customer/adoption-drives', customeradoptdriveroutes);
server.use('/adoption-drives', guestadoptdriveroutes);
server.use('/admin/pet', petadminroutes);
server.use('/customer/pet', petcustomerroutes);
server.use('/adoption', adoptcontroller);
server.use('/', rsvpcontroller);

async function connectdb() {
    try {
        await mongoose.connect(process.env.db);
        console.log('mongodb connected successfully');
    } catch (error) {
        console.log('mongodb error', error);
        process.exit(1);
    }
};

function startserver() {
    const port = process.env.port;
    server.listen(port, () => { console.log(`server running at http://localhost:${port}/`); });
}
connectdb().then(startserver);