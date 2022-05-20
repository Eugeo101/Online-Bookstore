if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
/*express code*/
// https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUtg3o4aAQ50ay4yFoos1TinQOGFscaHiCFA&usqp=CAU
const express = require("express"); //include express
const app = express(); // make server

/*compression & helmet*/
const comp = require("compression");
const helmet = require("helmet");
const { join } = require("path");

/*express-validator*/
const { body, validationResult } = require("express-validator"); //using express-validator

/*cors for cross-orgin request*/
const cors = require("cors");
app.use(cors());
app.use(comp());
app.use(helmet.xssFilter());

/*post request code*/
// const bodyParser = require("body-parser"); //body parser for req.body
// app.use(bodyParser.urlencoded()); //to make req.body not undefined
app.use(express.json()); //for cross orgin and bodyparsser
/*pug-viewEngine*/
app.use(express.static("public"));

/*mongoe data-base*/
const mongoose = require("mongoose"); //to include mongoose data base
const { MongoServerSelectionError } = require("mongodb");
// const { contentSecurityPolicy } = require("helmet");
mongodbURL = process.env.MONGO_URI;
mongoose.connect(mongodbURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}); // to make data base if not found
const db = mongoose.connection; // to make object

db.on("error", (err) => {
  // console.log("\n\n\n");
  console.log(err);
  // console.log("\n\n\n");
}); //to check error
// port = 3000;
db.on("open", () => {
  let port = process.env.PORT || 3000;
  // console.log(`\n\n\n${port}\n\n\n`);
  console.log("DataBase is Running ...");
  app.listen(port, () => {
    console.log("Server is Running ...");
  });
});
/*book*/
const bookSchema = new mongoose.Schema({
  URRL: String,
  title: String,
  authorName: String,
  amount: String,
  price: String,
  //<button>
});
const Book = mongoose.model("Book", bookSchema);

/*users database*/
const userSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  cart: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
      counter: Number,
    },
  ],
  //so i can use populate()
});
const User = mongoose.model("User", userSchema);

/*validation*/

//login validation

// const array = [
//   body("username")
//     .not()
//     .isEmpty()
//     .withMessage("Username should not be Empty")
//     .trim()
//     .escape()
//     .custom((value, { req }) => {
//       if (value == "") {
//         throw new Error("Don't put spaces only in username");
//       } else {
//         return true;
//       }
//     }),
//   body("password")
//     .not()
//     .isEmpty()
//     .withMessage("Password should not be Empty")
//     .trim()
//     .escape()
//     .custom((value, { req }) => {
//       if (value == "") {
//         throw new Error("Don't put spaces only in password");
//       } else {
//         return true;
//       }
//     }),
// ];

// const handler = (req, res, next) => {
//   const err = validationResult(req);
//   if (!err.isEmpty()) {
//     next(err);
//   }
//   next();
// };

//add validation

// const array2 = [
//   body("URRL")
//     .not()
//     .isEmpty()
//     .withMessage("URL should Not Be Empty")
//     .trim()
//     .custom((value, { req }) => {
//       if (value == "") {
//         throw new Error("Don't put spaces only in URL Address");
//       } else {
//         return true;
//       }
//     }),
//   body("title")
//     .not()
//     .isEmpty()
//     .withMessage("Book Title should Not Be Empty")
//     .trim()
//     .escape()
//     .custom((value, { req }) => {
//       if (value == "") {
//         throw new Error("Don't put spaces only in Book Title");
//       } else {
//         return true;
//       }
//     }),
//   body("authorName")
//     .not()
//     .isEmpty()
//     .withMessage("Author Name should Not Be Empty")
//     .trim()
//     .escape()
//     .custom((value, { req }) => {
//       if (value == "") {
//         throw new Error("Don't put spaces only in Author Name");
//       } else {
//         return true;
//       }
//     }),
//   body("amount")
//     .not()
//     .isEmpty()
//     .withMessage("Amount should Not Be Empty")
//     .trim()
//     .isNumeric()
//     .withMessage("Amount should Be Numeric only")
//     .escape()
//     .custom((value, { req }) => {
//       if (value == "") {
//         throw new Error("Don't put spaces only in Amount");
//       } else {
//         return true;
//       }
//     }),
//   body("price")
//     .not()
//     .isEmpty()
//     .withMessage("Price should Not Be Empty")
//     .trim()
//     .isNumeric()
//     .withMessage("Price should Be Numeric only")
//     .escape()
//     .custom((value, { req }) => {
//       if (value == "") {
//         throw new Error("Don't put spaces only in Price");
//       } else {
//         return true;
//       }
//     }),
// ];

// const handler2 = (req, res, next) => {
//   const err = validationResult(req);
//   // console.log("167");
//   if (!err.isEmpty()) {
//     // console.log(err.array());
//     next(err);
//   }
//   next();
// };
// let errorDetails = "";

/**********************************************************Server Code************************************************************/

/*1-login:*/
//login as admin
// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "public", "index.html"));
// });

app.get("/get-books", (req, res) => {
  Book.find({}, (err, books) => {
    res.send(books);
  });
});

/*2-admin:*/
//admin authorized
app.post("/admin", (req, res) => {
  // console.log("please admin run");
  const { username, password } = req.body;
  //console.log(req.body);
  if (username == "Admin" && password == "123") {
    res.send({ isAdmin: true });
  } //send to front end
  else {
    res.send({ isAdmin: false }); //send to front end
  }
});
//admin add book
app.post("/add-book", (req, res) => {
  const { URRL, authorName, title, price, amount } = req.body;
  // console.log("we get it from frontend");
  const newBook = new Book({
    URRL,
    authorName,
    title,
    price,
    amount,
  });
  newBook.save((err, result) => {
    if (err) {
      console.log(err);
    }
    Book.find({}, (err, books) => {
      res.send(books);
    });
  });
});

/*3-user*/
//signup as user

app.post("/users", (req, res) => {
  // console.log("hi i'm User");
  const { username, password } = req.body;
  const newUser = new User({
    username,
    password,
  });
  let isUser = false;

  //for signup a new user
  User.find({}, (err, users) => {
    if (err) {
      console.log(err);
    }
    // email already esist
    users.forEach((element) => {
      if (element.username == username && element.password == password) {
        //email exsist
        //send without saving on dataBase

        isUser = true; // i found him
        // console.log("276");
        // console.log(isUser);
        res.send({ isUser, newUser });
      }
    });
    //if new user save it
    if (!isUser) {
      newUser.save((err, result) => {
        if (err) {
          console.log(err);
        }
        res.send({ isUser, newUser }); //to send id of user to front end
      });
    }
  });
});

//login as user
app.post("/loginUser", (req, res) => {
  const { username, password } = req.body;
  //for login
  // user: fefe pass: 123
  // user: fofa pass: 456
  //if i typed fefe and 456 then who is correct? pass or username??? so:
  // i will check using username then if pass is here okey if not faks

  //find the user if he is there
  let isUsername = false;
  let isPassword = false;
  User.find({}, (err, users) => {
    if (err) {
      console.log(err);
    }
    let index = "";
    let xuser = "";
    users.forEach((element) => {
      //found username
      if (element.username == username) {
        isUsername = true;
        if (element.password == password) {
          isPassword = true;
        }
      }
      if (isUsername == true && isPassword == true) {
        xuser = element;
      }
    });
    //exsist
    if (isUsername == true && isPassword == true) {
      // console.log(xuser);
      res.send({ isUsername, isPassword, xuser });
    } else {
      //dont exsist
      res.send({ isUsername, isPassword });
    }
  });
});
//get cart
app.post("/get-cart", (req, res) => {
  const { _id } = req.body;
  User.findById(_id, (err, result) => {
    // console.log("322");
    User.populate(result, { path: "cart._id" }, (err, user) => {
      if (err) console.log(err);
      let sum = 0;
      for (let i = 0; i < user.cart.length; i++) {
        console.log(`\n\n\n${user.cart[i]._id}\n\n\n`);
        sum = sum + user.cart[i]._id.price * user.cart[i].counter;
      }
      res.send({ cart: user.cart, sum });
    });
  });
});
//add book
app.post("/addCartBook", (req, res) => {
  //console.log("hi book added");
  const { bookId, userId } = req.body; //bookID
  User.findById(userId, (err, user) => {
    const newCart = { _id: bookId, counter: 1 };
    const index = user.cart.findIndex((book) => {
      return bookId == book._id;
    });
    Book.findById(bookId, (err, mybook) => {
      if (err) {
        console.log(err);
      }
      mybook.amount = mybook.amount * 1 - 1;
      //handle if amount is equal to zero
      // if (mybook.amount == 0){

      // }
      mybook.save((err, result) => {
        if (err) {
          console.log(err);
        }
        if (index == -1) {
          user.cart.push(newCart);
        } else {
          user.cart[index].counter = user.cart[index].counter * 1 + 1;
        }
        user.save((err, result) => {
          if (err) {
            console.log(err);
          }
          // res.send(user);
          //console.log(result);
          User.populate(result, { path: "cart._id" }, (err, user) => {
            //console.log(user);
            user.password = undefined;
            Book.find({}, (err, books) => {
              let sum = 0;
              for (let i = 0; i < user.cart.length; i++) {
                sum = sum + user.cart[i]._id.price * user.cart[i].counter;
              }
              const userAndBookS = { user, books, sum };
              res.send(userAndBookS); //user but cart is populated
            });
          });
        });
      });
    });
  });
});
//delete book
app.post("/removeCartBook", (req, res) => {
  const { bookId, userId } = req.body;
  //console.log("hello please print");
  User.findById(userId, (err, user) => {
    const index = user.cart.findIndex((book) => {
      return bookId == book._id;
    });
    Book.findById(bookId, (err, mybook) => {
      if (err) {
        console.log(err);
      }
      if (index != -1) {
        user.cart[index].counter = user.cart[index].counter * 1 - 1;
        mybook.amount = mybook.amount * 1 + 1;
        if (user.cart[index].counter == 0) {
          user.cart.splice(index, 1);
        }
      }
      mybook.save((err, result) => {
        if (err) {
          console.log(err);
        }
        Book.find({}, (er, books) => {
          user.save((err, user) => {
            if (err) console.log(err);
            User.populate(user, { path: "cart._id" }, (err, user) => {
              user.password = undefined;
              let sum = 0;
              for (let i = 0; i < user.cart.length; i++) {
                sum = sum + user.cart[i]._id.price * user.cart[i].counter;
              }
              const userAndBookS = { user, books, sum };
              res.send(userAndBookS);
            });
          });
        });
      });
    });
  });
});

//delete book
app.post("/delete", (req, res) => {
  //console.log("please help");
  const { _id } = req.body; //if dev is clicked delete it
  Book.findByIdAndDelete(_id, (err, book) => {
    if (err) {
      console.log(err);
    }
  });
  Book.find({}, (err, books) => {
    res.send(books);
  });
});
//paid so delete cart
app.post("/deletecart", (req, res) => {
  // console.log("what 426");
  const { _id } = req.body;
  // console.log(_id);
  User.findById(_id, (err, user) => {
    if (err) {
      console.log(err);
    }
    user.cart.splice(0, user.cart.length);
    // console.log("what 433");
    user.save((err, user) => {
      if (err) console.log(err);
    });
  });
  User.find({}, (err, users) => {
    res.send(users);
  });
});
app.use((req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});
/*4-error handling*/

// app.get("/error", (req, res) => {
//   let errorFlag = true;
//   let ErrorDetails = { errorDetails, errorFlag };
//   console.log("hey 364");
//   console.log(errorDetails);
//   res.status(422).send(ErrorDetails);
// });

// app.use((error, req, res, next) => {
//   // console.log("hey 370");
//   const arr = error.array();
//   const errorArr = arr.map((element) => {
//     // console.log(element.msg);
//     return element.msg;
//   });
//   errorDetails = errorArr;
// });
