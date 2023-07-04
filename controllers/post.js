const Post = require("../models/post");

const postTest = (req, res) => {
  return res.status(200).json({ hello: "world form post controller" });
};

// *SAVE POST
const savePost = async (req, res) => {
  // * get req.body:
  const postToSave = req.body;
  // * in case theres nothing return a negative res
  if (!postToSave) {
    return res.status(400).json({
      status: "Error",
      message: "Post field has not been provided.",
    });
  }
  // * create and fill object
  console.log(req.body.text);

  let newPost = new Post(postToSave);
  newPost.user = req.user.id;
  // * save post to db:
  try {
    const savedPost = await newPost.save();
    return res.status(200).json({
      status: "Success",
      message: "Post has been correctly saved to DB.",
      savedPost,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};
// * FETCH PARTICULAR POST

const getPost = async (req, res) => {
  // * get id param from url:
  const id = req.params.id;
  try {
    // * find id in db:
    const foundPost = await Post.findById(id);

    if (!foundPost) {
      return res
        .status(404)
        .json({ status: "Error", message: "Post not found." });
    }

    return res.status(200).json({
      status: "Success",
      foundPost,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};
// * DELETE POSTS
const deletePost = async (req, res) => {
  // * get id from link:
  const postToDelete = req.params.id;
  // * get id from logged in as:
  const loggedInAs = req.user;

  try {
    const foundPost = await Post.findOneAndRemove({
      user: req.user.id,
      _id: postToDelete,
    });
    if (!foundPost) {
      return res.status(400).json({
        status: "Error",
        message: "Post not found.",
      });
    }
    return res.status(200).json({
      status: "Success",
      loggedInAs,
      message: "Post has been removed.",
      deletedPost: foundPost,
    });
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};
// * LIST OF ALL POSTS FROM USERS I FOLLOW

const getAllUserPosts = async (req, res) => {
  // * get id from link:
  const userId = req.params.id;
  // * get id from logged in as:
  const loggedInAs = req.user;
  // * page query:
  let page = parseInt(req.query.page) || 1;
  const itemsPerPage = 2;

  try {
    const foundPosts = await Post.find({
      user: userId,
    })
      .populate("user", "-password -_id -__v -role")
      .sort("-created_at")
      .paginate(page, itemsPerPage);

    const totalPosts = await Post.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalPosts / itemsPerPage);

    if (!foundPosts) {
      return res.status(400).json({
        status: "Error",
        message: "No Post found.",
      });
    }
    return res.status(200).json({
      status: "Success",
      loggedInAs,
      message: "Post(s) found.",
      foundPosts: { totalPosts, totalPages, currentPage: page, foundPosts },
    });
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

// * LIST POSTS FROM A PARTICULAR USER
// * UPLOAD FILES
const uploadPostImage = async (req, res) => {
  // * multer configuration:
  //// ! done already in routes file!!!
  // * see if file is being sent:
  if (!req.file) {
    return res
      .status(400)
      .json({ status: "error", message: "No file currently being uploaded." });
  }

  // * name of img file:
  const filenameOriginal = req.file.originalname;
  // * extension of img file(we get it by splitting filename by the dot. ex: "mypic","jpeg"):
  const fileSplit = filenameOriginal.split(".");
  const fileExtension = fileSplit[1];

  // * check that extension is correct:
  if (
    fileExtension !== "png" &&
    fileExtension !== "jpg" &&
    fileExtension !== "jpeg" &&
    fileExtension !== "gif"
  ) {
    // * delete file and give respond:
    fs.unlink(req.file.path, (err) => {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid file type" });
    });
  }

  // * starting here we know we have a correct image.
  // * now we save image to specific user image:
  try {
    const postImageUpdated = await Post.findOneAndUpdate(
      { _id: req.user.id },
      { file: req.file.filename },
      { new: true }
    );
    if (!postImageUpdated) {
      return res.status(400).send({
        status: "Error",
        message: "photo has not been uploaded",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "photo has been uploaded",
      file: req.file,
      user: postImageUpdated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "Error",
      message: "Something went wrong. Please contact admin.",
    });
  }
};
// * RETURN IMAGES

const getPostImage = (req, res) => {
  let chosenImage = req.params.chosenImage; //! REMEBER chosenImage has to match :chosenImage in ROUTES!!!!!!!
  // * where is physical path:
  let physicalPath = `./images/users/` + chosenImage;

  // * does image with that path exist?
  try {
    fs.stat(physicalPath, (error, exists) => {
      if (exists) {
        return res.sendFile(path.resolve(physicalPath));
      } else {
        // * return file
        return res.status(404).json({
          status: "error",
          message: "image does not exists",
          exists,
          chosenImage,
          physicalPath,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      message: "Server error, please contact admin.",
    });
  }
};

module.exports = {
  postTest,
  savePost,
  getPost,
  deletePost,
  getAllUserPosts,
  uploadPostImage,
  getPostImage,
};
