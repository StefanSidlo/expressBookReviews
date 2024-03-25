const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return true;
}

const doesExist = (username) => {
  let users_with_username = users.filter((user) => user.username === username);
  return users_with_username.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let valid_users = users.filter((user) => user.username === username && user.password === password);
  return valid_users.length > 0;
}

// Check that user is logged in
regd_users.use("/auth", function auth(req, res, next) {
  if (!req.session.authorization) {
    return res.status(403).json({message: "User not logged in"});
  }

  token = req.session.authorization['accessToken'];
  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({message: "User not authenticated"});
    }
    req.user = user;
    next();
  });
});

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

  let accessToken = jwt.sign({
    data: password
  }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = {
    accessToken,username
  }

  return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization['username'];

  let book = books[isbn];
  if (!book) {
    return res.status(404).json({message: `Unable to find book with isbn: ${isbn}`});
  }

  book.reviews[username] = review;
  return res.status(200).json({message: `User ${username} added review to book with isbn ${isbn}`});
});

// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  let book = books[isbn];
  if (!book) {
    return res.status(404).json({message: `Unable to find book with isbn: ${isbn}`});
  }

  if (!book.reviews[username]) {
    return res.status(404).json({message: `There is no review from user ${username} to book with isbn: ${isbn}`});
  }


  book.reviews = Object.fromEntries(Object.entries(book.reviews).filter(([key]) => key !== username));
  
  return res.send(`Review of user ${username} to book with isbn ${isbn} was successsfuly deleted`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.doesExist = doesExist;
module.exports.users = users;
