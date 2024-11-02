/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Jasmine______________________ Student ID: 101594232______________ Date: _01-11-2024_______________
*
* Cyclic Web App URL: ____https://7b18435d-116f-4b16-b5b4-99c61ca93af3-00-2a1ba1in978yr.riker.replit.dev/about____________________________________________________
*
* GitHub Repository URL: ___https://github.com/jasminebansal4/web322-app.git___________________________________________________
*
********************************************************************************/
// server.js
const express = require('express');
const path = require('path');
const multer = require("multer");
const storeService = require('./store-service');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Redirect root URL to /about
app.get('/', (req, res) => {
    res.redirect('/about');
});

// About page route
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Endpoint to serve the add item page
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html')); 
});


// Items route with optional filtering
app.use(express.json());

// Route to get items with optional filters
app.get('/items', (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;

    // Handle filtering based on query parameters
    if (category) {
        storeService.getItemsByCategory(category)
            .then(items => {
                res.json(items);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(items => {
                res.json(items);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    } else {
        storeService.getAllItems()
            .then(items => {
                res.json(items);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    }
});

app.get('/categories', (req, res) => {
    storeService.getAllCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).send(err));
});

// Route to get a single item by ID
app.get('/item/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    storeService.getItemById(id)
        .then(item => {
            if (item) {
                res.json(item);
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        })
        .catch(err => res.status(500).json({ message: 'Error retrieving item', error: err }));
});

// Handle 404 errors
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Initialize store service and start server
storeService.initialize()
    .then(() => {
        console.log('Initialization complete');

       
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Error initializing data: ${err}`);
    });
