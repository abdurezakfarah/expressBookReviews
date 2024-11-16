const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

const booksArr = Object.values(books);

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });

  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (!authenticatedUser(username, password)) {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }

  // Generate JWT access token
  let accessToken = jwt.sign(
    {
      data: password,
    },
    "access",
    { expiresIn: 60 * 60 }
  );

  // Store access token and username in session
  req.session.authorization = {
    accessToken,
    username,
  };
  return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username } = req.session.authorization;
  const { review } = req.body;
  const { isbn } = req.params;

  const book = booksArr.find((book) => book.isbn === isbn);

  if (!book) {
    return res.status(404).send(`Book with isbn "${isbn}" not found.`);
  }

  if (book.reviews[username]) {
    book.reviews[username] = review;
    return res.status(201).send("Review updated successfully.");
  }

  book.reviews[username] = review;
  return res.status(201).send("Review added successfully.");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
