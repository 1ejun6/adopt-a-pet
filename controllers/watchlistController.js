const Watchlist = require('../models/watchlist');
const User = require('../models/users');
const Pet = require('../models/pets');

exports.index = async (req, res) => {
    try {
        let watchlist = (await Watchlist.find({ user: req.session.user.id }).sort({ ranking: 1 }).populate('pet'));
        res.render("customer/watchlist/index", { watchlist });
    } catch (error) {
        res.render('error', { e: error });
    };
};

exports.addPetsView = async (req, res) => {
    try {
        const watchlist = await Watchlist.find({ user: req.session.user.id }).lean();
        if (watchlist.length > 0) return res.redirect("/customer/watchlist");
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
        if (!currentUser) return res.render('error', { e: "User not found!" });
        const createWatchlistEntries = selected.map((selection, i) => {
            return Watchlist.create({
                pet: selection,
                user: currentUser._id,
                dateUpdated: new Date(),
                comments: result[selection],
                ranking: i + 1
            });
        });

        const createdWatchlist = await Promise.all(createWatchlistEntries);
        if (!createdWatchlist) return res.render("error", { e: "Could not add new entries." });
        res.redirect('/customer/watchlist');
    } catch (error) {
        res.render("error", { e: error });
    };
};

exports.getUpdateForm = async (req, res) => {
    try {
        const watchlist = await Watchlist.find({ user: req.session.user.id }).sort({ ranking: 1 }).populate('pet');
        const existingPets = watchlist.map(entry => entry.pet._id);
        const pets = await Pet.getAllPets()
        const remainingPets = pets.filter(pet => !existingPets.some(existing => existing.equals(pet._id)));
        if (watchlist.length === 0) return res.redirect("/customer/watchlist");
        res.render("customer/watchlist/update", { watchlist, remainingPets });
    } catch (error) {
        res.render("error", { e: error });
    }
};

exports.processUpdate = async (req, res) => {
    try {
        const currentWatchlist = await Watchlist.find({ user: req.session.user.id }).sort({ ranking: 1 });
        if (!currentWatchlist) return res.render("error", { e: "Cannot find current watchlist" });

        const deleteSelection = Object.keys(req.body).filter(key => key.includes("Delete"));
        if (deleteSelection.length > 0) {
            const deleteId = deleteSelection[0].split("/")[1];
            const deleted = await Watchlist.deleteOne({ pet: deleteId, user: req.session.user.id });
            if (deleted.deletedCount !== 1) return res.render("error", { e: "Could not delete entry" });
            let rank = 0;
            const updateRanking = currentWatchlist.filter(entry => entry.pet.toString() !== deleteId).map(entry => {
                rank++;
                return Watchlist.updateOne(
                    { pet: entry.pet, user: entry.user },
                    { $set: { ranking: rank } },
                    { runValidators: true });
            });
            const rankingUpdated = await Promise.all(updateRanking);
            if (!rankingUpdated) return res.render("error", { e: "Could not update rankings" });
        };

        const updateComments = currentWatchlist.map(entry => {
            if (entry.comments !== req.body[entry.pet.toString()]) {
                return Watchlist.updateOne(
                    { pet: entry.pet, user: entry.user },
                    { $set: { comments: req.body[entry.pet.toString()], dateUpdated: new Date() } },
                    { runValidators: true });
            };
        });

        const commentsUpdated = await Promise.all(updateComments);
        if (!commentsUpdated) return res.render("error", { e: "Could not update comments." });

        const upSelectionRank = Object.keys(req.body).filter(key => key.includes("Up"));
        const downSelectionRank = Object.keys(req.body).filter(key => key.includes("Down"));
        let moveUpId, moveDownId;
        if (upSelectionRank.length > 0) {
            moveUpId = upSelectionRank[0].split("/")[1];
        };
        if (downSelectionRank.length > 0) {
            moveDownId = downSelectionRank[0].split("/")[1];
        };
        if (moveUpId || moveDownId) {
            const currentEntry = await Watchlist.findOne({ user: req.session.user.id, pet: (moveUpId || moveDownId) });
            if (!currentEntry) return res.render("error", { e: "Could not find entry matching pet ID" });
            const currentRank = currentEntry.ranking;
            const otherRank = moveUpId ? currentRank - 1 : currentRank + 1;
            currentEntry.ranking = 0;
            currentEntry.save();
            const updateOther = await Watchlist.updateOne(
                { user: req.session.user.id, ranking: otherRank },
                { $set: { ranking: currentRank, dateUpdated: new Date() } },
                { runValidators: true }
            );
            const updateCurrent = await Watchlist.updateOne(
                { user: req.session.user.id, ranking: 0 },
                { $set: { ranking: otherRank, dateUpdated: new Date() } },
                { runValidators: true }
            );
            if (!updateOther || !updateCurrent) return res.render("error", { e: "Could not swap ranking" });
        };

        const toAdd = Object.keys(req.body).filter(key => key.includes("Add"));
        let addId;
        if (toAdd.length > 0) {
            addId = toAdd[0].split("/")[1];
        };
        if (addId) {
            const currentMaxRanking = await Watchlist.countDocuments({ user: req.session.user.id });
            const createNew = await Watchlist.create({
                pet: addId,
                user: req.session.user.id,
                dateUpdated: new Date(),
                comments: req.body[addId],
                ranking: currentMaxRanking + 1
            });
            if (!createNew) return res.render("error", {e: "Could not add new entry to watchlist"});
        };

        const toReturn = Object.keys(req.body).filter(key => key.includes("submit"));
        if (toReturn.length > 0) {
            return res.redirect("/customer/watchlist");
        };

        res.redirect("/customer/watchlist/update");
    } catch (error) {
        res.render("error", { e: error });
    };
};