const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const userExists = users.some(user => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
  
    res.status(201).json({ message: "User registered successfully" });
  });
  

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const response = await axios.get('http://localhost:5000/booksdb');
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });
  public_users.get('/booksdb', function (req, res) {
    res.status(200).json(books);
  });

  public_users.get('/booksdb/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });
  
// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
  
    try {
      const response = await axios.get(`http://localhost:5000/booksdb/${isbn}`);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(404).json({ message: "Book not found", error: error.message });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
  
    Object.keys(books).forEach((isbn) => {
      if (books[isbn].author === author) {
        matchingBooks.push(books[isbn]);
      }
    });
  
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found for the given author" });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const matchingBooks = Object.values(books).filter(book => book.title === title);
  
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found for the given title" });
    }
  });

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "Book not found for the given ISBN" });
    }
  });

module.exports.general = public_users;
