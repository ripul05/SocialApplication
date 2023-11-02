const bodyParser = require("body-parser");
const pool = require("../dbConnection");
const BodyParser = require("body-parser")

exports.postBlog = async (req, res) => {
  try {
    console.log("reached here")
    console.log(req.body.userid)
    const { userid, title, category, imageURL, description } = req.body;
    console.log(imageURL)
    // const userid = req.user.email;
    const query = `
            INSERT INTO blog_posts (userid, title, category, image_url, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

    const values = [
      userid,
      title,
      category || "general",
      imageURL,
      description,
    ];

    console.log("--->",userid, title, category, imageURL, description);
    const result = await pool.query(query, values);

    res
      .status(201)
      .json({ message: "Blog created successfully", blog: result.rows[0] });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.fetchBlogs = (req, res) => {
    pool.query("SELECT * FROM blog_posts")
      .then((result) => {
        res.status(200).send(result.rows);
      })
      .catch((error) => {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      });
  };

exports.getPaginatedBlogs = async (req, res) => {
  let page = req.query.page || 1;

  if (isNaN(page) || page < 1) {
    page = 1;
  }
  const limit = 3;
  const totalBlogs = await pool.query("SELECT COUNT(*) FROM blog_posts");
  const totalPages = Math.ceil(totalBlogs.rows[0].count / limit);

  if (page > totalPages) {
    page = 1;
  }

  const offset = (page - 1) * limit;

  try {
    const query = `SELECT * FROM blog_posts LIMIT $1 OFFSET $2`;

    const values = [limit, offset];

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};



exports.myposts = async function(req,res){
 console.log("Reached myposts")
  pool.connect()
  const userid = req.body.email
  console.log(userid)
  const userow = await pool.query(`Select * from blog_posts where userid = $1 order by post_id`,[userid])

  if (userow.rowCount>0){
    
    res.send(userow.rows)
  }
  else{
    console.log("No posts from user exists")
    res.send("No Posts")
  }
}

exports.allposts = async function(req,res){
  console.log("here")
  const userdeets = await pool.query("Select * from blog_posts order by post_id")
  if(userdeets.rows){
    res.send(userdeets.rows)
  }
  else{
    res.send("No entries in the database")

  }
}

// add testing edge cases in this

exports.editPost = async function (req, res) {
  const { postid, userid, title, category, image_url, description } = req.body;

  try {
    // Use parameterized query to prevent SQL injection
    const query = 'UPDATE blog_posts SET userid = $1, title = $2, category = $3, image_url = $4, description = $5 WHERE post_id = $6';
    const values = [userid, title, category, image_url, description, postid];

    await pool.query(query, values);

    res.send('Data is updated');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};


// add edge cases in this code 


exports.deletePost = async function (req, res) {
  const userId = req.body.userid;
  const postId = req.body.postid;
  console.log(userId,postId)

  try {
    // Use a parameterized query to prevent SQL injection
    const vuser = await pool.query('Select * from blog_posts where userid = $1 and post_id =$2',[userId,postId])
    if(vuser.rowCount>0){
      await pool.query('DELETE FROM blog_posts WHERE userid = $1 AND post_id = $2', [userId, postId]);
      console.log('Post deleted successfully');
      res.send('PD');//post deleted
    }
    else{
      res.send("IP")// invalid post 

    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('ISE');//error
  }
};


