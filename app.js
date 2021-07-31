const { render } = require('ejs');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

const methodOverride=require('method-override');
const ejsMate=require('ejs-mate')
const {isLoggedin}=require("./views/middleware");


const { isAdmin } = require('./views/middleware');
const { isUser } = require('./views/middleware');




//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%            require model as User and Item
const User=require('./models/userModel');
const Item=require('./models/itemModel');  
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%       using flash,ejsMate,express and making public and views as public folder
const flash=require('connect-flash');
const app = express();
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(methodOverride('_method'));


const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.Currentuser=req.user;
    next();
})





//////////////////////////////////////////////////////////////////////////////////////    LOGIN


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%               redirests to register page(get request)
app.get('/register', async(req, res) => {
    res.render('register');
});
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%               redirests to login page
app.get('/login', async(req, res) => {
    res.render('login');
});
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%              post request from register form
app.post('/register', async(req, res) => {
    try{     //getting password and username from form
            const {username,password,reenterpassword}=req.body;
            
            const user=new User({username});
            if(password !== reenterpassword){
                req.flash('error','Passwords must be same');
                
                return  res.redirect('/register');
              }
              else{
                  //registering the password and username and redirecting to home page
                     const registeredUser= await User.register(user,password);
                     req.login(registeredUser,err=>{
                     if(err) return next(err);
                     });
                  
                     res.redirect('/home');
                 }
        }catch(e){
            req.flash('error','User already exists');
            return res.redirect('/register');
        }
});
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%              post request from register form
app.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req, res) => {
    
    res.redirect('/home');
});
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%              logout
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
})





///////////////////////////////////////////////////////////////////////////////////////  INNER LOGIN


app.use(methodOverride('_method'));
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%               get request(we render to home .ejs by sending all item and u
app.get('/home',isLoggedin, async(req, res) => {
    const item=await Item.find({});
    const user=req.user;
    res.render('home.ejs',{item,user});
})
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%               get request from home.ejs that brings product id as params 
app.get('/details/:id',isLoggedin, async(req, res) => {
    const {id}=req.params;
    const user=req.user;//current user
    const item=await Item.findById(id); //by using that id we are searching the item from db and store that object in item
    res.render('show.ejs',{item,user}); //passing that particular item and current user to show.ejs
})

//||||||||||||||||||||||||||||||||||||||                        ADD

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    get request from home.ejs and we render to add.ejs
app.get('/additem',isLoggedin,isAdmin, (req, res) => {
    const user=req.user;
    res.render('add.ejs',{user});
})
//%%%%%%%%%%%%%%%%%%%%%         post request from add.ejs that brings all detail of product ex:category,name,manu...etc
app.post('/additem',isLoggedin,isAdmin, async (req, res) => {
    const item = new Item(req.body);
    item.user=req.user._id;
    await item.save();
    res.redirect('/home');
})
   




//|||||||||||||||||||||||||||||||||||||||                       UPDATE
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  get request from show.ejs where we can take the selected product id from params
app.get('/updateitem/:id',isLoggedin,isAdmin,async(req,res)=>{
    const {id}=req.params;
    const item=await Item.findById(id);// storing the product object
    res.render('update.ejs',{item});//sending the items object to update.ejs so that we can enter the update details and send as PUT/POST REQUEST
})
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% geting a PUT POST REQUEST from show.ejs to update in home.ejs
app.put('/updateitem/:id',isLoggedin,isAdmin,async(req,res)=>{
    const {id}=req.params;
    const item=await Item.findByIdAndUpdate(id,req.body,{runValidators:true,new:true}) ;
    res.redirect('/home');
})

//||||||||||||||||||||||||||||||||||||||                        DELETE
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    delete request from show.ejs where we can take the selected product id from params                      
app.delete('/deleteitem/:id',isLoggedin,isAdmin,async(req,res)=>{
    const {id}=req.params;
    const item=await Item.findByIdAndDelete(id);
    res.redirect('/home');
})


//|||||||||||||||||||||||||||||||||||||                      ADDING BUY PRODUCT TO ARRAY
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%   geting a POST REQUEST from home.ejs and iam adding that product to current user array
app.post('/buy',isLoggedin,isUser, async(req, res) => {
    const itemId=req.body.itemid;
    await User.updateOne({ username: `${req.user.username}` }, { $push : {"userarr" : itemId}});
    res.redirect('/myBag');
})







app.get('/myBag',isLoggedin,isUser, async(req, res) => {
    let bagItem=[],s=0;
    const currentUser=await User.findById(req.user);
     try{
    for(let i of currentUser.userarr)
    {
        bagItem[s++]=await Item.findById(i);
    }
 }catch(e){
     res.send("nothing added to My bag");
 }
    res.render('myBag',{bagItem});
})

app.delete('/deleteBag/:id',isLoggedin,isUser,async(req,res)=>{
    const {id}=req.params;
    await User.updateOne({username: `${req.user.username}`}, {$pull: { userarr: id }});
    res.redirect('/myBag');
})







// app.get('/home', isLoggedin,(req, res) => {
//     const user=req.user;
//      res.render('home.ejs',{user});
//  });

app.listen(3000,() => {
    console.log('Listening to port 3000!!!!!')
})

