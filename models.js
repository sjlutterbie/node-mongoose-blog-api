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

// Instance methods
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
  }
  

  
// Create the model
const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost, Author };