//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
import _ from 'lodash';
import mongoose from 'mongoose';
import 'dotenv/config'


const homeStartingContent = "This website demonstrates Cara's projects and notes for learning coding. ";
const aboutContent = "Don't know what to write...";


const app = express();
const PORT = process.env.PORT || 3000


  
app.use(bodyParser.urlencoded({limit: "10mb", extended: true}));
app.use(express.static("public"));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.po4ozzu.mongodb.net/blogDB`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const { Schema } = mongoose;

  const blogsSchema = new Schema({
    title: String,
    content:String,
    time: String
  });

  const Blog = mongoose.model('Blog', blogsSchema)

app.get("/", async(req, res)=>{
  const allBlogs = await Blog.find()
  res.render("home.ejs", {showContent: homeStartingContent, showPost: allBlogs})
})

app.get("/about", (req, res)=>{

  res.render("about.ejs", {showContent: aboutContent})
})

app.get("/blogs", async(req, res)=>{
  const allBlogs = await Blog.find()
  res.render("blogs.ejs", {showPost: allBlogs})
})

app.get("/compose", (req, res)=>{
  res.render("compose.ejs")
})

function createTime(){
  let publishDate = new Date()
  const offset = publishDate.getTimezoneOffset()
  publishDate = new Date(publishDate.getTime() - (offset*60*1000))
  return publishDate.toISOString().split('T')[0]
}

app.post("/compose", async(req, res)=> {
  let newPost = {
    newtitle: req.body.blogTitle,
    newcontent: req.body.blogBody,
  };
  let publishTime = createTime()
  const newBlog = new Blog({
    title: newPost.newtitle, 
    content: newPost.newcontent,
    time: publishTime
  })
  await newBlog.save();
  res.redirect("/")
})

//using ejs route parameters
//using lodash to convert to lowercase
// app.get("/posts/:postName", async(req,res) => {
//   const urlParam = _.lowerCase(req.params.postName);
//   const allBlogs = await Blog.find()
//   allBlogs.forEach(post => {
//     const storedTitle = _.lowerCase(post.title)
//     if (storedTitle===urlParam){
//       res.render("post.ejs",{post: post})
//     }
//   })

// })

//using post_id to find the post

app.get("/posts/:postID", async(req,res) => {
  const requestedID = req.params.postID;
  const post = await Blog.findOne({
    _id: requestedID
  })
  res.render("post.ejs",{post: post})
    }
  )
app.post("/", async (req,res)=>{
  const requestedID = req.body.deleteBtn;
  await Blog.deleteOne({ _id: requestedID });
  res.redirect("/")
})


connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})
