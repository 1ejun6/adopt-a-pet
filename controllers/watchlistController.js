const Watchlist = require('../models/watchlist');
const User = require('../models/users');
const Pet = require('../models/pets');

exports.index = async (req, res) => {
    try {
        let watchlist = (await Watchlist.find({ user: req.session.user.id }).sort({ranking: 1}).populate('pet'));
        res.render("customer/watchlist/index", { watchlist });
    } catch (error) {
        res.render('error', { e: error });
    };
};

exports.addPetsView = async (req, res) => {
    try {
        const watchlist = Watchlist.find();
        if (watchlist) return res.redirect("/customer/watchlist");
        const currentPets = await Pet.getAllPets();
        res.render("customer/watchlist/add", { currentPets });
    } catch (error) {
        res.render('error', { e: error });
    }
};

exports.processAddedPets = async (req, res) => {
    try {
        const result = req.body;
        let selected = result.selected;
        if (!selected) return res.redirect('/customer/watchlist');
        if (!Array.isArray(selected)) selected = [selected];
        const currentUser = await User.findcustomerbyid(req.session.user.id);
        if (!currentUser) return res.render('error', {e: "User not found!"});
        const createWatchlistEntries = selected.map((selection, i) => {
            return Watchlist.create({ 
                pet: selection, 
                user: currentUser._id, 
                dateUpdated: new Date(), 
                comments: result[selection], 
                ranking: i + 1});
        });

        const createdWatchlist = await Promise.all(createWatchlistEntries);
        res.redirect('/customer/watchlist');
    } catch (error) {
        res.render("error", {e: error});
    };
};

exports.getUpdateForm = (req, res) => {

};