import express from "express";

const app = express();
app.use(express.json());

// DUMMY USERS DATA
let userDatabase = [
  {
    userId: 1,
    userName: "Akmal",
    userRole: "Admin",
    borrowedBooks: [],
  },
  {
    userId: 2,
    userName: "Jamal",
    userRole: "Member",
    borrowedBooks: [],
  },
];

// DUMMY BOOKS DATA
let bookDatabase = [
  {
    bookId: 1,
    bookName: "Matematika Kelas 12",
    bookStatus: "Ready",
    borrowerId: undefined,
    borrowerName: undefined,
  },
  {
    bookId: 2,
    bookName: "PKN Kelas 11",
    bookStatus: "Ready",
    borrowerId: undefined,
    borrowerName: undefined,
  },
];

// GET METHOD
/// GET ALL USERS
app.get("/library/users", function (req, res) {
  res.status(200).json({
    msg: "Get All Users Success",
    data: userDatabase,
  });
});
/// GET USER BY ID
app.get("/library/users/:id", function (req, res) {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  const userIndex = userDatabase.findIndex((user) => user.userId === idNum);

  res.status(200).json({
    msg: "Get User Success",
    data: userDatabase[userIndex],
  });
});
/// GET ALL BOOKS
app.get("/library/books", function (req, res) {
  res.status(200).json({
    msg: "Get All Books Success",
    data: bookDatabase,
  });
});
/// GET BOOK BY ID
app.get("/library/books/:id", function (req, res) {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  const bookIndex = bookDatabase.findIndex((book) => book.bookId === idNum);

  res.status(200).json({
    msg: "Get Book Success",
    data: bookDatabase[bookIndex],
  });
});

// POST METHOD
/// POST USER
app.post("/library/users", (req, res) => {
  const { name } = req.body;
  const { role } = req.body;

  userDatabase.push({
    userId: userDatabase.length + 1,
    userName: name,
    userRole: role,
    borrowedBooks: [],
  });

  res.status(201).json({
    msg: "User Successfully Created",
    data: userDatabase.at(-1),
  });
});
/// POST BOOK
app.post("/library/books", (req, res) => {
  const { name } = req.body;

  bookDatabase.push({
    bookId: bookDatabase.length + 1,
    bookName: name,
    bookStatus: "Ready",
    borrowerId: undefined,
    borrowerName: undefined,
  });

  res.status(201).json({
    msg: "Book Successfully Added",
    data: bookDatabase.at(-1),
  });
});

// PUT METHOD
/// EDIT USER
app.put("/library/users/:id", (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  const { name } = req.body;
  const { role } = req.body;

  // CEK APAKAH ID USER SUDAH ADA
  const userIndex = userDatabase.findIndex((user) => user.userId === idNum);
  if (userIndex !== -1) {
    const userData = userDatabase.find((user) => user.userId === idNum);
    const currentBorrowedBooks = userData.borrowedBooks;

    userDatabase[userIndex] = {
      userId: idNum ?? userData.userId,
      userName: name ?? userData.userName,
      userRole: role ?? userData.userRole,
      borrowedBook: currentBorrowedBooks,
    };

    res.status(200).json({
      msg: `User id: ${idNum} updated`,
      data: userDatabase[userIndex],
    });
  } else {
    res.status(404).json({
      msg: `User id: ${idNum} not found`,
    });
  }
});
/// EDIT BOOK
app.put("/library/books/:id", (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  const { name } = req.body;
  const { status } = req.body;

  // CEK APAKAH ID BUKU SUDAH ADA
  const bookIndex = bookDatabase.findIndex((book) => book.bookId === idNum);
  if (bookIndex !== -1) {
    const bookData = bookDatabase.find((book) => book.bookId === idNum);
    bookDatabase[bookIndex] = {
      bookId: idNum ?? bookData.bookId,
      bookName: name ?? bookData.bookName,
      bookStatus: status ?? bookData.bookStatus,
      borrowerId: bookData.borrowerId,
      borrowerName: bookData.borrowerName,
    };

    // UPDATE INFO PEMINJAM BUKU (USER) JIKA ADA
    const newBookData = bookDatabase.find((book) => book.bookId === idNum);
    if (newBookData.borrowerId != null && newBookData.borrowerName != null) {
      const userData = userDatabase.find(
        (user) => user.userId === newBookData.borrowerId
      );

      let filteredBookIndex = userData.borrowedBooks.indexOf(name);
      const filteredBorrowedBooks = userData.borrowedBooks;
      filteredBorrowedBooks.splice(filteredBookIndex, 1);
      filteredBorrowedBooks.push(newBookData.bookName);

      const userIndex = userDatabase.findIndex(
        (user) => user.userId === newBookData.borrowerId
      );
      userDatabase[userIndex] = {
        userId: userData.userId,
        userName: userData.userName,
        userRole: userData.userRole,
        borrowedBooks: filteredBorrowedBooks,
      };

      res.status(200).json({
        msg: `Book id: ${idNum} updated`,
        data: {
          bookInfo: bookDatabase[bookIndex],
          userInfo: userDatabase[userIndex],
        },
      });
    } else {
      res.status(200).json({
        msg: `Book id: ${idNum} updated`,
        data: bookDatabase[bookIndex],
      });
    }
  } else {
    res.status(404).json({
      msg: `Book id: ${idNum} not found`,
    });
  }
});
/// BORROW BOOK
app.put("/library/users/borrow/:id", (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  const { bookId } = req.body;

  const userIndex = userDatabase.findIndex((user) => user.userId === idNum);
  if (userIndex !== -1) {
    const bookIndex = bookDatabase.findIndex((book) => book.bookId === bookId);
    if (bookIndex !== -1) {
      const userData = userDatabase.find((user) => user.userId === idNum);
      const bookData = bookDatabase.find((book) => book.bookId === bookId);
      const currentBorrowedBooks = userData.borrowedBooks;
      currentBorrowedBooks.push(bookData.bookName);

      userDatabase[userIndex] = {
        userId: userData.userId,
        userName: userData.userName,
        userRole: userData.userRole,
        borrowedBooks: currentBorrowedBooks,
      };

      bookDatabase[bookIndex] = {
        bookId: bookData.bookId,
        bookName: bookData.bookName,
        bookStatus: "Borrowed",
        borrowerId: userData.userId,
        borrowerName: userData.userName,
      };

      res.status(200).json({
        msg: `Book successfully borrowed`,
        data: {
          userInfo: userDatabase[userIndex],
          bookInfo: bookDatabase[bookIndex],
        },
      });
    } else {
      res.status(404).json({
        msg: `Book id: ${idNum} not found`,
      });
    }
  } else {
    res.status(404).json({
      msg: `User id: ${idNum} not found`,
    });
  }
});

// DELETE METHOD
/// DELETE USER
app.delete("/library/users/:id", (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);

  const userIndex = userDatabase.findIndex((user) => user.userId === idNum);
  if (userIndex !== -1) {
    // UPDATE INFO BUKU JIKA ADA YANG DIPINJAM
    bookDatabase.forEach((book) => {
      if (book.borrowerId === idNum) {
        book.bookStatus = "Ready";
        book.borrowerId = undefined;
        book.borrowerName = undefined;
      }
    });

    userDatabase.splice(userIndex, 1);

    res.status(200).json({
      msg: `User id: ${idNum} successfully deleted`,
    });
  } else {
    res.status(404).json({
      msg: `User id: ${idNum} not found`,
    });
  }
});
/// DELETE BOOK
app.delete("/library/books/:id", (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);

  const bookIndex = bookDatabase.findIndex((book) => book.bookId === idNum);
  if (bookIndex !== -1) {
    // UPDATE INFO PEMINJAM BUKU (USER) JIKA ADA
    userDatabase.forEach((user) => {
      if (user.userId === bookDatabase[bookIndex].borrowerId) {
        let filteredBookIndex = user.borrowedBooks.indexOf(
          bookDatabase[bookIndex].bookName
        );
        user.borrowedBooks.splice(filteredBookIndex, 1);
      }
    });

    bookDatabase.splice(bookIndex, 1);

    res.status(200).json({
      msg: `Book id: ${idNum} successfully deleted`,
    });
  } else {
    res.status(404).json({
      msg: `Book id: ${idNum} not found`,
    });
  }
});

app.listen(5500, () =>
  console.log("Server running on http://localhost:5500/library")
);
