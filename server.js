"use strict";

// Initialize HTTP & Database server modules

const express = require("express");
const mongoose = require("mongoose");

// Set Mongoose to ES6 Promises
mongoose.Promise = global.Promise;

// Create config.js
const {PORT, DATABASE_URL } = require("./config");
const { BlogPost, Author } = require("./models");

// Initialize app object
const app = express();
app.use(express.json());

// ROUTES

  // GET all posts
  app.get('/posts', (req, res) => {
    BlogPost
      .find()
      .limit(10)
      .then(blogposts => {
        res.json({
          blogposts: blogposts.map(
            (blogpost) => blogpost.serializeNoComments())
        });
      })
      .catch(
        err => {
          console.error(err);
          res.status(500).json({message: 'Internal server error'});
        });
  });
  
  // GET /posts/:id
  app.get('/posts/:id', (req, res) => {
    BlogPost
      .findById(req.params.id)
      .then(blogpost => res.json(blogpost.serialize()))
      .catch( err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });

  // POST /posts
  app.post('/posts', (req, res) => {
    // Verify require fields
    const requiredFields = ['title', 'content', 'author_id'];
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }
    
    // Verify author_id exists in author collections
    if (!Author.findById(req.body.author_id)) {
      return res.status(500).send('Internal server error');
    }
    
    BlogPost.create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author_id,
      created: req.body.created
    })
      .then(blogpost => res.status(201).json(blogpost.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });
  
  // PUT /posts/:id
  app.put('/posts/:id', (req, res) => {
    // Confirm params & body id fields match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      const message = 
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
      console.error(message);
      return res.status(400).json({message: message});
    }
    
    // Only updated accepted fields
    const toUpdate = {};
    const updateableFields = ['title', 'content'];

    updateableFields.forEach(field =>{
      if (field in req.body) {
        toUpdate[field] = req.body[field];
      }
    });
    
    // Update the entry
    BlogPost
      .findByIdAndUpdate(req.params.id, {$set: toUpdate})
      .then(blogpost => res.status(200).json(blogpost.serializeNoComments()))
      .catch(err => res.status(500).json({message: 'Internal server error'}));
  });
  
  // DELETE /posts/:id
  app.delete('/posts/:id', (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
    .then(blogpost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
  });

  // GET authors
  app.get('/authors', (req, res)=> {
    Author
      .find()
      .limit(10)
      .then(author => {
        res.json({
          authors: author.map(
            (author) => author.serialize())
        });
      })
      .catch(
        err => {
          console.error(err);
          res.status(500).json({message: 'Internal server error'});
        });
  });
  
  // GET authors/:id
  app.get('/authors/:id', (req, res) => {
    Author
      .findById(req.params.id)
      .then(author => res.json(author.serialize()))
      .catch( err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });

  // GET authors/:userName
  app.get('/authors/userName/:userName', (req, res) => {
    Author
      .findOne({userName: req.params.userName})
      .then(author => res.json(author.serialize()))
      .catch(err => {
        res.status(500).json({message: 'Internal server error'});
      });
  });

  // CREATE author
  app.post('/authors', (req, res) => {
    // Verify required fields
    const requiredFields = ['firstName', 'lastName', 'userName'];
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if(!(field in req.body)) {
        const message = `Missing\`${field}\` in request body`;
        console.error(message);
        return res.status(400).send(message);
      }
    }
  
    Author.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName
    })
      .then(author => res.status(201).json(author.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });
  
  // UPDATE author
  app.put('/authors/:id', (req,res) => {
    // Confirm params & body id fields match
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      const message = 
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`;
      console.error(message);
      return res.status(400).json({message: message});
    }
    
    // Only update accepted fields
    const toUpdate = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];
    
    // Set fields to update
    updateableFields.forEach(field => {
      if (field in req.body) {
        toUpdate[field] = req.body[field];
      }
    });
    
    // Update the author
    Author
      .findByIdAndUpdate(req.params.id, {$set: toUpdate})
      .then(author => res.status(200).json(author.serialize()))
      .catch(err => res.status(500).json({message: 'Internal server error'}));
  });
  
  // DELETE author
  app.delete('/authors/:id', (req, res) => {
    // Delete the author's posts
    BlogPost.deleteMany({author: req.params.id}, err => {
      if (err) return res.status(500).json({message: 'Internal server error'});
    });
    
    // Delete the author
    Author.findByIdAndRemove(req.params.id)
    .then(author => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
  });

  // Catch all for non-existent endpoints
  app.use('*', (req, res) => {
    res.status(404).json({message: 'Not found'});
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