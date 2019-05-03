var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//get register
router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

//get login
router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});

//login user
router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login',failureFlash: 'Invalid Username/Password'}),
  function(req, res) {
  	req.flash('success','You have log in successfully!');
  	res.redirect('/');
  });

//get user name
router.get('/login',function(req,res){
res.render('index.jade',{username: req.user.username});
});

//register user
router.post('/register', upload.single('profileimage'),function(req,res,next){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;

	if(req.file){
		console.log('Uploading File....');
		var profileimage = req.file.filename;
	}else{
		console.log('No File Uploaded.');
		var profileimage = 'noimage.jpg';
	}

	//Form Validator
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('name','Email field is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('username','Username field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	
	//Check Error
	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors: errors
		});

	}else{
		var newUser = new User({
		 	name : name,
		 	email: email,
		 	username: username,
		 	password: password,
		 	profileimage: profileimage
		});
	

	User.createUser(newUser,function(err,user){
		if(err) throw err;
		console.log(user);
	});

	req.flash('success','You have successfully register!');
	res.location('/');
	res.redirect('/');
   }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username,password,done){
	User.getUserByUsername(username, function(err,user){
		if(err) throw err;
		if(!user){//if user does not exist
			return done(null,false,{message: 'User Does Not Exist'});
		}

	User.comparePassword(password, user.password, function(err, isMatch){
		if(err) return done(err);
		if(isMatch){//match user password return done
			return done(null,user);
		}else{
			return done(null, false, {message:'Wrong Password'});
			}
		});
	});
}));

router.get('/logout',function(req,res){
	req.logout();
	req.flash('/success','You have logged out.');
	res.redirect('/users/login');
})
module.exports = router;
