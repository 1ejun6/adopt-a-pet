const Adopt = require("../models/form.js")

// CREATE
const getcreateform = async (req, res) => {
    try {
        res.render('customer/form/create', {
            user: req.session.user,
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
        let data = req.body
        const userID = req.session.user.id
        data["uid"] = userID
        data["pid"] = data.pet
        await Adopt.addForm(data)
        res.redirect(`/adoption/user?id=${userID}&msg=submitted`)
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

// READ
const readform = async (req, res) => {
    try {
        let id = req.query.id
        let data = await Adopt.findByID(id)
        res.render('customer/form/read', { user: data, msg: req.query.msg || null })
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
        res.render('customer/form/update', {
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
        res.redirect(`/adoption/user?id=${userID}`)
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

// DELETE
const deleteform = async (req, res) => {
    try {
        await Adopt.deleteForm(req.params.id)
        res.redirect(`/adoption/user?id=${req.session.user.id}`)
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
}

module.exports = { getcreateform, createform, readform, getupdateform, updateform, deleteform }