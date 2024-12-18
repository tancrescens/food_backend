require("dotenv").config();
const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");

let app = express();
app.use(cors());
app.use(express.json())

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;
const DB_NAME = "food_review";

async function connect(MONGO_URI, DB_NAME) {
    let client = await MongoClient.connect(MONGO_URI, {
        useUnifiedTopology: true
    })
    db = client.db(DB_NAME);
    return db;
}

async function main() {
    let db = await connect(MONGO_URI, DB_NAME);

    // ROUTES here
    // ROUTE: Default
    app.get("/", function (req, res) {
        res.send("Hello Food Reviewers!")
    });

    // ROUTE: Search restaurant's reviews
    app.get('/restaurant_reviews', async (req, res) => {
        try {
            const { latlng, name } = req.query;
            let query = {};

            // if (latlng) {
            //     query['latlng'] = { $regex: latlng, $options: 'i' };
            // }

            if (name) {
                query.name = { $regex: name, $options: 'i' };
            }

            const restaurant_review = await db.collection('restaurant_reviews').find(query).project({
                name: 1,
                latlng: 1,
                reviews: 1,
                _id: 0
            }).toArray();

            res.json({ restaurant_review });
        } catch (error) {
            console.error(`Error searching restaurant's reviews:`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ROUTE: get ALL restaurants' reviews
    app.get("/restaurant_reviews", async (req, res) => {
        try {
            const restaurant_reviews = await db.collection("restaurant_reviews").find().project({
                name: 1,
                latlng: 1,
                reviews: 1,
            }).toArray();

            res.json({ restaurant_reviews });
        } catch (error) {
            console.error("Error fetching restaurants' reviews:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // ROUTE: Get restaurant's reviews by ID
    app.get("/restaurant_reviews/:id", async (req, res) => {
        try {
            const id = req.params.id;

            // First, fetch the recipe
            const restaurant_review = await db.collection("restaurant_reviews").findOne(
                { _id: new ObjectId(id) },
                { projection: { _id: 0 } }
            );

            if (!restaurant_review) {
                return res.status(404).json({ error: "Restaurant review not found" });
            }

            res.json(restaurant_review);
        } catch (error) {
            console.error("Error fetching restaurant's review:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // ROUTE: Create restaurant
    app.post("/restaurant", async function (req, res) {
        // parameters:
        // restaurantName, latlng[], reviews[{},{}],
        // { _id, datetime, by{_id,name,review[], description} }
        try {
            const { name, latlng } = req.body;
            // Simple Validation
            if (!name || !latlng) {
                res.sendStatus(400).json({ "error": "One or more invalid input" })
            }

            // Fetch docs and check that there are no such restaurant already existing
            const restaurantDocs = await db.collection('restaurant_reviews').findOne({ name: name });
            if (restaurantDocs) {
                return res.status(400).json({ "error": "restaurant already exists, please try a different name" });
            }

            const newRestaurant = {
                name: name,
                latlng: latlng,
                reviews: []
            }

            const result = await db.collection('restaurant_reviews').insertOne(newRestaurant);

            res.sendStatus(201);
        }
        catch (e) {
            console.error('Error creating recipe:', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ROUTE: Update restaurant
    app.put("/restaurant/:id", async function (req, res) {
        // parameters:
        // restaurantName, latlng[], reviews[{},{}],
        // { _id, datetime, by{_id,name,reviews[], description} }
        try {
            const restaurantId = req.params.id;
            const { name, latlng } = req.body;

            // Simple Validation
            if (!name || !latlng) {
                res.sendStatus(400).json({ "error": "One or more input needs to be added" })
            }

            const updateRestaurant = {
                name: name,
                latlng: latlng,
            }
            // Update the recipe in the database
            const result = await db.collection('restaurant_reviews').updateOne(
                { _id: new ObjectId(restaurantId) },
                { $set: updateRestaurant }
            );

            res.sendStatus(201);
        }
        catch (e) {
            console.error('Error updating restaurant:', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ROUTE: delete restaurant
    app.delete('/restaurant/:id', async (req, res) => {
        try {
            const restaurantId = req.params.id;

            // Attempt to delete the recipe
            const result = await db.collection('restaurant_reviews').deleteOne({ _id: new ObjectId(restaurantId) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }

            res.json({ message: 'Restaurant deleted successfully' });
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


}
main();

// Server starting on port 8080
app.listen(PORT, function () {
    console.log("Server started on port " + PORT);
})