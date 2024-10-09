const express = require('express');
const storeService = require('./store-service'); // Assuming the correct path to store-service
const app = express();

// Use static middleware to serve static files
app.use(express.static('public'));

// Root route redirect to /about
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Route to serve the about page
app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
});

// Shop route to get published items
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({ message: err }));
});

// Items route to get all items
app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(500).json({ message: err }));
});

// Categories route to get all categories
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ message: err }));
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server only after the store service is initialized
storeService.initialize()
    .then(() => {
        app.listen(process.env.PORT || 8080, () => {
            console.log('Server listening on port 8080');
        });
    })
    .catch(err => {
        console.log('Unable to start server: ', err);
    });
