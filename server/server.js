// Imports
const shortid = require("shortid");
const validUrl = require("valid-url");
const express = require("express");
const bodyParser = require('body-parser'); // converting request body to JSON
const redis = require('redis');
const {promisify} = require('util');

// Constants
const PORT = 6060;
const redis_addr = 'localhost'
const baseUrl = 'http://localhost';

// Setup
const app = express();
const redisClient = redis.createClient(6379, redis_addr);

// async redis
const getAsync = promisify(redisClient.get).bind(redisClient);

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.log('Something went wrong ' + err);
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// CORS (since we're running it locally)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,x-access-token,X-Key");
    if (req.method == "OPTIONS") {
        res.status(200).end();
    } else {
        next();
    }
});

// ROUTES
// Create an unshortened URL and store
app.post("/", async (req, res) => {
    const enteredUrl = req.body.url;

    // This will be the unique path for short URL, async call
    const uniquePath = shortid.generate();
    
    if (validUrl.isUri(enteredUrl)) {
        try {
            const key = await getAsync(uniquePath);
            if (key) { // wouldnt occur atm.. all unique shortURLs
                res.status(200).json(key);
            } else {
                await redisClient.set(uniquePath, enteredUrl, redis.print);
                res.status(200).json({
                    data: baseUrl + ":" + PORT + "/" + uniquePath
                });
            }
        } catch (err) {
            res.status(400).json("Error: Failed to set data into Redis", err);
        }
    } else {
        res.status(400).json("Bad Request: Invalid URL entered");
    }
});

// Get the full URL
app.get('/:shortPath', async (req, res) => {
    const fullUrl = await getAsync(req.params.shortPath);

    if (fullUrl) {
        return res.redirect(fullUrl);
    } else {
        return res.status(404).send('Not Found');
    }
});

// START SERVER
app.listen(PORT, () => {
 console.log("Starting server on port..", PORT);
});
