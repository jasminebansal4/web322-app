const storeService = require('./store-service');
const fs = require('fs');

let items = [];
let categories = [];

module.exports = {
    initialize: function() {
        return new Promise((resolve, reject) => {
            fs.readFile('./data/items.json', 'utf8', (err, data) => {
                if (err) {
                    reject("unable to read items file");
                    return;
                }
                items = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject("unable to read categories file");
                        return;
                    }
                    categories = JSON.parse(data);
                    resolve();
                });
            });
        });
    },

    getAllItems: function() {
        return new Promise((resolve, reject) => {
            if (items.length > 0) {
                resolve(items);
            } else {
                reject("no items found");
            }
        });
    },

    getPublishedItems: function() {
        return new Promise((resolve, reject) => {
            const publishedItems = items.filter(item => item.published === true);
            if (publishedItems.length > 0) {
                resolve(publishedItems);
            } else {
                reject("no published items found");
            }
        });
    },

    getCategories: function() {
        return new Promise((resolve, reject) => {
            if (categories.length > 0) {
                resolve(categories);
            } else {
                reject("no categories found");
            }
        });
    }
};
