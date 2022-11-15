import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb-legacy";
import dotenv from "dotenv";
import cors  from "cors";
import path from "path";



const app = express();
const routes = express.Router()
const port = 4000;


// utilisation de cors comme un middleware
app.use(cors());
// Permet de définir la format de requet (express.Json)
app.use(express.json());
//// middleware that is specific to this router
app.use("/posts", routes);

const public_path = path.join(__dirname, './build');
app.use(express.static(public_path));
app.get("*",(_, res) => {
res.sendFile(path.join(public_path, 'index.html'));
})


// routes ::::::
dotenv.config();
const uri = process.env.STRING_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Get Data From DataBase :::
routes.get("/", (_, res) => {
  client.connect((err, db) => {
    console.log(`connection with success to DB`);
    if (err || !db) {
      return false;
    }
    db.db("blog")
      .collection("posts")
      .find()
      .toArray(function (err, results) {
        if (!err) {
          console.log(results);
          res.status(200).send(results);
        }
      });
    //client.close();
  });
});
// Post Data To DataBase :::
routes.post("/insert", (req, res) => {
  client.connect((err, db) => {
    if (err || !db) {
      return false;
    }
    db.db("blog")
      .collection("posts")
      .insertOne(req.body)
      .then(()=> db.db("blog").collection("posts").find().toArray())
      .then(records =>res.status(200).send(records))
      .catch(()=> res.status(400).send('error fetching data from db'))
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  
});
