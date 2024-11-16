const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const booksArr = Object.values(books);

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!(username || password)) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });

  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

const getBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 2));
  } catch (error) {
    return res.status(500).send("Error fetching books");
  }
});

const getBookByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = booksArr.find((book) => book.isbn === isbn);
  
      if (!book) {
        return reject(new Error(`Book with ISBN "${isbn}" not found.`));
      }
  
      resolve(book);
    });
  };
  
  // Get book details based on ISBN
  public_users.get("/isbn/:isbn", async function (req, res) {
    const { isbn } = req.params;
  
    try {
      const book = await getBookByIsbn(isbn);
      return res.status(200).send(JSON.stringify(book, null, 2));
    } catch (error) {
      return res.status(404).send(error.message);
    }
  });
  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const booksByAuthor = booksArr.filter((book) => book.author === author);
  
      if (booksByAuthor.length === 0) {
        return reject(new Error(`No books found for author "${author}".`));
      }
  
      resolve(booksByAuthor);
    });
  };
  
  // Get book details based on author
  public_users.get("/author/:author", async function (req, res) {
    const { author } = req.params;
  
    try {
      const books = await getBooksByAuthor(author);
      return res.status(200).send(JSON.stringify(books, null, 2));
    } catch (error) {
      return res.status(404).send(error.message);
    }
  });
  
  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const booksByTitle = booksArr.filter((book) => book.title === title);
  
      if (booksByTitle.length === 0) {
        return reject(new Error(`No books found with the title "${title}".`));
      }
  
      resolve(booksByTitle);
    });
  };
  
  // Get all books based on title
  public_users.get("/title/:title", async function (req, res) {
    const { title } = req.params;
  
    try {
      const books = await getBooksByTitle(title);
      return res.status(200).send(JSON.stringify(books, null, 2));
    } catch (error) {
      return res.status(404).send(error.message);
    }
  });

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;

  const book = booksArr.find((book) => book.isbn === isbn);

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  }

  return res.status(404).send(`Book with isbn "${isbn}" not found.`);
});

module.exports.general = public_users;
