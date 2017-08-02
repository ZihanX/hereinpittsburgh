var express  = require("express"),
    router   = express.Router({mergeParams: true}); //为了传:id

var Item        = require("../models/item"),
    Comment     = require("../models/comment"),
    User        = require("../models/user"),
    Category    = require("../models/category");
    
var middleware = require("../middleware");

//实际上已经已经不会进入页面了
//if logged in, run "next()", 也就是后面的function
//但下面这一段只是隐藏了这个url，如果有人直接access rul，也可以做出更改
router.get("/items/:id/comments/new", middleware.isLoggedIn, function(req, res) {
    req.session.returnTo = req.path; //RECORD THE PATH
    //console.log(req.session);
    //console.log(req.params.id); //传的:id
    Item.findById(req.params.id, function(err, item){
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {item: item});   
        }
    });
});

//所以要在下面这一段也加上middleware isLoggedIN
router.post("/items/:id/comments/", middleware.isLoggedIn, function(req, res){
    Item.findById(req.params.id, function(err, item) {
        if(err) {
            console.log(err);
            res.redirect("/items");
        } else {
            item.date_update = currentTime();
            item.save();
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    req.flash("error", "Fail to create comment.");
                }
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.personal_name;
                    comment.item = item;
                    comment.date_update = currentTime();
                    comment.save();
                    item.comments.push(comment);
                    item.save();
                    req.flash("success", "Successfully added comment.");
                    res.redirect("/items/" + item._id);
                }
            });
        }
    });
});

//get the date function
var currentTime = function() {
    var utcNow = new Date();
    var now = new Date(Date.UTC(utcNow.getFullYear(), utcNow.getMonth(), utcNow.getDate(), 
                            utcNow.getHours()-4, utcNow.getMinutes(), utcNow.getSeconds()));
    return now;
}

module.exports = router;