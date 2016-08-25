var User = require('../app/models/user');
var Post = require('../app/models/post');
var Tag = require('../app/models/tag');
var Category = require('../app/models/category');

module.exports = function(express){
    var app = express.Router();
    app.get('/',function(req,res){
        if(req.cookies.decoded._doc.Role == "admin"){
            User.find({},function(err,users){
                res.render('ControlPanel',{user : req.cookies.decoded._doc, users : users});
            });
        }
        else{
            //TODO : Don't Allow Normal Users to see other users accounts
            res.render('ControlPanel',{user : req.cookies.decoded._doc});
        }
    });

    app.get('/users/edit',function(req,res){
        Category.find({},function(err,cats){
            res.render('edituser',{user:req.cookies.decoded._doc,cats: cats,isAdmin:(req.cookies.decoded._doc.Role == 'admin'? true: false)});
        });  
    });


    app.post('/users/edit',function(req,res){
    User.findOne({email:req.cookies.decoded._doc.email}).select('email password name bio Role ImageURL username Social').exec(function(err,user){
        if(err) res.status(400).json({message: 'user not found'});
         var pas = user.password;
        user.password = req.body.password || req.cookies.decoded._doc.password;
        if(user.password == null){
            user.password =   pas ;
        }
        user.name = req.body.name || req.cookies.decoded._doc.name;
        user.username = req.body.username || req.cookies.decoded._doc.username;
        user.bio = req.body.bio || req.cookies.decoded._doc.bio;
        user.email = req.body.email || req.cookies.decoded._doc.email;
        user.Role = req.cookies.decoded._doc.Role;
        user.imageURL= req.body.ImageURL || req.cookies.decoded._doc.ImageURL;
        user.Social= {
                FaceBook:req.body.facebook || '',
                Twitter: req.body.twitter || '',
                WebSite: req.body.website || '',
                LinkedIn: req.body.linkedin ||  '',
                YouTube : req.body.youtube || ''
            };
    console.log(user);
      user.save(function(err){
        if(err){
          res.status(400).json({message: 'Wrong thing'+err});
        }
        delete user.password ;
        console.log(user);
        res.cookie('decoded',{_doc:user},{httpOnly:true});
        return res.redirect('./profile');
        });
      });
    });

    app.get('/posts',function(req,res) {
        if(req.cookies.decoded._doc.Role != "admin"){
            Post.find({Author:req.cookies.decoded._doc.username},function(err,posts){
            if(err){console.log(err)}
                posts = posts.reverse();
                return res.render('manageposts',{posts : posts,user : req.cookies.decoded._doc});
            });
        }
        Post.find({},function(err,posts){
            if(err){console.log(err)}
                posts = posts.reverse();
                return res.render('manageposts',{posts : posts,user : req.cookies.decoded._doc});
            });
        
    });
    app.route('/posts/new')
        .get(function(req,res){
            Category.find({},function(err,cats){
                if(err) console.log(err);
                return res.render('newPost',{user : req.cookies.decoded._doc,cats : cats});
            });
           
        })
        .post(function(req,res){
               var tags = tagsToArray(req.body.tags); 
                var post = new Post({
                    Title: req.body.title,
                    Content: req.body.content,
                    category: req.body.category,
                    tags : tags,
                    ImageURL : req.body.image,
                    Author : req.cookies.decoded._doc.username,
                    posturl  : req.body.title.split(' ').join('-'),
                    PublishDate: new Date().toLocaleDateString()
                });
                post.save(function(err){
                    if(err) throw err;
                    for(var t in tags ){
                        var x = new Tag({Name: tags[t]});
                        x.save();
                    }
                    return res.redirect('/controlpanel/posts');
                });
                
            }
        );

        app.route('/posts/edit/:posturl')
        .get(function(req,res){
            Category.find({},function(err,cats){
                Post.findOne({posturl:req.params.posturl},function(err,post){
                    if(err) throw err;
                    return res.render('editPost',{user : req.cookies.decoded._doc,cats : cats,post:post});
                });
            });
           
        })
        .post(function(req,res){
               var tags = tagsToArray(req.body.tags);
               Post.findOneAndUpdate({posturl:req.body.posturl},{$set:{
                   Title: req.body.title,
                    Content: req.body.content,
                    category: req.body.category,
                    tags : tags,
                    ImageURL : req.body.image,
                    posturl  : req.body.title.trim().split(' ').join('-')           
               }},function(err,newPost){
                    if(err) throw err;
                    for(var t in tags ){
                        var x = new Tag({Name: tags[t]});
                        x.save();
                    }
                    console.log(newPost);
                    return res.redirect('/controlpanel/posts');
               });    
                
            }
        );

        app.post('/posts/delete/:posturl',function(req,res){
            Post.findOneAndRemove({posturl:req.params.posturl},function(err){
                if(err) throw err;
                res.redirect('/posts');
            });
        });


    app.get('/tags',function(req,res){
        Tag.find({},function(err,tags){
            if(err) throw err;
            return res.render('tagsAdmin',{tags : tags,user : req.cookies.decoded._doc});
        });
    });
    app.get('/categories',function(req,res){
        Category.find({},function(err,cats){
            return res.render('adminCategories',{cats: cats,user:req.cookies.decoded._doc});
        });
      
    });
    app.route('/categories/new')
        .get(function(req,res){
            res.render('newCategory',{user : req.cookies.decoded._doc,edit:false});
        })
        .post(function(req,res){
            var category = new Category({Name:req.body.name.toLowerCase()});
            category.save(function(err){
                if(err){console.log(err);}
                return res.redirect('./');
            });
        });

        app.route('/categories/edit/:name')
        .get(function(req,res){
            res.render('newCategory',{user : req.cookies.decoded._doc,edit:true,cat: req.params.name});
        })
        .post(function(req,res){
            Category.findOneAndUpdate({Name:req.body.oldname},{$set:{Name:req.body.name}},function(err){
                if(err) throw err;
                Post.find({category:req.body.oldname},function(err,posts){
                    for(post of posts){
                        post.category= req.body.name;
                        post.save();
                    }
                });
                return res.redirect('/controlpanel/categories');
            });
        });

    app.use(function(req,res,next){
        if(req.cookies.decoded._doc.Role != "admin"){
            return res.redirect('/controlpanel');
        }
        next();
    });
    
    app.get('/users',function(req,res){
        User.find({},function(err,users){
            if(err) throw err;
            return res.render('usersAdmin',{users: users,user : req.cookies.decoded._doc});
        });
    });

    app.get('/users/edit/:username',function(req,res){
        Category.find({},function(err,cats){
            User.findOne({username: req.params.username},function(err,user){
                res.render('edituser',{user:user,cats: cats,isAdmin:(req.cookies.decoded._doc.Role == 'admin'? true: false)});
            });
        });  
    });


    app.post('/users/edit/:username',function(req,res){
    User.findOne({username: req.params.username}).select('email password name bio Role ImageURL username Social').exec(function(err,user){
        if(err) res.status(400).json({message: 'user not found'});
         var pas = user.password;
        user.password = req.body.password || req.cookies.decoded._doc.password;
        if(user.password == null){
            user.password =   pas ;
        }
        user.name = req.body.name || req.cookies.decoded._doc.name;
        user.username = req.body.username || req.cookies.decoded._doc.username;
        user.bio = req.body.bio || req.cookies.decoded._doc.bio;
        user.Role = req.body.Role || req.cookies.decoded._doc.Role;
        user.imageURL= req.body.ImageURL || req.cookies.decoded._doc.ImageURL;
        user.Social= {
                FaceBook:req.body.facebook || '',
                Twitter: req.body.twitter || '',
                WebSite: req.body.website || '',
                LinkedIn: req.body.linkedin ||  '',
                YouTube : req.body.youtube || ''
            };
      user.save(function(err){
        if(err){
          res.status(400).json({message: 'Wrong thing'+err});
        }
        return res.redirect('/profile');
        });
      });
    });

    return app;
};


function tagsToArray(tagsInString){
            var tags =  tagsInString.split(',');
            var tagsjson = [];
            for(t of tags){
                tagsjson.push(t.trim().toLowerCase());
            }
            return tagsjson;
}

function saveTag (tagName){
    console.log(tagName);
    Tag.findOneAndUpdate({Name:tagName},function(err,tagn){
        console.log('dfdfdfdfdfdf');
        if(err)throw err;
        console.log(tagn);
    });
}

function toTitleCase (words) {
    return words.split(' ').map(
        function (s) {
            return s[0].toUpperCase() + s.substring(1).toLowerCase()      
        }).join(' ') ;
}