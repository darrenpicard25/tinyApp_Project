const express = require('express');
const app = express();
const PORT = 8080; //this is default port
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

function generateRandomString() {
  let output = '';
  const choices = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i =1; i <= 6; i++) {
    let letter = choices[Math.floor(Math.random()*choices.length)];
    output += letter;
  }
  return output;
}
//Our Data
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Root Page But not set up
app.get("/", (req, res) => {
  res.send('hello');
});
//Main urls Page
app.get("/urls" , (req, res) => {
  let templateData = { urls: urlDatabase};
  res.render("urls_index", templateData);
});

app.post("/urls/delete", (req, res) => {
  delete urlDatabase[req.body.id];
  res.redirect("/urls");
});

//Just looks at our database no link to page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Page with form to add new URL
app.get("/urls/new", (req, res) => {
  let templateData = { urls: urlDatabase};
  res.render("urls_new", templateData);
});
//Post to page from the form
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect(`urls/${shortURL}`);
});

//Look at details of each URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post('/edit/:id' , (req, res)=> {
  id =req.params.id;
  console.log(req.body);
  newURL =req.body.newURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

//Redirect to actual Page
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

