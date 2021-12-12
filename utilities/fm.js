/*
* A File Manager Library for NodeJS
* Author: Nate Penner
* When: December 2021
* */

const fs = require('fs');

// Export the module
const api = module.exports = {};

// Get all the files at 'path' asynchronously and callback with the files
// <string> path: path to a directory
// <function> callback(Dirent[]): the function to pass the files to
api.getFileNames = function(path, callback) {
    fs.readdir(path, {withFileTypes: true}, (err, entries) => {
        if (err)
            callback(err);
        else {
            entries = entries
                .filter(entry => entry.isFile())
                .map(file => file.name);

            callback(entries);
        }
    });
};

// Get all the directories at 'path' asynchronously and callback with the directories
// <string> path: path to a directory
// <function> callback(Dirent[]): the function to pass the directories to
api.getFolderNames = function(path, callback) {
    fs.readdir(path, {withFileTypes: true}, (err, entries) => {
        entries = entries.filter(entry => entry.isDirectory())
            .map(dir => dir.name);

        callback(entries);
    });
};

// Get all the files at 'path' synchronously
// <string> path: path to a directory
//
// returns: Dirent[] of the files, or an Error object if an error occurred
api.getFileNamesSync = function(path) {
    try {
        let files = fs.readdirSync(path, {withFileTypes: true});
        files = files
            .filter(entry => entry.isFile())
            .map(file => file.name);

        return files;
    } catch (e) {
        return e;
    }
};

// Get all the directories at 'path' synchronously
// <string> path: path to a directory
//
// returns: Dirent[] of the directories, or an Error object if an error occurred
api.getFolderNamesSync = function(path) {
    try {
        let folders = fs.readdirSync(path, {withFileTypes: true});
        folders = folders
            .filter(entry => entry.isDirectory())
            .map(dir => dir.name);

        return folders;
    } catch(e) {
        return e;
    }
};