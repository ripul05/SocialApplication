const express = require("express");
const { postBlog, fetchBlogs, getPaginatedBlogs, deletePost, allposts , myposts, editPost } = require("./blog.controller");

const blogRouter = express.Router();

blogRouter.post("/post", postBlog)
blogRouter.get("/getBlogs", fetchBlogs)
blogRouter.get("/getPaginatedBlogs", getPaginatedBlogs)
blogRouter.post("/delete",deletePost)
blogRouter.post("/myposts",myposts )
blogRouter.get("/allposts",allposts)
blogRouter.put("/edit",editPost)


module.exports = blogRouter;