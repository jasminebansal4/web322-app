const fs = require('fs');
const path = require('path');

// Load data files
let items = []; // Array to hold items
let categories = []; // Array to hold categories

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                reject('Unable to load items data: ' + err);
            } else {
                items = JSON.parse(data);
                fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                    if (err) {
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
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id));
        if (item) {
            resolve(item);
        } else {
            reject('No result returned for ID: ' + id);
        }
    });
}

// Export functions
module.exports = {
    initialize,
    getAllItems,
    getAllCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
};
