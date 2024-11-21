const fs = require('fs');
const path = require('path');

// Arrays to hold items and categories
let items = [];
let categories = [];

// Function to initialize the service by loading JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                console.error("Error loading items.json:", err);
                return reject('Unable to load items data.');
            }
            try {
                items = JSON.parse(data);
            } catch (parseErr) {
                return reject('Error parsing items.json: ' + parseErr.message);
            }

            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    console.error("Error loading categories.json:", err);
                    return reject('Unable to load categories data.');
                }
                try {
                    categories = JSON.parse(data);
                    resolve(); // Resolve after both files are successfully loaded
                } catch (parseErr) {
                    reject('Error parsing categories.json: ' + parseErr.message);
                }
            });
        });
    });
}

// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) resolve(items);
        else reject('No items found.');
    });
}

// Function to get all categories
function getAllCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) resolve(categories);
        else reject('No categories found.');
    });
}

// Function to get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category));
        if (filteredItems.length > 0) resolve(filteredItems);
        else reject('No items found for category: ' + category);
    });
}

// Function to get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) resolve(filteredItems);
        else reject('No items found after the date: ' + minDateStr);
    });
}

// Function to get an item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id));
        if (item) resolve(item);
        else reject('No item found with ID: ' + id);
    });
}

// Function to get published items by category
function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true && item.category === parseInt(category));
        if (publishedItems.length > 0) resolve(publishedItems);
        else reject('No published items found for category: ' + category);
    });
}

// Function to add a new item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        try {
            items.push(itemData); // Add the new item to the array
            resolve();
        } catch (err) {
            reject('Error adding item: ' + err.message);
        }
    });
}

// Export functions for use in other modules
module.exports = {
    initialize,
    getAllItems,
    getAllCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    getPublishedItemsByCategory,
    addItem
};
