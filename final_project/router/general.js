const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  //Write your code here
  const {username, password} = req.body;
  if (!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }
  if (users.some(user => user.username === username)){
    return res.status(400).json({message: "Username already exists"});
  }
  users.push({username, password});
  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
  try {
    const fetchBooks = async () => {
      return books;
    };

    const booksList = await fetchBooks();
    res.send(JSON.stringify(booksList, null, 2));
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const getBookByISBN = async (isbn) => {
      return new Promise((resolve, reject) => {
        if (!books[isbn]) {
          reject(new Error("Book not found"));
        }
        resolve(books[isbn]);
      });
    };

    const book = await getBookByISBN(isbn);
    res.send(JSON.stringify(book, null, 2));
  } catch (error) {
    if (error.message === "Book not found") {
      res.status(404).json({ message: "Book not found" });
    } else {
      res.status(500).json({ message: "Error fetching book details" });
    }
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    
    const filteredBooks = async (author) => {
      return new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        if (filteredBooks.length === 0) {
          reject(new Error("No books found for this author"));
        }
        resolve(filteredBooks);
      });
    };

    const booksByAuthor = await filteredBooks(author);
    res.send(JSON.stringify(booksByAuthor, null, 2));
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  try {
  const title = req.params.title;
  const filteredBooks = async (title) => {
    return new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.title === title);
      if (filteredBooks.length === 0) {
        reject(new Error("No books found for this title"));
      }
      resolve(filteredBooks);
    });
  };
  const booksByTitle = await filteredBooks(title);
  res.send(JSON.stringify(booksByTitle, null, 2));
  } catch (error) {
    res.status(500).json({message: "Error fetching books by title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (!books[isbn]){
    return res.status(404).json({message: "Book not found"});
  }
  try{
    res.send(JSON.stringify(books[isbn].reviews, null, 2));
  } catch (error) {
    res.status(500).json({message: "Error fetching book reviews"});
  }
});

module.exports.general = public_users;
