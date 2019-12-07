const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');
const Blog = mongoose.model('Blog');


module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  
  app.get('/api/blogs',requireLogin, async (req, res) => {  
    const blogs = await Blog.find({ _user: req.user.id }).cache({ userId: req.user.id });
    res.send(blogs);
  })  

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;
    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  }


  // the problem is when i create or update a a blog , the redis cache
  // don't take this in consideration so i have to clean the cache after 
  // this type of action 

  // WARNING : many users are using the app so i have be careful ,
  // a user will create a blog and other not
  // SO i have to create  
  );
};
