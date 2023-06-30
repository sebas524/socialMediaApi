const postTest = (req, res) => {
  return res.status(200).json({ hello: "world form post controller" });
};

module.exports = {
  postTest,
};
