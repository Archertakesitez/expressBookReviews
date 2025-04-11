const express = require('express');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'access';
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    // Check if username exists and is in users array
    return username && users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Check if username and password match any user in records
    return users.some(user => 
        user.username === username && 
        user.password === password
    );
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  
  if (!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }
  
  if (!isValid(username)){
    return res.status(400).json({message: "Invalid username"});
  }
  
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
        message: "Invalid username or password"
    });
  }

  const token = jwt.sign({username}, SECRET_KEY, {expiresIn: "1h"});
  
  // Store token in session
  req.session.authorization = {
    accessToken: token
  };

  return res.status(200).json({
    message: "Login successful", 
    token
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    if (!req.session.authorization) {
        return res.status(403).json({message: "User not authenticated"});
    }

    let token = req.session.authorization['accessToken'];
    
    jwt.verify(token, "access", (err, user) => {
        if (!err) {
            const isbn = req.params.isbn;
            const review = req.query.review;

            // Validate book exists
            if (!books[isbn]) {
                return res.status(404).json({ message: "Book not found" });
            }

            // Add/update review in the reviews object using username as key
            books[isbn].reviews[user.username] = review;

            return res.status(200).json({
                message: "Review added/updated successfully"
            });
        } else {
            return res.status(403).json({message: "User not authenticated"});
        }
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    if (!req.session.authorization) {
        return res.status(403).json({message: "User not authenticated"});
    }

    let token = req.session.authorization['accessToken'];
    
    jwt.verify(token, "access", (err, user) => {
        if (!err) {
            const isbn = req.params.isbn;

            // Validate book exists
            if (!books[isbn]) {
                return res.status(404).json({ message: "Book not found" });
            }

            // Check if user has a review to delete
            if (!books[isbn].reviews[user.username]) {
                return res.status(404).json({ message: "No review found for this user" });
            }

            // Delete the review
            delete books[isbn].reviews[user.username];

            return res.status(200).json({
                message: "Review deleted successfully"
            });
        } else {
            return res.status(403).json({message: "User not authenticated"});
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
