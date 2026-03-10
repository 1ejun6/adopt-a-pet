const express = require('express');
const server = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

server.use('/', express.static('public'));
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');

dotenv.config({ path: './.env' });

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