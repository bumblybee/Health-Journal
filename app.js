const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const port = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const posts = [];

// Database Setup
mongoose.connect("mongodb://localhost:27017/healthDB", {
  useNewUrlParser: true, useUnifiedTopology: true
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  rating: Number,
  today: String,
  time: String,
  date: String,
});

const Post = mongoose.model("Post", postSchema);

//Home page render
app.get("/", (req, res) => {
    Post.find({}, (err, posts) => {
        if (err) throw err;
        res.render("home", {posts});
    });
});

//Compose page render
app.get("/compose", (req,res) => {

   
    let ratingNums = _.range(1, 6);
    res.render("compose", {ratingNums});
});


//Posts route
app.get("/posts/:postId", (req,res) => {
    const postId = req.params.postId;
    Post.findOne({_id: postId}, (err, post) => {
        if(err) throw err;

        const date = post.date;
        
            res.render("posts", {
                title: post.title,
                content: post.content,
                rating: post.rating,
                today: post.today,
                time: post.time
            });
        

    });
});



//Stat page render
app.get("/stats", (req, res) => {
    let ratings = null;
    
	Post.find({}, (err, posts) => {
        if (err) throw err;

        posts.forEach(post => {
            // Grab all post ratings
            ratings += Number(post.rating);
        });
       
        // Find average of ratings
        const average = (ratings / posts.length).toFixed(1);

        res.render("stats", { average });
    });
		
});

app.get("/notFound", (req,res) => {
    res.render("notFound");
});

//Compose page POST
app.post("/compose", (req,res) => {


const date = new Date();
const options = { hour: "numeric", minute: "2-digit" };

    const today =
    (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    
    const time = date.toLocaleTimeString("en-us", options);
    
    const dateFormat =
			date.getFullYear() +
			"-" +
			("0" + (date.getMonth() + 1)).slice(-2) +
			"-" +
			date.getDate();


    const title = req.body.titleText;
    const content = req.body.postText;
    const rating = req.body.rating;

    const newPost = new Post({
        title: title,
        content: content,
        rating: rating,
        today: today,
        time: time,
        date: dateFormat
    });

    
    newPost.save();
    res.redirect("/");
});


// See average of all ratings
// TODO: Average over a week, month, etc.
//TODO: Display list of posts if multiple match date search
app.post("/stats", (req,res) =>{
    const dateSearch = req.body.dateSearch;
    Post.findOne({ date: dateSearch}, (err, post) => {
           if(!err) {
            const id = post._id;
            res.redirect(`/posts/${id}`);
           } else {
               throw err;
               res.redirect("/notFound");
           }
    });

    // If date of post and searched date match, open that post
     
    
    
});



app.listen(port, () => {
	console.log(`Listening on ${port}`);
});
