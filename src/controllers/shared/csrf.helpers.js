module.exports = (req, res)=>{
  const csrfToken = req.csrfToken();
  req.session.adminCsrf = csrfToken;
  res.json(csrfToken);
};
