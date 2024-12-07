
/*********************************************************************************
WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
No part *  of this assignment has been copied manually or electronically from any other 
source (including 3rd party web sites) or distributed to other students.

Name: Jasmine
Student ID: 101594232
Date: 4th December 2024
Glitch Web App URL: 
GitHub Repository URL: https://github.com/jasminebansal4/web322-app
********************************************************************************/ 
const express = require("express");
const multer = require("multer");
const { engine } = require("express-handlebars");
const handlebars = require("handlebars");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const path = require("path");
const storeService = require("./store-service.js");
const itemData = require("./store-service");
const app = express();
const upload = multer();

const HTTP_PORT = process.env.PORT || 3000;

cloudinary.config({
	cloud_name: "dipwds4rw",
	api_key: "218761781343921",
	api_secret: "s7sLLCFLAi5hmHb6kb1B6N7cjds",
	secure: true,
});
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
	let route = req.path.substring(1);
	app.locals.activeRoute =
	  "/" + (isNaN(route.split("/")[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
	app.locals.viewingCategory = req.query.category;
	next();
});

app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.engine(
	".hbs",
	engine({
	  extname: ".hbs",
	  defaultLayout: "main",
	  helpers: {
		// SafeHTML helper
		safeHTML: function (htmlString) {
		  return new handlebars.SafeString(htmlString);
		},
  
		// navLink helper
		navLink: function (url, options) {
		  return (
			'<li class="nav-item"><a ' +
			(url == app.locals.activeRoute
			  ? 'class="nav-link active" '
			  : 'class="nav-link" ') +
			'href="' +
			url +
			'">' +
			options.fn(this) +
			"</a></li>"
		  );
		},
  
		// Equal helper
		equal: function (lvalue, rvalue, options) {
		  if (arguments.length < 3)
			throw new Error("Handlebars Helper equal needs 2 parameters");
		  return lvalue != rvalue
			? options.inverse(this)
			: options.fn(this);
		},
		// formatDate helper
		formatDate: function (dateObj) {
			let year = dateObj.getFullYear();
			let month = (dateObj.getMonth() + 1).toString();
			let day = dateObj.getDate().toString();
			return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
		},
	  },
	})
  );
  
app.set("view engine", ".hbs");

app.get("/", (req, res) => {
	res.redirect("/shop");
  });
  

app.get("/about", (req, res) => {
    res.render("about");
});


// Route for displaying the "Add Post" page
app.get("/items/add", (req, res) => {
    // Call to get all categories
    storeService.getAllCategories()
        .then((categories) => {
			res.render("addItem", { categories: categories });
        })
        .catch((err) => {
            // If there's an error, render the page with an empty array for categories
            console.error("Error fetching categories:", err);
            res.render("addItem", { categories: [] });
        });
});


app.get("/shop", async (req, res) => {
	// Declare an object to store properties for the view
	let viewData = {};
  
	try {
	  // declare empty array to hold "item" objects
	  let items = [];
  
	  // if there's a "category" query, filter the returned items by category
	  if (req.query.category) {
		// Obtain the published "item" by category
		items = await itemData.getPublishedItemsByCategory(req.query.category);
	  } else {
		// Obtain the published "items"
		items = await itemData.getPublishedItems();
	  }
  
	  // sort the published items by itemDate
	  items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
	  // get the latest item from the front of the list (element 0)
	  let item = items[0];
  
	  // store the "items" and "item" data in the viewData object (to be passed to the view)
	  viewData.items = items;
	  viewData.item = item;
	} catch (err) {
	  viewData.message = "no results";
	}
  
	try {
	  // Obtain the full list of "categories"
	  let categories = await itemData.getCategories();
  
	  // store the "categories" data in the viewData object (to be passed to the view)
	  viewData.categories = categories;
	} catch (err) {
	  viewData.categoriesMessage = "no results";
	}
  
	// render the "shop" view with all of the data (viewData)
	res.render("shop", { data: viewData });
  });
//
app.get("/items", (req, res) => {
	const category = req.query.category;
	const minDate = req.query.minDate;
  
	let itemPromise;
  
	if (category) {
	  itemPromise = storeService.getItemsByCategory(category);
	} else if (minDate) {
	  itemPromise = storeService.getItemsByMinDate(minDate);
	} else {
	  itemPromise = storeService.getAllItems();
	}
  
	itemPromise
	  .then((items) => {
		if (items.length > 0) {
		  res.render("items", { items });
		} else {
		  res.render("items", { message: "no results" });
		}
	  })
	  .catch(() => {
		res.render("items", { message: "no results" });
	  });
  });
  
 
  app.get('/categories', (req, res) => {
    storeService.getAllCategories()
        .then((categories) => {
            // Pass the categories data to the view
            res.render('categories', { categories: categories });
        })
        .catch((err) => {
            res.render('categories', { message: "Error retrieving categories: " + err });
        });
});

//
// GET: Render Add Category Form
app.get("/categories/add", (req, res) => {
    res.render("addCategory"); 
});

// POST: Handle Add Category Form Submission
app.post("/categories/add", (req, res) => {
    storeService.addCategory(req.body)
        .then(() => {
            res.redirect("/categories"); // Redirect to /categories on success
        })
        .catch((err) => {
            res.status(500).send("Unable to Add Category: " + err);
        });
});

// GET: Delete Category by ID
app.get("/categories/delete/:id", (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => {
            res.redirect("/categories"); // Redirect to /categories on success
        })
        .catch((err) => {
            res.status(500).send("Unable to Remove Category / Category not found: " + err);
        });
});
app.post("/items/add", upload.single("featureImage"), (req, res) => {
	if (req.file) {
		let streamUpload = (req) => {
			return new Promise((resolve, reject) => {
				let stream = cloudinary.uploader.upload_stream((error, result) => {
					if (result) {
						resolve(result);
					} else {
						reject(error);
					}
				});

				streamifier.createReadStream(req.file.buffer).pipe(stream);
			});
		};

		async function upload(req) {
			let result = await streamUpload(req);
			console.log(result);
			return result;
		}

		upload(req).then((uploaded) => {
			processItem(uploaded.url);
		});
	} else {
		processItem("");
	}

	function processItem(imageUrl) {
		req.body.featureImage = imageUrl;

		// TODO: Process the req.body and add it as a new Item before redirecting to /items
		storeService
			.addItem(req.body)
			.then(() => {
				res.redirect("/items");
			})
			.catch(() => {
				// error msg
				console.log("Error:", err);
				res.status(500);
			});
	}
});
// GET: Delete Item by ID
app.get("/Items/delete/:id", (req, res) => {
    const itemId = req.params.id;

    storeService.deletePostById(itemId)
        .then(() => {
            // If the deletion is successful, redirect back to the /items view
            res.redirect("/items");
        })
        .catch((err) => {
            // If there's an error, send a 500 status with an error message
            res.status(500).send("Unable to Remove Post / Post not found");
        });
});



app.get("/items/:id", (req, res) => {
	const itemId = req.params.id;
	storeService.getItemById(itemId)
		.then((item) => {
			res.send(JSON.stringify(item));
		})
		.catch((err) => {
			console.log("Error while getting item by id:", itemId);
		});
});
app.get('/shop/:id', async (req, res) => {

	// Declare an object to store properties for the view
	let viewData = {};
  
	try{
  
		// declare empty array to hold "item" objects
		let items = [];
  
		// if there's a "category" query, filter the returned items by category
		if(req.query.category){
			// Obtain the published "items" by category
			items = await itemData.getPublishedItemsByCategory(req.query.category);
		}else{
			// Obtain the published "items"
			items = await itemData.getPublishedItems();
		}
  
		// sort the published items by itemDate
		items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));
  
		// store the "items" and "item" data in the viewData object (to be passed to the view)
		viewData.items = items;
  
	}catch(err){
		viewData.message = "no results";
	}
  
	try{
		// Obtain the item by "id"
		viewData.item = await itemData.getItemById(req.params.id);
	}catch(err){
		viewData.message = "no results"; 
	}
  
	try{
		// Obtain the full list of "categories"
		let categories = await itemData.getCategories();
  
		// store the "categories" data in the viewData object (to be passed to the view)
		viewData.categories = categories;
	}catch(err){
		viewData.categoriesMessage = "no results"
	}
  
	// render the "shop" view with all of the data (viewData)
	res.render("shop", {data: viewData})
  });





app.use((req, res, next) => {
	res.status(404).send("404 - Page Not Found");
});

storeService.initialize()
	.then(() => {
		app.listen(HTTP_PORT, () => {
			console.log(`Express http server listening on ${HTTP_PORT}`);
		});
	})
	.catch((err) => {
		console.log("ERROR ON SERVER BOOT:", err);
	});

	app.use((req, res) => {
		res.status(404).render("404");
	  });
	  
=======
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
    res.sendFile(path.join(__dirname, 'views', 'addItem.html')); // Ensure the path is correct
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

        // Start listening for requests
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Error initializing data: ${err}`);
    });
>>>>>>> b7c35cd7a311647b2ecdea1d3b6ce78e27fb04f8
