const express = require("express");
const app = express();
var session = require("express-session");
const multer = require("multer");
const db = require("./models/db");
const UserModel = require("./models/User");
const TodoModel = require("./models/Todo");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "vinu",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static("views"));
app.use(express.static("uploads"));
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: multerStorage });
app.get("/", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  } else {
    res.render("home", { email: req.session.email });
  }
});
app.get("/index", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.render("index", { email: req.session.email });
});
app.get("/about", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.render("about", { email: req.session.email });
});
app.get("/contact", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.render("contact", { email: req.session.email });
});
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  var user = await UserModel.findOne({
    email: email,
    password: password,
  }).exec();
  console.log(user);
  if (user == null) {
    res.render("login", { error: "invalid username or password" });
  } else {
    req.session.isLoggedIn = true;
    req.session.email = user.email;
    res.redirect("/index");
  }
});
app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});
app.post("/signup", async (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  var user = await UserModel.find({ email: email }).exec();
  if (user == "") {
    user = { email: email, password: password };
    UserModel.create(user)
      .then(function () {
        res.redirect("login");
      })
      .catch(function (err) {
        res.render("signup", { error: err });
      });
  } else {
    res.render("signup", { error: "user exists.." });
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app.get("/readTask", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  TodoModel.find()
    .then(function (data) {
      res.status(200).send(data);
    })
    .catch(function (err) {
      console.log(err);
    });
});
app.post("/writeTask", upload.single("pic"), (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(401).send("Unauthorized");
    return;
  }
  task = req.body;
  task.pic = req.file.originalname;
  const tasks = {
    taskDescription: task.taskDescription,
    pic: task.pic,
    task_id: Date.now(),
    isCompleted: false,
  };
  TodoModel.create(tasks)
    .then(function () {
      res.render("index", { email: req.session.email });
    })
    .catch(function (err) {
      console.log(err);
    });
});
app.delete("/deleteTask", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  task = req.body;
  TodoModel.deleteOne({ task_id: task.task_id })
    .then(function () {
      res.status(200).send("ok");
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.put("/updateTask", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(401).send("Unauthorized");
    return;
  }
  task = req.body;
  TodoModel.updateOne(
    { task_id: task.task_id },
    { isCompleted: task.isCompleted }
  ).then(function () {
    res.status(200).send("ok");
  });
});

db.init()
  .then(function () {
    console.log("db connected");
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch(function (err) {
    console.log(err);
  });
