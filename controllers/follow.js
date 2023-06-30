const followTest = (req, res) => {
  return res.status(200).json({ hello: "world form follow controller" });
};

module.exports = {
  followTest,
};
