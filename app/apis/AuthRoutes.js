var jwt = require('jsonwebtoken');
var User = require('../models/user');
var cookie = require('cookie-parser');
var config = require('../../config');

module.exports = function(express){
  var apiRouter = express.Router();

  apiRouter.route('/signup')
    .get(function(req,res){
      res.render('Signup');
    })
    .post(function(req,res){
      var user = new User({
        email: req.body.email,
        username: req.body.username,
        password : req.body.password,
        name: req.body.name,
        bio: req.body.bio,
        //Role: 'user',
        imageURL: req.body.imageURL || '',
          Social: {
              FaceBook:req.body.facebook || '',
              Twitter: req.body.twitter || '',
              WebSite: req.body.website || '',
              LinkedIn: req.body.linkedin ||  '',
              YouTube : req.body.youtube || ''
          }
      });
      user.save(function(err){
        if(err){
          return res.status(406).json({message: 'can\'t save user because of '+err});
        }

        var token = jwt.sign(user,config.superSecret,{
          //expiresIn: '24 days'
            expiresIn: '24 days'
            
        });
        res.cookie('token',token) ;
        /*user.password = null;
        localStorage.user = user;*/
        res.json({message:'user with name : '+user.name+' Added'});
      });
    });


    apiRouter.route('/login')
              .get(function(req,res){
                var token = req.cookies.token;
                if(!token){
                  //res.render('login');
                  res.json('as login page');
                }
                res.redirect('/');
              })
              .post(function(req,res){
                  var jsob;
                if(req.body.username.indexOf('@') === -1) {

                    jsob={
                        username:req.body.username
                    }
                }else{

                    jsob={
                        email:req.body.username
                    }
                }
                User.findOne(jsob).select('email password name bio Role imageURL username Social').exec(function(err,user){
                  if(!user){
                    return res.status(404).json({message: 'User not found.'});
                  }

                  if(!user.comparePassword(req.body.password)){
                    return res.status(406).json({message: 'Wrong Password'});
                  }
                  var token = jwt.sign(user,config.superSecret,{
                    expiresIn: '24 days'
                  });
                  res.cookie('token',token,{httpOnly:true}) ;
                  user.password = null;
                  res.cookie('decoded',{_doc:user},{httpOnly:true});
                  return res.json({message: 'LoggedIn'});// replaced with redirect
                });
              });

    apiRouter.route('/logout')
        .get(function(req,res){
        res.clearCookie('token');
        res.clearCookie('decoded');
        res.clearCookie({});
        res.json({message: 'LoggedOut'});
    });

  apiRouter.use(function(req,res,next){
    if(!req.cookies.token){
      res.redirect('/login');
    }
    jwt.verify(req.cookies.token,config.superSecret,function(err,decoded){
      req.decoded = decoded;
      next();
    });
  });

    apiRouter.get('/profile',function(req,res){
        res.json({user: req.decoded._doc});
    });
  apiRouter.get('/',function(req,res){
    res.json(req.decoded);
  });


  apiRouter.post('/changedetails',function(req,res){

    User.findOne({email:req.decoded._doc.email},function(err,user){
      if(err) res.status(400).json({message: 'user not found'});
      user.password = req.body.password || req.decoded._doc.password;
      user.name = req.body.name || req.decoded._doc.name;
      user.bio = req.body.bio || req.decoded._doc.bio;
      user.Role = req.decoded._doc.Role;
      user.imageURL= req.body.imageURL || req.decoded._doc.imageURL;
      user.save(function(err){
        if(err){
          res.status(400).json({message: 'Wrong thing'});
        }
        user.password = null;
        res.cookie('decoded',{_doc:user},{httpOnly:true});
        res.json({message:'updated !!'});

        });
      });
    });
    /*
    User.findOneAndUpdate({email:req.decoded._doc.email},{$set:{
      password : req.body.password || req.decoded._doc.password,
      name: req.body.name || req.decoded._doc.name,
      bio: req.body.bio || req.decoded._doc.bio,
      Role: req.decoded._doc.Role,
      imageURL: req.body.imageURL || req.decoded._doc.imageURL
    }},function(err){
      if(err){
        console.log(err);
        return;
      }
      res.json({message:'updated !!'});
    });

*/
  //Admin middleware
  apiRouter.use(function(req,res,next){
    if(req.decoded._doc.Role == "admin"){
      return next();
    }
    return res.redirect('/');
  });

  apiRouter.post('/changerole',function(req,res){
   User.findOneAndUpdate({username: req.body.username},{$set:{Role:req.body.Role}},function(err){
     if(err){
       console.log(err);
       res.status(400).json({message: 'error'});
       return;
     }
     res.json({message:'Updated'});
   })
  });

  apiRouter.get('/AllUsers',function(req,res){
    User.find({},function(err,users){
        if(err) throw err;
        res.cookie('users',users,{httpOnly:true});
        res.json({users: users});
    });
  });


    return apiRouter;
};
