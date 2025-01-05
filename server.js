const path = require("path");
const express = require("express");
const cookieSession = require("cookie-session");
const db = require("./db/database");

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);

const apiRoutes = require("./routes/apiRoutes");
const userRoutes = require("./routes/userRoutes");

// /api/endpoints
app.use("/api", apiRoutes);

// /user/endpoints
app.use("/users", userRoutes);

app.get("/test", (req, res) => {
  res.send("🤗");
});

app.get("/test-email", (req, res) => {
  db.getUserWithEmail("test@example.com")
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get('/test-id', (req, res) => {
  db.getUserWithId(1004).then(user => {
    if (user) {
      res.json(user); // Send back the user object
    } else {
      res.status(404).send('User not found');
    }
  }).catch(err => {
    console.error('Error fetching user by ID:', err);
    res.status(500).send('Internal server error');
  });
});

app.get('/test-add-user', (req, res) => {
  const newUser = { 
    name: "New User", 
    email: "newuser@example.com", 
    password: "password123" 
  };
  db.addUser(newUser).then(user => {
    res.json(user); // Send back the newly created user object
}).catch(err => {
    console.error('Error adding user:', err);
    res.status(500).send('Internal server error');
  });
});

app.listen(port, (err) => {
  console.log(err || `listening on port ${port} 😎`);
});
