var express= require('express');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookie = require('cookie-parser');
var mongoose = require('mongoose');
var config = require('./config');
var User = require('./app/models/user');
var Category = require('./app/models/category');
var Post = require('./app/models/post');
var authapi= require('./app/apis/AuthRoutes')(express);
var controlPanel= require('./Controllers/controlPanel')(express);


var app = express();

app.use(morgan('dev'));
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookie('JSLover'));
app.use('/api',authapi);
app.set('view engine','ejs');

mongoose.Promise = global.Promise;
mongoose.connect(config.database,function(err){
    if(err) console.log(err);
    console.log('MongoDB Connected');
});

////////////////callback to get Categories//////////////////
var cats = [];
function updateCategories(req,res,next){
    if(cats.length <= 0 ){
        Category.find({},function(err,cs){
            console.log('Again');
            if(err) throw err;
            cats = cs;
            return next();
        });
    }else{
        return next();
    }

}
app.use(function(req,res,next){
        Category.find({},function(err,cs){
            console.log('Again');
            if(err) throw err;
            cats = cs;
            return next();
        });
});


/////////////////////////////////
app.get('/',function(req,res){
    Post.find({},function(err,posts){
        if(err) throw err;
        posts = posts.reverse();
        return res.render('index',{posts : posts,cats: cats});
    });

});

app.get('/posts/:posturl',function(req,res){
    Post.findOneAndUpdate({posturl:req.params.posturl}, {$inc: {visitors:1}},function(err,post){
        User.findOne({username:post.Author},function(err,user){
           if(typeof req.cookies.decoded != "undefined" && req.cookies.decoded._doc.username == post.Author  ) {
               return res.render('singlePost',{post : post,user: user, cats: cats, editor:true});
           }else{
                return res.render('singlePost',{post : post,user: user, cats: cats,editor: false});
           }

        });

    });
});

app.get('/profile/:username',function(req,res){
    User.findOne({username:req.params.username},function(err,user){
        if(err) throw err;
        if(!user) {
            console.log('User not found');
            return;
        }

        Post.find({Author:user.username},function(err,posts){
            if(err) throw err;
            if(!posts){
                return res.send("No posts");
            }
            return res.render('profile',{user:user,cats: cats, posts : posts, show:false})
        });

    });

});

////////////////////////////Authe&Authar Area//////////////////////////////
app.use('/api',authapi);

app.get('/signup',function(req,res){
    if(!req.cookies.token){
        return res.render('signup',{cats: cats});
    }
    res.redirect('/profile');
});

app.get('/login',function(req,res){
    if(!req.cookies.token || !req.cookies.decoded){
        return res.render('login',{cats: cats});
    }

    //redirect to render
    res.redirect('/profile');
});


app.get('/logout',function(req,res){
    if(req.cookies.token){
      res.clearCookie('token');
      res.clearCookie('decoded');
    }
    return res.redirect('/login');
});




/////////////////////////////////

app.get('/category/:name',function(req,res){
    Post.find({category:req.params.name},function(err,posts){
        if(err) throw err;
        /*if(posts.length <=0 ){
            return res.redirect('/');
        }*/
        posts = posts.reverse();
        return res.render('index',{posts : posts,cats: cats,showTitle:true, word : req.params.name});
    });
});

app.get('/tags/:name',function(req,res){
    Post.find({tags:req.params.name},function(err,posts){
        if(err) throw err;
        if(posts.length <=0 ){
            return res.redirect('/');
        }
        posts = posts.reverse();
        return res.render('index',{posts : posts,cats: cats,showTitle:true, word : req.params.name});
    });
});

////////////////////////////End Authe&Authar Area//////////////////////////////


// isAuthenticated middleware
app.use(function(req,res,next){
    if(!req.cookies.token){
        return res.redirect('/login');
    }
    next();
});






app.use('/controlpanel',controlPanel);

app.get('/profile',function(req,res){
    Post.find({Author:req.cookies.decoded._doc.username},function(err,posts){
        if(err) throw err;
        return res.render('profile',{user:req.cookies.decoded._doc,cats: cats, posts : posts,show:true})
    });

});



app.listen(config.port,function(err){
    if(err) throw err;
    console.log('Connected On PORT %s',config.port);
});
