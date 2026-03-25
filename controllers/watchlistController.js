const Watchlist = require('../models/watchlist');
const User = require('../models/users');
const Pet = require('../models/pets');

async function cleanRanking(userId) {
    try {
        const orderedWatchlist = await Watchlist.find({ user: userId })
            .sort({ ranking: 1 })
            .lean()
        if (!orderedWatchlist) throw new Error("Could not get watchlist");

        if (orderedWatchlist.length === 0) return true;

        const bulkUpdate = orderedWatchlist.map((entry, index) => ({
            updateOne: {
                filter: { _id: entry._id },
                update: { $set: { ranking: index + 1 } }
            }
        }));

        const updateRanking = await Watchlist.bulkWrite(bulkUpdate);
        if (!updateRanking) throw new Error("Bulk update failure");
        return true;
    } catch (error) {
        console.error(`[Watchlist controller] Error reranking for user ${userId}: ${error}`);
        return false;
    };
};

exports.index = async (req, res) => {
    try {
        const userId = req.session.user.id;
        let watchlist = await Watchlist.find({ user: userId })
            .sort({ ranking: 1 })
            .populate('pet')
            .lean();

        if (!watchlist) throw new Error("Could not get watchlist");

        const missingPets = watchlist
            .filter(entry => entry.pet === null || entry.pet === undefined);

        let alertMessage = null;
        if (missingPets.length > 0) {
            const deleteMissing = await Watchlist
                .deleteMany({ _id: { $in: missingPets.map(pet => pet._id) } });

            if (!deleteMissing) throw new Error("Could not delete stale watchlist entries");

            await cleanRanking(userId);

            watchlist = await Watchlist.find({ user: userId })
                .sort({ ranking: 1 })
                .populate('pet')
                .lean();

            if (!watchlist) throw new Error("Could not get updated watchlist");

            alertMessage = "Oh no! The following pet(s) are no longer available: ";
            missingPets.forEach(pet => {
                alertMessage += pet.petName;
                alertMessage += " ";
            });
        };

        res.render("customer/watchlist/index", { watchlist, alertMessage });
    } catch (error) {
        res.render('error', { e: error });
    };
};

exports.addPetsView = async (req, res) => {
    try {
        const watchlist = await Watchlist.find({ user: req.session.user.id }).lean();
        if (!watchlist) throw new Error("Could not get watchlist");
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

        const pets = await Pet.getAllPets();
        if (!pets) throw new Error("Could not get pets");
        const watchlistEntries = selected.map((petId, index) => {
            const pet = pets.filter(pet => pet._id.toString() === petId)[0];
            return {
                pet: petId,
                user: req.session.user.id,
                dateUpdated: new Date(),
                comments: result[petId],
                ranking: index + 1,
                petName: pet.name
            };
        });

        const createEntries = await Watchlist.insertMany(watchlistEntries);
        if (!createEntries) throw new Error("Could not insert entries");
        res.redirect('/customer/watchlist');
    } catch (error) {
        res.render("error", { e: error });
    };
};

exports.getUpdateForm = async (req, res) => {
    try {
        const watchlist = await Watchlist.find({ user: req.session.user.id })
            .sort({ ranking: 1 })
            .populate('pet');
        if (!watchlist) throw new Error("Could not get watchlist");
        const existingPets = watchlist.map(entry => entry.pet._id);
        const pets = await Pet.getAllPets()
        if (!pets) throw new Error("Could not get all pets");
        const remainingPets = pets.filter(pet =>
            !existingPets.some(existing => existing.equals(pet._id)));
        if (watchlist.length === 0) return res.redirect("/customer/watchlist");
        res.render("customer/watchlist/update", { watchlist, remainingPets });
    } catch (error) {
        res.render("error", { e: error });
    }
};

exports.processUpdate = async (req, res) => {
    const userId = req.session.user.id;
    const body = req.body;

    try {
        let watchlist = await Watchlist.find({ user: userId })
            .sort({ ranking: 1 })
            .populate('pet')
            .lean();

        if (!watchlist) throw new Error("Could not get watchlist");
        const missingPets = watchlist
            .filter(entry => entry.pet === null || entry.pet === undefined);
        if (missingPets.length > 0) return res.redirect("/customer/watchlist"); 

        await updateComments(userId, body);
        const actionKey = Object.keys(body).find(key =>
            key === "submit" ||
            key.startsWith('Delete') ||
            key.startsWith("Up") ||
            key.startsWith("Down") ||
            key.startsWith("Add")
        );

        if (actionKey) {
            if (actionKey.startsWith("Delete")) {
                await handleDelete(userId, actionKey);
            } else if (actionKey.startsWith("Up")) {
                await handleMove(userId, actionKey, "Up");
            } else if (actionKey.startsWith("Down")) {
                await handleMove(userId, actionKey, "Down");
            } else if (actionKey.startsWith("Add")) {
                await handleAdd(userId, actionKey);
            } else if (actionKey === 'submit') {
                return res.redirect('/customer/watchlist');
            }
        };

        res.redirect('/customer/watchlist/update');
    } catch (error) {
        res.render("error", { e: error });
    };

    async function handleDelete(userId, actionKey) {
        const petId = actionKey.split("/")[1];
        if (!petId) throw new Error("Invalid delete: missing pet ID");
        const entry = await Watchlist.findOne({ user: userId, pet: petId });
        if (!entry) throw new Error("Entry to delete not found");
        const result = await Watchlist.deleteOne({ user: userId, pet: petId });
        if (result.deletedCount !== 1) throw new Error("Could not delete entry");
        const updateRank = await Watchlist.updateMany(
            { user: userId, ranking: { $gt: entry.ranking } },
            { $inc: { ranking: -1 } }
        );
        if (!updateRank) throw new Error("Could not update rankings!");
    };
    async function handleMove(userId, actionKey, direction) {
        const petId = actionKey.split('/')[1];
        if (!petId) throw new Error("Missing pet ID");

        const currentEntry = await Watchlist.findOne({ user: userId, pet: petId });
        if (!currentEntry) throw new Error("Entry to move missing");

        const currentRank = currentEntry.ranking;
        const targetRank = direction === 'Up' ? currentRank - 1 : currentRank + 1;

        const otherEntry = await Watchlist.findOne({ user: userId, ranking: targetRank });
        if (!otherEntry) throw new Error(`No entry at rank ${targetRank}`);

        currentEntry.ranking = 0;
        currentEntry.save();
        const updateOther = await Watchlist.updateOne(
            { user: req.session.user.id, ranking: targetRank },
            { $set: { ranking: currentRank, dateUpdated: new Date() } },
            { runValidators: true }
        );
        const updateCurrent = await Watchlist.updateOne(
            { user: req.session.user.id, ranking: 0 },
            { $set: { ranking: targetRank, dateUpdated: new Date() } },
            { runValidators: true }
        );
        if (!updateOther || !updateCurrent) throw new Error("Could not swap ranking");

    };
    async function handleAdd(userId, actionKey) {
        const petId = actionKey.split("/")[1];
        if (!petId) throw new Error("Missing pet ID");

        const pet = await Pet.getPetbyPID(petId);
        if (!pet) throw new Error("Pet no longer available/not found");

        const newRank = await Watchlist.countDocuments({ user: userId }) + 1;
        if (!newRank) throw new Error("Could not retrieve watchlist length");

        const createNew = await Watchlist.create({
            pet: petId,
            user: userId,
            dateUpdated: new Date(),
            comments: body[petId],
            ranking: newRank,
            petName: pet.name
        });

        if (!createNew) throw new Error("Unable to add new pet to watchlist");
    };

    async function updateComments(userId, body) {
        const entries = await Watchlist.find({ user: userId }).lean();

        const operations = [];
        for (const entry of entries) {
            const newComment = body[entry.pet.toString()];
            if (newComment && entry.comments !== newComment) {
                operations.push({
                    updateOne: {
                        filter: { user: userId, pet: entry.pet },
                        update: {
                            $set: {
                                comments: newComment,
                                dateUpdated: new Date()
                            }
                        }
                    }
                });
            };
        };

        if (operations.length > 0) {
            const result = await Watchlist.bulkWrite(operations);
            if (result.hasWriteErrors()) throw new Error(`Bulk comment update failed for ${result.getWriteErrors()}`);
        };
    };
};