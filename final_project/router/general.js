const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let doesExist = require("./auth_users.js").doesExist;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(403).json({
      message: "Unable to register"
    });
  }

  if (!isValid(username)) {
    res.status(404).json({
      message: "Username is invalid!"
    });
  }

  if (doesExist(username)) {
    res.status(403).json({
      message: "User already exists!"
    });
  }

  users.push({
    "username":username,
    "password":password
  });
  return res.status(200).json({message: "User successfully registred. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    let book = books[isbn];

    if (!book) {
      reject(`Unable to find book with isbn: ${isbn}`);
    }
    resolve(JSON.stringify(book, null, 4))
  });

  promise.then((response) => {
    res.send(response)
  })
  .catch((error) => {
    res.send(error);
  })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const author = req.params.author;
    let result = [];
    
    for (let key in books)  {
      let book = books[key];
      if (book.author === author) {
        result.push(book);
      }
    }
    resolve(JSON.stringify(result, null, 4));
  });

  promise.then(response => {
    res.send(response);
  })
  .catch((error) => {
    res.send(error);
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let promise = new Promise((resolve, reject) => {
    const title = req.params.title;
    let result = [];
    
    for (let key in books)  {
      let book = books[key];
      if (book.title === title) {
        result.push(book);
      }
    }
    resolve(JSON.stringify(result, null, 4));
  });

  promise.then(response => {
    res.send(response);
  })
  .catch((error) => {
    res.send(error);
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let book = books[isbn];

  if (!book) {
    res.send(`Unable to find book with isbn: ${isbn}`);
  }

  res.send(JSON.stringify(book.reviews, null, 4));
});

module.exports.general = public_users;
