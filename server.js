const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mysql = require("mysql"); 
const bodyParser = require("body-parser");


const app = express();
const server = http.createServer(app);
const io = socketIO(server);




const PORT = process.env.PORT || 3001;




const connection2= mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ckk@8099',
  database: 'edata',
});

connection2.connect();


app.use(bodyParser.json());


app.post("/submitForm", (req, res) => {
  const { id, name } = req.body;

 
  const checkNameQuery = "SELECT * FROM data WHERE Name = ?";
  connection2.query(
    checkNameQuery,
    [name],
    (checkNameErr, checkNameResults) => {
      if (checkNameErr) {
        console.error(checkNameErr);
        res.status(500).json({ message: "Internal server error" });
      } else {
        if (checkNameResults.length > 0) {
          res
            .status(400)
            .json({
              message: "Name already exists. Please check the name and retry.",
            });
        } else {
          const insertQuery = "INSERT INTO data (Id, Name) VALUES (?, ?)";
          connection2.query(
            insertQuery,
            [id, name],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error(insertErr);
                res.status(500).json({ message: "Internal server error" });
              } else {
                res.json({ message: "Data successfully inserted" });
              }
            }
          );
        }
      }
    }
  );
});



app.post("/login", (req, res) => {
  const { id, name } = req.body;

  const sql = "SELECT * FROM data WHERE Id = ? AND Name = ?";
  connection2.query(sql, [id, name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      if (results.length > 0) {
        res.json({ success: true, message: "Authentication successful" });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  });
});



const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ckk@8099",
  database: "onusers",
});


const generateUniqueID = () => {
  return Math.floor(100000 + Math.random() * 900000);
};


io.on("connection", (socket) => {
  const userID = generateUniqueID();
  console.log(`User ${userID} connected`);

  
  const insertUserSql = "INSERT INTO userids (Id) VALUES (?)";
  connection.query(insertUserSql, [userID], (err, results) => {
    if (err) {
      console.error(err);
    }
  });

  socket.on("update-content", (newContent) => {
    io.emit("content-update", newContent);
  });

  
  socket.on("disconnect", () => {
    console.log(`User ${userID} disconnected`);

    const deleteUserSql = "DELETE FROM userids WHERE Id = ?";
    connection.query(deleteUserSql, [userID], (err, results) => {
      if (err) {
        console.error(err);
      }
    });
  });
});




app.get("/userids", (req, res) => {
  const sql = "SELECT Id FROM userids";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      const ids = results.map((row) => row.Id);
      res.json(ids);
    }
  });
});



server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
