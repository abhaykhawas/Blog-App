const express = require('express'),
methodOverride = require("method-override"),
expressSanitizer = require('express-sanitizer')
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
app = express(),
port = 3000

//App Config
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {useNewUrlParser: true, useUnifiedTopology: true});
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(expressSanitizer())
app.use(methodOverride("_method"))

// Mongoose/Model config
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

const Blog = mongoose.model("Blog" ,blogSchema)


// RESTful Routes

app.get('/', (req, res) => {
    res.redirect("/blogs")
  })

app.get('/blogs', (req, res) => {
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err)
        } else{
            res.render("index", {blogs: blogs})
        }
    })
  
})

// New Route
app.get('/blogs/new', (req, res) => {
    res.render("new")
})

// CREATE BLOG
app.post('/blogs', (req, res) => {
    //CREATE BLOG
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new")
        } else {
            //REDIRECT
            res.redirect("/blogs")
        }
    })
})


//SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs")
        } else {
            res.render("show", {blog: foundBlog})
        }
    })
})


// EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs')
        } else {
            res.render("edit", {blog: foundBlog})
        }
    })

})


// UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs")
        } else {
            res.redirect("/blogs/" + req.params.id)
        }
    })
})

app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id).then(function(deletedBlog){
        res.redirect("/blogs")
    }).catch(function(err){
        res.redirect('/blogs')
    })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})