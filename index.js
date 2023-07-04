// * imports:
const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const followRoutes = require("./routes/follow");
// * connection to db:
connection();
// * create node server:
const app = express();
const port = 3000;
// * configure cors:
app.use(cors());
// * convert body data to json object:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// * load routes:
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/follow", followRoutes);

// * port listening:
app.listen(port, () => {
  console.log(`server listening on port ${port}!`);
});
