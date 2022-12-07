const express    = require('express'),
      app        = express(),
      morgan     = require('morgan'),
      passport   = require('passport'),
      LocalStrategy =require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose'),
      bodyParser  = require('body-parser'),
      methodOverride  = require("method-override"),
      User       = require("./database/mongomodels/user.js"),
      request = require('request'),
      minify=require('harp-minify'),
      cheerio =require('cheerio'),
      find=require('cheerio-eq'),
      sq=require('./database/sqlmodels/scholar.js'),
      Forum = require("./database/mongomodels/forum.js");

      
      
      
      
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method")); 
app.use(require('express-session')({
    secret:"RSquare Corporation will be there soon",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(express.static(__dirname + '/styles'));
app.use(morgan('combined'));



//  isloggedIn function -- checking for user logged in using session



function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
//-----------------------------------------------------------------------------------------------
//login routes

//   Login routes using passport

//show sign up page
app.get("/signup",function(req,res){
    
   res.render("register",{CurrentUser:req.user});
});




// register route 
app.post("/register",function(req,res){

console.log(req.body);

    User.register(new User({ 
    fullname:req.body.name,
    username:req.body.id,  //email
    category:req.body.category,
    spass10:req.body.ssc,
    spass12:req.body.hsc,
    spassgrad:req.body.graduation,
    state:req.body.state,
    branch:req.body.branch,
    income:req.body.income}),req.body.password,function(err,user){
                if(err){
                    console.log(err);
                    return res.render("index");
                }
                passport.authenticate("local")(req,res,function(){
                      res.redirect("/");
                });
    });
 

 });
 
 // login route
app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/india"
}),function(req,res){


});
// logout route
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});



// -----------------------------------------------------------------------------------------------

app.get("/",function(req,res){
   res.render("index",{CurrentUser:req.user}); 
});



app.get("/scholarships",function(req,res){
    res.render("scholarships",{CurrentUser:req.user});
});

app.get("/viewscholarship",function(req,res){
    console.log(req.query);
    if(req.user){
    res.render("viewscholarship",{id:req.query.id,CurrentUser:req.user});    
    }else{
        res.render("viewscholarship",{id:req.query.id,CurrentUser:'idea'});
    }
    
    
});





// api's

// api's from scholarships table

app.get("/newsupdate",function(req,res){
    var temp="";
      var url="https://scholarships.gov.in/";
      request(url,function(err,response,html){
        if(!err)
        {
          var $ = cheerio.load(html);
          var a =$(".marquee").eq(0).text().trim();
          console.log(a);
          var jsonData = {};
          jsonData['data']=a;
          res.send(jsonData);  
        }
}); 



});

// get last for scholarships scholarships

app.get("/fourscholars",sq.fourscholar);

// get all scholarships
app.get("/allscholarships",sq.allscholar);

// get scholarships with respect to particular fields

app.get("/filterscholarships",sq.filterscholar);
// get scholarships by id
app.get("/getscholarshipbyid",sq.scholarshipbyid);

app.get("/dashboard",function(req,res){
    res.render("dashboard",{CurrentUser:req.user});
})

app.get("/chatbot",function(req,res){
    res.render("chatbot",{CurrentUser:req.user});
})

// forum api 
  // add questions
 
app.get("/addquestion",sq.addques);

// get answers
app.get("/postanswer",sq.addans);

// get all data with id
app.get("/getallforum",sq.getall);
// get all 
app.get("/getques",sq.getques);
//get all ans
app.get("/getans",sq.getans);


app.post("/uploaddata",sq.insert);






app.listen(process.env.PORT,process.env.IP,function(req,res){
    console.log("server started");
});