"use strict";

// Initialize HTTP & Database server modules

const express = require("express");
const mongoose = require("mongoose");

// Set Mongoose to ES6 Promises
mongoose.Promise = global.Promise;

// Create config.js
const {PORT, DATABASE_URL } = require("./config");
const { BlogPost } = require("./models");

// Initialize app object
const app = express();
app.use(express.json());

// ROUTES

  // Basic GET Request for dev purposes
  app.get('/posts', (req, res) => {
    BlogPost
      .find()
      .limit(10)
      .then(blogposts => {
        res.json({
          blogposts: blogposts.map(
            (blogpost) => blogpost.serialize())
        });
      })
      .catch(
        err => {
          console.error(err);
          res.status(500).json({message: 'Internal server error'});
        });
  });


// SERVER LAUNCH CODE

// Create server object
let server;

// Connect to database and start server
function runServer(databaseUrl, port = PORT) {
  // Create as Promise object to enable testing calls
    return new Promise((resolve, reject) => {
      // Connect to MongoDB
      mongoose.connect(
        databaseUrl,
        err => {
          // If db connect error, exit
          if (err) {
            return reject(err);
          }
          // If no db connect error, launch HTTP server
          server - app
            .listen(port, () => {
              console.log(`Your app is listening on port ${port}`);
              resolve();
            })
            // On HTTP server start error
            .on("error", err =>{
              // Close db connection
              mongoose.disconnect();
              // Return error
              reject(err);
            });
        }
      );
    });
}

// Close the server (also promise-based for testing purposes)
function closeServer() {
  // Close MongoDB server
  return mongoose.disconnect().then( () => {
    // Close HTTP server
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


// If called directly, run this block to launch server
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.export = { app, runServer, closeServer };