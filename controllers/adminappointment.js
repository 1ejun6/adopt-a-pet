const express = require('express');
const user = require('../models/users');
const appointment = require('../models/appointments');
const pet = require('../models/pet');
const { authenticated, admin } = require('../middleware');
const mongoose = require('mongoose')


const router = express.Router();

async function getAllAppointments(req, res) {
    try {
        const allAppointments = await appointment.listAllAppointments();
        let users_list = []

        for (a of allAppointments) {

            users_to_add = await user.findOne(a.userid);
            users_list.push({
                name: users_to_add.name,
                email: users_to_add.email
            });
        }
        return res.render('admin/appointment/confirmAppointments', { allAppointments, users_list });
    } catch (error) {
        console.log(error);
    }
}

async function confirm_bookings(req, res) {
    try {
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
        return res.render('admin/appointment/confirmAppointments', { allAppointments, users_list });
    } catch (error) {
        console.log(error)
    }
}

async function searchUser(req, res) {
    const searchUser = req.query.user;
    // retrievce all the userids that match the search query
    const searchedUsers = await user.find({ name: { $regex: searchUser, $options: 'i' } });

    let allAppointments = [];
    for (u of searchedUsers) {
        // get all appointments related to every searched userid
        let searchedAppointmentsByUser = await appointment.searchAppointmentByUser(u['_id']);
        allAppointments = allAppointments.concat(searchedAppointmentsByUser);
    }

    let users_list = []

    for (a of allAppointments) {

        users_to_add = await user.findOne(a.userid);
        users_list.push({
            name: users_to_add.name,
            email: users_to_add.email
        });
    }
    return res.render('admin/appointment/confirmAppointments', { allAppointments, users_list });

}

router.get('/', authenticated, admin, async (req, res) => {
    return getAllAppointments(req, res);
});

router.post('/', authenticated, admin, async (req, res) => {
    return confirm_bookings(req, res);
});

router.get('/search', authenticated, admin, async (req, res) => {
    return searchUser(req, res);
});

module.exports = router;
