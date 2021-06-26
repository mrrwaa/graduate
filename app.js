// require('dotenv').config()
var express     = require("express"),
    app         = express(),
    translate = require('@vitalets/google-translate-api'),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    // cookieParser = require('cookie-parser'),
    User        = require("./models/user")


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// app.use(express.json());
// app.use(cookieParser());

mongoose.connect("mongodb://localhost/clerk" , {useNewUrlParser: true ,  useUnifiedTopology: true});

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "clerk",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req , res,next){
  res.locals.currentUser =req.user;
  next();
});
// console.log(req.user)
// const {OAuth2Client} = require('google-auth-library');
// const CLIENT_ID = '333642631602-h2l1m29lfb5c1d0dta76nvv4so4bjeo4.apps.googleusercontent.com'
// const client = new OAuth2Client(CLIENT_ID);



app.get("/",function (req,res) {
  res.render("home.ejs")
});

app.get("/useapp",function (req,res) {
  res.render("useapp.ejs")
});

app.get("/feature",function (req,res) {
  res.render("features.ejs")
});

//  translate
app.get('/translator',(req,res) => {
  res.render('translat',{title:"Speech Translator Online to Multiple Languages - Free Media Tools",translated:""})
})

app.post('/translator',(req,res) => {

  console.log(req.body.speech)

  translate(req.body.speech, {to: req.body.language}).then(response => {
    res.render('translat',{title:"Speech Translator Online to Multiple Languages - Free Media Tools",translated:response.text})
}).catch(err => {
    console.error(err);
});

})

app.get("/signup",function (req,res) {
  res.render("auth/register.ejs")
});

app.post("/signup", function(req, res){
  const newUser = new User({
    username: req.body.username ,
     email:req.body.email
    })
  User.register(newUser, req.body.password, function(err, user){
      if(err){
          console.log(err);
          return res.render('auth/register');
      }
      passport.authenticate("local")(req, res, function(){
         res.redirect("/");
      });
  });
});


// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
  res.render("auth/login.ejs");
});



//login logic
//middleware
app.post("/login", passport.authenticate("local", {
   successRedirect: "/",
   failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});


function isLoggedIn(req, res, next){
   if(req.isAuthenticated()){
       return next();
   }
   res.redirect("/login");
}


app.listen(3000,function () {
console.log("done");
})
