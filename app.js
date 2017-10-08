var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds")
var backend     = require('./backend.js')    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")
 
var url = "mongodb://henryEE:h831231@ds013475.mlab.com:13475/etc" || "mongodb://localhost/yelp_camp_v10";
mongoose.connect(url);



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.get('/traffic/:from/:to/:direction/:type',backend.getTraffic)
//app.get('/traffic/:from/:to/:direction',backend.getTraffic)
//V
//

app.use('/traffic/:from/:to/:direction',campgroundRoutes)

app.get('/info/:from',backend.getInfo)
app.get('/inter/:road',backend.getInter)
app.get('/inter/:road/:direction',backend.getInter)
app.get('/inter/',backend.getInter)
app.listen(process.env.PORT || 3000);
require('./query.js')
