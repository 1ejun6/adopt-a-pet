const express = require('express');
const server = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const authcontroller = require('./controllers/authcontroller');
const admincontroller = require('./controllers/admincontroller');
const customercontroller = require('./controllers/customercontroller');
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

server.use('/admin', admincontroller);
server.use('/customer', customercontroller);
server.use('/', authcontroller);
server.use('/adoption', adoptcontroller)

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
    server.listen(port, () => {console.log(`server running at http://localhost:${port}/`);});
}
connectdb().then(startserver);