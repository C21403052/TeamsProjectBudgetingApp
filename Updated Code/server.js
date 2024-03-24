var express = require("express");
var session = require("express-session");
var bcrypt = require('bcrypt');
var bodyParser = require("body-parser");
var { Pool } = require("pg");
var path = require("path");
var app = express();
var saltRounds = 10;
var myPlaintextPassword = 'user_password';
//Will need to change this to your database details for postgres
//Aarons database
 var pool = new Pool({
     user: "postgres",
     host: "localhost",
     database: "postgres",
     password: "Sp00ky!",
     port: 54321,
   });

// Set up session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));
  

// Attempt to connect to the database
pool.connect()
  .then(() => {
    console.log('Connected to the database');
    // Start the Express server only if the database connection is successful
    startServer();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Function to start the Express server
function startServer() {
  // Parse JSON bodies for POST, PUT, and DELETE requests
  app.use(bodyParser.json());

  // Serve the HTML file
  app.get("/", authenticateUser, function (req, res) {
    res.sendFile(path.join(__dirname, "main.html"));
  });
  app.get("/transactions", authenticateUser, function (req, res) {
    res.sendFile(path.join(__dirname, "transactions.html"));
  });
  app.get("/income", authenticateUser, function (req, res) {
    res.sendFile(path.join(__dirname, "income.html"));
  });
  app.get("/spending", authenticateUser, function (req, res) {
    res.sendFile(path.join(__dirname, "spending.html"));
  });
  app.get("/savings", authenticateUser, function (req, res) {
    res.sendFile(path.join(__dirname, "savings.html"));
  });
  app.get("/settings", authenticateUser, function (req, res) {
    res.sendFile(path.join(__dirname, "settings.html"));
  });
  app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname, "login.html"));
  });
  app.get("/signup", function (req, res) {
    res.sendFile(path.join(__dirname, "SignUp.html"));
  });
  app.get("/add_transactions", authenticateUser, function (req, res) {
    res.sendFile(path.join(__dirname, "add_transactions.html"));
  });
  
  function authenticateUser(req, res, next) {
    // If the user is authenticated (user ID is stored in the session), proceed to the next middleware
    if (req.session.userId) {
      return next();
    } else {
      // If not authenticated, redirect to the login page or send an unauthorized response
      res.sendFile(path.join(__dirname, "login.html"));
    }
  }
  
  //route for logout of sessions and users
  app.get("/logout", async (req, res) => {
    try {
		const client = await pool.connect();
		
		//Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                res.status(500).send("Internal Server Error");
            } else {
                res.redirect("/login");
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  //needs to be edited for user table for app
  app.get("/Users", async function (req, res) {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM users");
      const Users = result.rows;
      client.release();
      res.send(Users);
    } catch (err) {
      console.error("Error fetching users data:", err);
      res.status(500).send(err);
    }
  });
 
 //edit for later
  // Define a route for fetching user data
app.get("/user", async function (req, res) {
    try {
        if (req.session.userId) {
            const client = await pool.connect();
            const result = await client.query("SELECT email FROM Users WHERE user_id = $1", [req.session.userId]);
            client.release();

            if (result.rows.length === 1) {
                const userEmail = result.rows[0].email;
                // Send the user's email in the response
                res.json({ userId: req.session.userId, userEmail: userEmail });
            } else {
                // Handle the case where the user is not found
                res.status(404).json({ error: "User not found" });
            }
        } else {
            // User is not logged in, send an empty response or an appropriate indicator
            res.json(null);
        }
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

  // Define a route for the /users endpoint in Express
  app.get("/users", async function (req, res) {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM users");
      const users = result.rows;
      client.release();
      res.send(users);
    } catch (err) {
      console.error("Error fetching users data:", err);
      res.status(500).send(err);
    }
  });

//Adding Transaction
app.post("/insert_transaction", async function (req, res) {
  try {
      const { user_id, category, name, price, receipt_image } = req.body;
      const client = await pool.connect();
      const result = await client.query(
          "INSERT INTO Transactions (user_id, category, name, price, receipt_image) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [user_id, category, name, price, receipt_image ]
      );
      client.release();
      const newTransaction = result.rows[0];
      res.send(newTransaction);
  } catch (err) {
      console.error("Error adding transaction:", err);
      res.status(500).send("Internal Server Error");
  }
});

app.post("/view_transaction", async function (req, res) {
  try {
    const { user_id, category, name, price, receipt_image } = req.body;
    const client = await pool.connect();
    const result = await client.query(
      "SELECT category, name, price FROM Transactions"
    );
    client.release();
    const transactions = result.rows; // Get all rows
    res.send(result.rows); // Send all rows as an array
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).send("Internal Server Error");
  }
});




//edit for adding users
  app.post("/Users", async function (req, res) {
    try {
      const { firstname, lastname, dob, email, password } = req.body;
      const client = await pool.connect();
      const result = await client.query(
        "INSERT INTO Users (firstname, lastname, dob, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [firstname, lastname, dob, email, password]
      );
      client.release();
      const newItem = result.rows[0];
      res.send(newItem);
    } catch (err) {
      console.error("Error adding new User:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  
  //Hash a password
  async function hashPassword(plainPassword) {
	  return new Promise((resolve, reject) => {
		  bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
			  if(err){
				  reject(err);
			  } else {
				  resolve(hash);
			  }
		  });
	  });
  }
  
  //Verify password
  async function verifyPassword(plainPassword, hashedPassword){
	  return new Promise((resolve, reject) => {
		  bcrypt.compare(plainPassword, hashedPassword, function(err, result){
			  if(err){
				  reject(err);
			  } else {
				  resolve(result);
			  }
		  });
	  });
  }

//edit after database
  //route for user sign up
  app.post("/register", async function (req, res) {
    try {
        const { firstname, lastname, dob, email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const client = await pool.connect();
        const result = await client.query(
            "INSERT INTO users (first_name, last_name, date_of_birth, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [firstname, lastname, dob, email, hashedPassword]
        );
        client.release();
        const newUser = result.rows[0];
        res.send(newUser);
    } catch (err) {
        console.error("Error registering new user:", err);
        res.status(500).send("Internal Server Error");
    }
});
  
  //route for user login
  app.post("/userlogin", async (req, res)=> {
	  try{
		  const { email, password} = req.body;
		  const client = await pool.connect();
		  const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
		  client.release();
		  if (result.rows.length === 1) {
			  const user = result.rows[0];
			  const isValidPassword = await verifyPassword(password, user.password);
              req.session.userId = user.user_id;
			if(isValidPassword) {
				res.json({isValidUser: true});

			} else {
				res.json({ isValidUser: false });
			}
		  } 
	  } catch (err) {
			  console.error("Error validating user login:", err);
			  res.status(500).json({ error: "Internal Server Error" });
		  }
	  });

  // Listen on port 8081 for Express
  app.listen(8081, function () {
    console.log("Server is running on port 8081");
  });
}
