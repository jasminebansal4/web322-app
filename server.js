/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Jasmine______________________ Student ID: 101594232______________ Date: _01-11-2024_______________
*
* Cyclic Web App URL: ____https://7b18435d-116f-4b16-b5b4-99c61ca93af3-00-2a1ba1in978yr.riker.replit.dev____________________________________________________
*
* GitHub Repository URL: ___https://github.com/jasminebansal4/web322-app.git___________________________________________________
*
********************************************************************************/ 

// server.js
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = express.Router();
const multer = require("multer");
const storeService = require('./store-service');

const app = express();
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
const PORT = process.env.PORT || 3000;

const upload = multer();

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) 
        ? route.replace(/\/(?!.*)/, "") 
        : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Define Handlebars Helpers
const hbsHelpers = {
    navLink: function(url, options) {
        return `<li class="nav-item${(url == app.locals.activeRoute) ? ' active' : ''}">
                   <a class="nav-link" href="${url}">${options.fn(this)}</a>
                </li>`;
    },
    equal: function(lvalue, rvalue, options) {
        if (arguments.length < 3) 
            throw new Error("Handlebars Helper equal needs 2 parameters");
        return (lvalue != rvalue) ? options.inverse(this) : options.fn(this);
    }
};
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));  // Make sure the views directory is correct

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: hbsHelpers
}));



// Serve static files from the "public" directory
app.use(express.static('public'));
// Make sure this is added at the top of your server.js
app.use(express.urlencoded({ extended: true }));


// Redirect root URL to /about
// Redirect root route to /shop
router.get('/', (req, res) => {
    res.redirect('/shop');
});


// /shop route
// The '/shop' route for both category-based filtering and item-specific views
router.get('/shop', (req, res) => {
    const viewingCategory = req.query.category || '';  // Get category from query
    const itemId = req.query.id ? parseInt(req.query.id) : null;  // Get item id from query

    // If an ID is provided, fetch that specific item
    if (itemId) {
        storeService.getItemById(itemId)  // Fetch item by ID
            .then((item) => {
                res.render('shop', {
                    data: {
                        post: item,  // Show the item details
                        posts: [],  // No need to show other items
                        categories: [],  // Categories are not needed when viewing a single item
                        viewingCategory: viewingCategory,
                        message: ''
                    }
                });
            })
            .catch((err) => {
                res.render('shop', {
                    data: {
                        message: 'Item not found'
                    }
                });
            });
    } else if (viewingCategory) {
        // If a category is provided, fetch items filtered by that category
        Promise.all([
            storeService.getPublishedItemsByCategory(parseInt(viewingCategory)),  // Fetch items for that category
            storeService.getAllCategories()  // Get all categories (for the filter)
        ])
        .then(([items, categories]) => {
            res.render('shop', {
                data: {
                    posts: items,  // Show items for the specific category
                    categories: categories,  // Show all categories
                    viewingCategory: viewingCategory,  // Show the current category
                    message: items.length > 0 ? '' : 'No items found for this category'
                }
            });
        })
        .catch((err) => {
            res.render('shop', {
                data: {
                    message: 'Error loading items by category'
                }
            });
        });
    } else {
        // If no ID or category is provided, show all items
        Promise.all([
            storeService.getAllItems(),  // Get all items
            storeService.getAllCategories()  // Get all categories
        ])
        .then(([items, categories]) => {
            res.render('shop', {
                data: {
                    posts: items,  // Show all items
                    categories: categories,  // Show category options
                    viewingCategory: viewingCategory,  // No specific category
                    message: items.length > 0 ? '' : 'No items available'
                }
            });
        })
        .catch((err) => {
            res.render('shop', {
                data: {
                    message: 'Error loading items'
                }
            });
        });
    }
});




// Route to get a specific item by ID
// This route is used to show a specific item by its ID
// This route is used to show a specific item by its ID
router.get('/shop/:id', (req, res) => {
    const itemId = req.params.id;  // Get the item ID from the URL parameter
    const category = req.query.category || '';  // Get the category from the query string

    // Fetch the item by ID and categories
    Promise.all([
        storeService.getItemById(itemId),  // Fetch the item using its ID
        storeService.getAllCategories()    // Fetch all categories for the filter
    ])
    .then(([item, categories]) => {
        if (!item) {
            // If no item is found, show a message
            res.render('shop', {
                data: {
                    message: 'Item not found!',
                    categories: categories
                }
            });
        } else {
            // Successfully found the item, render the shop page with the item details and categories
            res.render('shop', {
                data: {
                    post: item,           // Display the specific item
                    categories: categories, // Show all categories for filtering
                    viewingCategory: category, // Show the selected category
                    message: ''           // No error message
                }
            });
        }
    })
    .catch((err) => {
        console.error('Error fetching item or categories:', err);
        res.render('shop', {
            data: {
                message: 'An error occurred while loading the item or categories.',
                categories: []
            }
        });
    });
});




// Use the router for routing
app.use(router);

// About page route
app.get('/about', (req, res) => {
    res.render('about');  // This should render about.hbs
});

// Endpoint to serve the add item page
app.get('/items/add', (req, res) => {
    console.log("ebdbencjke");
    res.render('addPost');
});
router.post('/items/add', (req, res) => {
    const { title, category, price, body, featureImage } = req.body;
    console.log('Form data received:', { title, category, price, body, featureImage });

    // Assuming you have a method to add the item
    const newItem = {
        title,
        category,
        price,
        body,
        featureImage,
        postDate: new Date().toISOString().split('T')[0],  // Set postDate as current date (formatted YYYY-MM-DD)
    };

    // Call your service method to add the item
    storeService.addItem(newItem)
        .then(() => {
            console.log('Item added successfully');
            res.redirect('/shop');  // Redirect to the shop page after adding the item
        })
        .catch((err) => {
            console.error('Error adding item:', err);
            res.render('addPost', { message: 'Error adding item, please try again.' });
        });
});




// Items route with optional filtering
app.use(express.json());

// Route to get items with optional filters
app.get('/items', (req, res) => {
    const category = req.query.category;  // Get category query parameter
    const minDate = req.query.minDate;    // Get minDate query parameter
    const id = req.query.id;              // Get item id query parameter

    if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((items) => {
                res.render('items', { items: items });
            })
            .catch((err) => {
                res.render('items', { message: "No items found after this date." });
            });
    } else if (category) {
        storeService.getItemsByCategory(category)
            .then((items) => {
                res.render('items', { items: items });
            })
            .catch((err) => {
                res.render('items', { message: "No items found for this category." });
            });
    } else if (id) {
        storeService.getItemById(id)
            .then((item) => {
                res.render('itemDetail', { item: item });
            })
            .catch((err) => {
                res.render('items', { message: "Item not found." });
            });
    } else {
        storeService.getAllItems()
            .then((items) => {
                res.render('items', { items: items });
            })
            .catch((err) => {
                res.render('items', { message: "No items found." });
            });
    }
});

// Route to display categories
app.get('/categories', (req, res) => {
    storeService.getAllCategories()
        .then((categories) => {
            res.render('categories', { categories: categories });
        })
        .catch((err) => {
            res.render('categories', { message: "No categories found." });
        });
});

// Route to get a single item by ID
app.get('/item/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const category = req.query.category;  // Capture category from query string

    storeService.getItemById(id)
        .then(item => {
            if (item) {
                // Optionally, use the category here to filter or display info
                res.render('itemDetail', { item: item, category: category });
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        })
        .catch(err => res.status(500).json({ message: 'Error retrieving item', error: err }));
});


// Handle 404 errors
app.get('*', (req, res) => {
    res.render('404'); 
});

// Initialize store service and start server
storeService.initialize()
    .then(() => {
        console.log('Store service initialized');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.log('Error initializing store service:', err);
    });
