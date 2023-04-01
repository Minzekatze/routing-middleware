const express = require("express");
const app = express();
const validator = require("validator");
const { Pool } = require("pg");
require("dotenv").config();
const port = 3000;
const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
});

const errorHandler = (err, req, res, next) => {
  console.log(err);
  if ((err.message = "missing token"))
    return res.status(403).json({ error: err.message });
  return res.json({ error: err.message });
};

const secure = (req, res, next) => {
  const { token } = req.params;
  console.log(token);
  //   if (req.params === "") {
  //     next("missing token");
  //   }
  if (!validator.isLength(token, { min: 3 })) {
    next("token invalid");
  } else {
    next();
  }
};

const matching = async (req, res, next) => {
  const { token } = req.params;
  const myQuery = "SELECT * FROM tokens WHERE token = $1";
  const { rows: mytoken } = await pool.query(myQuery, [token.toUpperCase()]);
  if (mytoken.length === 0) return next("no match found");
  return next();
};

const hasUser = async (req, res, next) => {
  const { token } = req.params;
  const myQuery =
    "SELECT name FROM users u JOIN tokens t ON t.user_id = u.id WHERE token = $1";
  const { rows: mytoken } = await pool.query(myQuery, [token.toUpperCase()]);
  if (mytoken.length === 0) return next("no user defined");
  return next();
};

app.use(express.json());

app.get("/verify/", (req, res, next) => {
  return next("missing token");
});

app.get("/verify/:token", secure, matching, hasUser, (req, res) => {
  res.send("token accepted");
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
