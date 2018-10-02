"use strict";

const mongoose = require("mongoose");

// Define blog schema
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true },
  content: {type: String, required: true},
  author: {
      firstName: String,
      lastName: String
  },
  created: String
});

// Virtuals
  // authorName
  blogPostSchema.virtual("authorName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`;
  });

// Instance methods
  // .serialize()
  blogPostSchema.methods.serialize = function() {
    return {
      id: this._id,
      title: this.title,
      content: this.content,
      authorName: this.authorName,
      created: this.created
    };
  };
  

  
// Create the model
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost };