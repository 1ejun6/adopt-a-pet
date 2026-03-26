const mongoose = require('mongoose')
const Adopt = require("../models/adoption-application.js")

// CREATE
const getcreateform = async (req, res) => {
    try {
        const pid = req.query.pet || null
        if (!pid) {
            return res.redirect('/customer/pet')
        }
        res.render('customer/adoption-application/create', {
            user: req.session.user,
            pid: pid,
            m: undefined,
            e: undefined
        })
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

const createform = async (req, res) => {
    try {
        const userID = req.session.user.id
        const formData = {
            uid: new mongoose.Types.ObjectId(userID),
            pid: new mongoose.Types.ObjectId(req.body.pet),
            housingtype: req.body.housingtype,
            experience: req.body.experience,
            reasonforadoption: req.body.reasonforadoption,
            legalagreementaccepted: req.body.legalagreementaccepted === 'true'
        }
        await Adopt.addForm(formData)
        res.redirect(`/customer/adoption-application/read?id=${userID}&msg=submitted`)
    } catch (err) {
        console.error('CREATEFORM ERROR:', err)  // change this line
        res.redirect('/')
    }
}

// READ
const readform = async (req, res) => {
    try {
        let id = req.query.id
        if (!id) {
            return res.redirect('/customer/pet')
        }
        let data = await Adopt.findByID(id)
        res.render('customer/adoption-application/read', { user: data, msg: req.query.msg || null })
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

// UPDATE
const getupdateform = async (req, res) => {
    try {
        let id = req.query.id
        let data = await Adopt.findByApplicationID(id)
        res.render('customer/adoption-application/update', {
            user: data,
            m: undefined,
            e: undefined
        })
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

const updateform = async (req, res) => {
    try {
        const appID = req.query.id
        const userID = req.session.user.id
        await Adopt.updateForm(appID, req.body)
        res.redirect(`/customer/adoption-application/read?id=${userID}`)
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

// DELETE
const deleteform = async (req, res) => {
    try {
        await Adopt.deleteForm(req.params.id)
        res.redirect(`/customer/adoption-application/read?id=${req.session.user.id}`)
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

module.exports = { getcreateform, createform, readform, getupdateform, updateform, deleteform }