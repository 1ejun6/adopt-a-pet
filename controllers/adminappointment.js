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

async function create_new_appointment_page(req, res) {
    try {
        const allUsers = await user.find();
        const pet_species_list = await pet.getAllSpecies();
        return res.render('admin/appointment/createAppointment', { allUsers, pet_species_list });
    } catch (error) {
        console.log(error)
    }
}

async function create_new_appointment(req, res) {
    try {
        const userid = req.body.selecteduser;
        const petspecies = req.body.petspecies;
        const timeslot = req.body.timeslot;
        const location = req.body.location;
        const appointmentDate = req.body.appointmentDate;

        let confirm_user = await user.findOne({ _id: userid });
        let confirm_userid = confirm_user["_id"];

        let new_appointment = {
            userid: confirm_userid,
            petspecies: petspecies,
            location: location,
            appointmentdate: appointmentDate,
            timeslot: timeslot
        }
        await appointment.createAppointment(new_appointment);

        return res.redirect('/admin/appointment');

    } catch (error) {
        console.log(error)
    }
}

async function delete_appointment_page(req, res) {
    try {
        const allAppointments = await appointment.listAllAppointments();
        let users_list = []

        for (a of allAppointments) {

            users_to_add = await user.findOne(a.userid);
            users_list.push({
                name: users_to_add.name,
                email: users_to_add.email,
                id: users_to_add._id
            });
        }
        return res.render('admin/appointment/deleteAppointment', { allAppointments, users_list });
    } catch (error) {
        console.log(error);
    }
}

async function confirm_deletion_appoinments(req, res) {
    try {
        const appointmentIds = req.body.appointmentIds;
        let appointmentIdList = [];
        if (appointmentIds) {
            if (!Array.isArray(appointmentIds)) {
                appointmentIdList = [appointmentIds];
            }
            else {
                appointmentIdList = appointmentIds;
            }
            for (id of appointmentIdList) {
                let ids = id.split(',');
                await appointment.deleteAppointmentById(ids[0], ids[1]);
            }
        }
        return res.redirect('/admin/appointment');
    } catch (error) {
        console.log(error);
    }
}

router.get('/', authenticated, admin, async (req, res) => {
    return getAllAppointments(req, res);
});

router.post('/', authenticated, admin, async (req, res) => {
    return confirm_bookings(req, res);
});

router.get('/create', authenticated, admin, async (req, res) => {
    return create_new_appointment_page(req, res);
});

router.post('/create', authenticated, admin, async (req, res) => {
    return create_new_appointment(req, res);
});

router.get('/delete', authenticated, admin, async (req, res) => {
    return delete_appointment_page(req, res);
})

router.post('/delete', authenticated, admin, async (req, res) => {
    return confirm_deletion_appoinments(req, res);
});

module.exports = router;
