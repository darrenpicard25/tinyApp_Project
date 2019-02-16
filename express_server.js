//Requiring all my modules
const cookieSession = require('cookie-session');
const express = require('express');
const app = express();
const PORT = 8080; //this is default port
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

//Setting up App to use Cookie Session and body Parser and EJS
app.use(cookieSession({
  name: 'session',
  keys: ['ihatecookies4life'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//All functions used in the Server
function generateRandomString() {
  let output = '';
  const choices = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i =1; i <= 6; i++) {
    let letter = choices[Math.floor(Math.random()*choices.length)];
    output += letter;
  }
  return output;
}
function doesEmailAlreadyExist (checkEmail) {
  let userID;
  for (const id in users) {
    userID =id;
    if (users[id].email === checkEmail) {
      return userID;
    }
  }
  return '';
}
function urlsForUser(id) {
  outputURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      outputURLs[url] = urlDatabase[url].longURL;
    }
  }
  return outputURLs;
}
//Our DataBases
let urlDatabase = { };
let users = { };
/*

All the server Logic
*/
app.get("/" , (req, res) => {
    let templateData = {
    urls: urlDatabase,
    username: users[req.session.user_id]
  };
  if (users[req.session.user_id]) {
    res.render("/urls",templateVars);
  } else {
    res.redirect("/login");
  }
});
//Registration Pages
app.get("/register", (req, res) => {
  let templateData = { urls: urlDatabase, username: users[req.session.user_id]};
  res.render('urls_register', templateData);
});
app.post('/register', (req, res) => {
  const email = req.body.email;
  let id = doesEmailAlreadyExist(email);
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email && password && !id) {
    id = generateRandomString();
    users[id] = {
      id,
      email,
      password,
    };
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.redirect('/error');
  }
});
//Login Pages
app.get('/login', (req, res) => {
  let templateData = { urls: urlsForUser(req.session.user_id) , username: users[req.session.user_id]};
  res.render('ulrs_login', templateData);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = doesEmailAlreadyExist(email);
  if (id && email === users[id].email && bcrypt.compareSync(password, users[id].password)) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.redirect('/error');
  }
});
//Log out button Page
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});
//Main urls Page
app.get("/urls" , (req, res) => {
  let templateData = { urls: urlsForUser(req.session.user_id) , username: users[req.session.user_id]};
  res.render("urls_index", templateData);
});
//Post to page from the form
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id};
    res.redirect(`urls`);
});
//Error Handling Page for incorrect passwords or other username password Errors
app.get('/error', (req, res) => {
  res.render('urls_errors');
});
//Delete URLs
app.post("/urls/delete", (req, res) => {
  let key = req.body.id;
  if (urlDatabase[key].userID === req.session.user_id) {
    delete urlDatabase[req.body.id];
  }
  res.redirect("/urls");
});
//Just looks at our database no link to page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Page with form to add new URL
app.get("/urls/new", (req, res) => {
  let templateData = { urls: urlsForUser(req.session.user_id) , username: users[req.session.user_id]};
  if (users[req.session.user_id]) {
    res.render("urls_new",templateData);
  } else {
    res.redirect("/login");
  }
});

//Look at details of each URL and Edit
app.get("/urls/:shortURL", (req, res) => {
    let templateData = {
      urls: urlsForUser(req.session.user_id) ,
      username: users[req.session.user_id]};

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: users[req.session.user_id]  };
  res.render("urls_show", templateVars);
});
app.post('/edit/:id' , (req, res) => {
  shortURL =req.params.id;
  newURL =req.body.newURL;
  urlDatabase[shortURL] = {longURL: newURL, userID: req.session.user_id};
  res.redirect('/urls');
});
//Redirect to actual Page
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//Start Listening to Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
