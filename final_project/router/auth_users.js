const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const secretKey = 'your-secret-key'; // Should use env var in real apps

const isValid = (username) => {
  return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  // Optional: store in session if using express-session
  req.session.authorization = { accessToken };

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Expected to be 1–10
    const review = req.query.review;
    const username = req.session?.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review query param is required" });
    }
  
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    book.reviews[username] = review;
  
    return res.status(200).json({
      message: "Review added/updated successfully",
      book: {
        title: book.title,
        author: book.author,
        reviews: book.reviews
      }
    });
  });
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
