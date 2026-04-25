const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// DELIBERATELY WRONG IMPLEMENTATION
// 1. Uses CommonJS (require/module.exports) instead of ES6 modules/TypeScript imports
// 2. No TypeScript types/interfaces
// 3. Logic is directly in the route (no Controller/Service separation)
// 4. Bypasses Authentication/Authorization middleware (Passport.js)
// 5. Uses raw collection access instead of the defined Mongoose Model
// 6. Non-standard route naming and placement

router.get('/delete-user-now', async (req, res) => {
    try {
        const userId = req.query.id; // Taking ID from query instead of params or body
        
        if (!userId) {
            return res.status(400).send("Missing ID");
        }

        console.log("Attempting to delete user directly from DB: " + userId);

        // Bypassing the User Model and Service layer
        const result = await mongoose.connection.db.collection('users').deleteOne({
            _id: new mongoose.Types.ObjectId(userId)
        });

        if (result.deletedCount === 1) {
            res.status(200).send("User deleted successfully. Hope you had permission!");
        } else {
            res.status(404).send("User not found in raw collection.");
        }
    } catch (err) {
        // Sloppy error handling
        res.status(500).send("Error: " + err.message);
    }
});

module.exports = router;
