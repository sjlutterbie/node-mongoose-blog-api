"use strict";

const mongoose = require("mongoose");

// Define author schema
const authorSchema = mongoose.Schema ({
  firstName: String,
  lastName: String,
  userName: {
    type: String,
    required: true
  }
});

// Validation middleware to prevent duplicate userNames
  // Source: https://stackoverflow.com/questions/16882938/how-to-check-if-that-data-already-exist-in-the-database-during-update-mongoose
  
authorSchema.pre('save', function(next) {
  let self = this;
  Author.find({userName: self.userName}, function(err, docs) {
    if (!docs.length) {
      next();
    } else {
      console.log(`User \`${self.userName}\` already exists`);
      next(new Error('User already exists!'));
    }
  });
});

// Define comment schema
const commentSchema = mongoose.Schema ({
  content: String
});

// Define blog schema
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true },
  content: {type: String, required: true},
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
  comments: [commentSchema],
  created: String
});

// Virtuals
  // middleware to enable author virtuals
  blogPostSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
  });
  
  blogPostSchema.pre('find', function(next) {
    this.populate('author');
    next();
  });

  // authorName
  blogPostSchema.virtual("authorName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
  });
  
  authorSchema.virtual('authorName').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
  });

// Instance methods
  // BLOG POST
    // .serialize()
    blogPostSchema.methods.serialize = function() {
      return {
        id: this._id,
        title: this.title,
        content: this.content,
        authorName: this.authorName,
        comments: this.comments,
        created: this.created
      };
    };
    
    // .serializeNoComments()
    blogPostSchema.methods.serializeNoComments = function() {
      return {
        title: this.title,
        content: this.content,
        authorName: this.authorName,
        created: this.created
      };
    };
  
  // AUTHOR
  // .serialize()
    authorSchema.methods.serialize = function() {
      return {
        _id: this._id,
        name: this.authorName,
        userName: this.userName
      };
    };
  

  
// Create the model
const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost, Author };