const Watchlist = require('../models/watchlist');
const User = require('../models/users');
const Pet = require('../models/pets');

async function cleanRanking(userId) {
    try {
        const orderedWatchlist = await Watchlist.find({ userId })
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

        await Watchlist.bulkWrite(bulkUpdate);
        return true;
    } catch (error) {
        console.error(`[Watchlist controller] Error reranking for user ${userId}: ${error}`);
        return false;
    };
};

exports.index = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await User.findcustomerbyid(userId);
        const name = user.name;
        let watchlist = await Watchlist.find({ userId })
            .sort({ ranking: 1 })
            .populate('petId')
            .lean();

        if (!watchlist) throw new Error("Could not get watchlist");

        const missingPets = watchlist
            .filter(entry => entry.petId === null || entry.petId === undefined);

        let alertMessage = null;
        if (missingPets.length > 0) {
            const deleteMissing = await Watchlist
                .deleteMany({ _id: { $in: missingPets.map(pet => pet._id) } });

            if (!deleteMissing) throw new Error("Could not delete stale watchlist entries");

            await cleanRanking(userId);
            watchlist = await Watchlist.find({ userId })
                .sort({ ranking: 1 })
                .populate('petId')
                .lean();

            if (!watchlist) throw new Error("Could not get updated watchlist");

            alertMessage = "Oh no! The following pet(s) are no longer available: ";
            alertMessage += missingPets.map(pet => pet.petName).join(", ");
        };

        res.render("customer/watchlist/index", { watchlist, alertMessage, name });
    } catch (error) {
        res.render('error', { e: error });
    };
};

exports.getUserComments = async (req, res) => {
    try {
        const result = req.body;
        const userId = req.session.user.id;
        if (Object.keys(result).length === 0) {
            return res.redirect("/customer/pet");
        };
        const petId = result.pet;
        const exists = await Watchlist.findOne({ petId, userId }).lean();
        const pet = await Pet.getPetbyPID(petId).lean();
        res.render("customer/watchlist/fill-info", { pet, exists });
    } catch (error) {
        res.render("error", { e: error });
    }
};

exports.processCreatedPets = async (req, res) => {
    try {
        const result = req.body;
        const userId = req.session.user.id;
        const body = Object.keys(result)[0];
        const petId = body.split("/")[1];
        const comments = result[body];
        const pet = await Pet.getPetbyPID(petId);
        const rawMaxRanking = await Watchlist.findOne({ userId }).sort({ ranking: -1 });
        const maxRanking = rawMaxRanking ? rawMaxRanking.ranking : 0;
        if (!pet) return res.render("customer/watchlist/fill-info", { pet: null, exists: null });
        const exists = await Watchlist.findOne({ petId, userId }).lean();
        if (!exists) {
            const createPet = await Watchlist.create({
                petId: petId,
                userId: userId,
                lastUpdated: new Date(),
                comments: comments,
                ranking: maxRanking + 1,
                petName: pet.name
            });
            if (!createPet) throw new Error("Unable to create new watchlist entry!");
        } else {
            const updatePet = await Watchlist.findOneAndUpdate(
                { petId, userId },
                { $set: { comments: comments, lastUpdated: new Date() } },
                { returnDocument: "after" }
            );
            if (!updatePet) throw new Error("Could not update comments of pet")
        };
        await cleanRanking(userId);

        res.redirect('/customer/watchlist');
    } catch (error) {
        res.render("error", { e: error });
    };
};

exports.getUpdateForm = async (req, res) => {
    try {
        const user = await User.findcustomerbyid(req.session.user.id);
        const name = user.name;
        const watchlist = await Watchlist.find({ userId: req.session.user.id })
            .sort({ ranking: 1 })
            .populate('petId')
            .lean();
        if (!watchlist) throw new Error("Could not get watchlist");
        const missingPets = watchlist
            .filter(entry => entry.petId === null || entry.petId === undefined);
        if (missingPets.length > 0) return res.redirect("/customer/watchlist");
        const existingPets = watchlist.map(entry => entry.petId._id);
        const pets = await Pet.getAllPets()
        if (!pets) throw new Error("Could not get all pets");
        const remainingPets = pets.filter(pet =>
            !existingPets.some(existing => existing.equals(pet._id)));
        if (watchlist.length === 0) return res.redirect("/customer/watchlist");
        res.render("customer/watchlist/update", { watchlist, remainingPets, name });
    } catch (error) {
        res.render("error", { e: error });
    }
};

exports.processUpdate = async (req, res) => {
    const userId = req.session.user.id;
    const body = req.body;

    try {
        let watchlist = await Watchlist.find({ userId })
            .sort({ ranking: 1 })
            .populate('petId')
            .lean();

        if (!watchlist) throw new Error("Could not get watchlist");

        await updateComments(userId, body);

        const actionKey = Object.keys(body).find(key =>
            key === "Submit" ||
            key === 'DeleteSelected' ||
            key === "AddSelected" ||
            key.startsWith("Up") ||
            key.startsWith("Down")
        );

        if (actionKey) {
            if (actionKey === "DeleteSelected") {
                await handleDelete(userId, body);
            } else if (actionKey.startsWith("Up")) {
                await handleMove(userId, actionKey, "Up");
            } else if (actionKey.startsWith("Down")) {
                await handleMove(userId, actionKey, "Down");
            } else if (actionKey === "AddSelected") {
                await handleCreate(userId, body);
            } else if (actionKey === 'Submit') {
                return res.redirect('/customer/watchlist');
            }
        };

        watchlist = await Watchlist.find({ userId })
            .sort({ ranking: 1 })
            .populate('petId')
            .lean();

        const missingPets = watchlist
            .filter(entry => entry.petId === null || entry.petId === undefined);
        if (missingPets.length > 0) return res.redirect("/customer/watchlist");

        res.redirect('/customer/watchlist/update');
    } catch (error) {
        res.render("error", { e: error });
    };

    async function handleDelete(userId, body) {
        const petIdsToDelete = Object.keys(body)
            .filter(key => key.startsWith("Delete/"))
            .map(key => key.split("/")[1]);
        await Watchlist.deleteMany({ userId: userId, petId: { $in: petIdsToDelete } });
        await cleanRanking(userId);
    };

    async function handleMove(userId, actionKey, direction) {
        const petId = actionKey.split('/')[1];
        if (!petId) throw new Error("Missing pet ID");

        const currentEntry = await Watchlist.findOne({ userId, petId });
        if (!currentEntry) throw new Error("Entry to move missing");

        const currentRank = currentEntry.ranking;
        const targetRank = direction === 'Up' ? currentRank - 1 : currentRank + 1;

        const otherEntry = await Watchlist.findOne({ userId, ranking: targetRank });
        if (!otherEntry) throw new Error(`No entry at rank ${targetRank}`);

        await Watchlist.bulkWrite([
            {
                updateOne: {
                    filter: { _id: currentEntry._id },
                    update: { $set: { ranking: targetRank, lastUpdated: new Date() } }
                }
            }, {
                updateOne: {
                    filter: { _id: otherEntry._id },
                    update: { $set: { ranking: currentRank, lastUpdated: new Date() } }
                }
            }
        ]);
    };

    async function handleCreate(userId, body) {
        const petIdsToCreate = Object.keys(body)
            .filter(key => key.startsWith("Add/"))
            .map(key => key.split("/")[1]);
        const petsToCreate = [];
        const rawMaxRanking = await Watchlist.findOne({ userId }).sort({ ranking: -1 });
        const maxRanking = rawMaxRanking ? rawMaxRanking.ranking : 0;
        let i = 0;
        for (const id of petIdsToCreate) {
            i++;
            const pet = await Pet.getPetbyPID(id);
            if (!pet) throw new Error("Could not retrieve pet");
            petsToCreate.push({
                userId: userId,
                petId: id,
                lastUpdated: new Date(),
                ranking: maxRanking + i,
                comments: body[id],
                petName: pet.name
            });
        };
        await Watchlist.insertMany(petsToCreate);
        await cleanRanking(userId);
    };

    async function updateComments(userId, body) {
        const allEntries = await Watchlist.find({ userId }).lean();
        const entries = allEntries.filter(entry => entry.petId !== null);

        const operations = [];
        for (const entry of entries) {
            const newComment = body[entry.petId.toString()];
            if (newComment && entry.comments !== newComment) {
                operations.push({
                    updateOne: {
                        filter: { userId, petId: entry.petId },
                        update: {
                            $set: {
                                comments: newComment,
                                lastUpdated: new Date()
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