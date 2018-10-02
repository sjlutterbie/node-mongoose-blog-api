"use strict";

const mongoose = require("mongoose");

// Define blog schema
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true },
  content: {type: String, required: true},
  author: {type: String, required: true},
  created: String
});

// Instance methods
  // .serialize()
  blogPostSchema.methods.serialize = function() {
    return {
      id: this._id,
      title: this.title,
      content: this.content,
      author: this.author,
      created: this.created
    };
  };
  
// Create the model
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost };