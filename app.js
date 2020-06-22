const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const port = process.env.PORT || 3000;

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const posts = [];
let dateSearch = "";

//Home page render
app.get("/", (req, res) => {
    res.render("home", {posts});
});

//Compose page render
app.get("/compose", (req,res) => {

   
    let ratingNums = _.range(1, 6);
    res.render("compose", {ratingNums});
});


//Posts route
app.get("/posts/:postQuery", (req,res) => {
    const requestedPost = _.lowerCase(req.params.postQuery);
    posts.forEach(post => {
        const date = post.date;
        if(requestedPost === _.lowerCase(post.title) || requestedPost == date) {
            res.render("posts", {
                title: post.title,
                content: post.content,
                rating: post.rating,
                today: post.today,
                time: post.time
            });
        }
    });
});


//Stat page render
app.get("/stats", (req, res) => {
    let ratings = null;
    
	posts.forEach((post) => {
		ratings += Number(post.rating);
    });
    
	const average = (ratings / posts.length).toFixed(1);

	res.render("stats", { average });
});

app.get("/notFound", (req,res) => {
    res.render("notFound");
})

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

    const post = {
        title: title,
        content: content,
        rating: rating,
        today: today,
        time: time,
        date: dateFormat
    };

    
    posts.push(post);
    res.redirect("/");
});


// See average of all ratings
// TODO: Average over a week, month, etc.
//TODO: Display list of posts if multiple match date search
app.post("/stats", (req,res) =>{
    dateSearch = req.body.dateSearch;
    posts.forEach((post) => {
    // If date of post and searched date match, open that post
        if(post.date === dateSearch) {
            const title = _.lowerCase(post.title);
            res.redirect(`/posts/${title}`);
        } else {
            res.redirect("/notFound");
        }
    });
});


app.listen(port, () => {
	console.log(`Listening on ${port}`);
});
