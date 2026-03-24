const express = require('express');
const router = express.Router();
const path = require('path');
const Adopt = require("../models/adopt.js")
const { authenticated } = require("../middleware.js")

// CREATE
router.get('/apply', authenticated, async (req, res) => {
    try {
        const existing = await Adopt.findByID(req.session.user.id)
        if (existing.length > 0) {
            res.redirect(`/adoption/user?id=${req.session.user.id}`)
        } else {
            res.render('adopt-form', {
                pets: [],
                user: req.session.user,
                currentuser: req.session.user,
                successMsg: undefined,
                errorMsg: undefined,
                m: undefined,
                e: undefined
            })
        }
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
});
router.post("/apply", authenticated, async (req, res) => {
    try {
        let data = req.body
        const userID = req.session.user.id
        data["userid"] = userID
        await Adopt.addForm(data)
        res.redirect(`/adoption/user?id=${userID}`)
    } catch (err) {
        if (err.code === 11000) { // already got application, just send them to view it
            res.redirect(`/adoption/user?id=${req.session.user.id}`)
        } else {
            console.error(err)
            res.redirect('/')
        }
        }
    }
);


// READ
router.get("/user", authenticated, async (req, res) => {
    try {
        let id = req.query.id
        let data = await Adopt.findByID(id)
        console.log(data)
        res.render('userform', {user: data})
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})


// UPDATE FORM 
router.get("/updateform", authenticated, async (req, res) => {
    try {
        let id = req.query.id
        let data = await Adopt.findByID(id)
        res.render('adopt-form', {
            pets: [],
            user: data[0],
            currentuser: req.session.user,
            successMsg: undefined,
            errorMsg: undefined,
            m: undefined,
            e: undefined,
            data: data
        })
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})
router.post("/updateform", authenticated, async (req, res) => {
    try {
        const userID = req.session.user.id
        await Adopt.updateForm(userID, req.body)
        res.redirect(`/adoption/user?id=${userID}`)
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})


// DELETE FORM
router.post("/:id/delete", authenticated, async (req, res) => {
    try {
        await Adopt.deleteForm(req.params.id)
        res.redirect('/adoption/apply')
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})

module.exports = router;