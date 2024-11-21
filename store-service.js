const fs = require('fs');
const path = require('path');

let items = []; // Array to hold items
let categories = []; // Array to hold categories

// Function to initialize the service by loading items and categories from JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        // Read the items.json file
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                console.error("Error loading items.json:", err); // Log the error
                reject('Unable to load items data: ' + err);
            } else {
                items = JSON.parse(data);

                // Read the categories.json file
                fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                    if (err) {
                        console.error("Error loading categories.json:", err); // Log the error
                        reject('Unable to load categories data: ' + err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}


// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject('No items found.');
        }
    });
}

// Function to get all categories
function getAllCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject('No categories found.');
        }
    });
}

// Function to get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject('No results returned for category: ' + category);
        }
    });
}

// Function to get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject('No results returned for minimum date: ' + minDateStr);
        }
    });
}

// Function to get item by ID
// In store-service.js
function getItemById(id) {
    return new Promise((resolve, reject) => {
        getAllItems().then((items) => {
            if (Array.isArray(items)) {
                const item = items.find(i => i.id === id);  // Ensure we're using the same type for comparison
                if (item) {
                    resolve(item);
                } else {
                    reject(new Error('Item not found'));
                }
            } else {
                reject(new Error('Items data is not an array'));
            }
        }).catch((err) => {
            reject(err);
        });
    });
}





function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true && item.category === category);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No published items found for this category.");
        }
    });
}

// In store-service.js

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        try {
            // Assuming items is an array of objects that stores all items
            items.push(itemData);  // Add new item to the array
            console.log('Item added to items array:', itemData);
            resolve();  // Resolve the promise once the item is added
        } catch (err) {
            console.error('Error adding item to array:', err);
            reject(err);  // Reject the promise if there's an error
        }
    });
}


// Export functions for use in other files
module.exports = {
    initialize,
    addItem,
    getAllItems,
    getAllCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    getPublishedItemsByCategory,
};
