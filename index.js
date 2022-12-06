const express = require("express");
const app = express();
var jwt = require("jsonwebtoken");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
// miedlewere
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extendedd: true }));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://photographer:E37RXt2BqCk4UVlB@cluster0.e40en03.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const data = require("./db.json");
app.get("/db", (req, res) => {
  res.send(data);
});

function jwtVerify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ messege: "unvalid token" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) return res.status(403).send({ messege: "forbidden token" });
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("services").collection("service");
    const reviewCollection = client.db("services").collection("review");
    app.get("/", (req, res) => {
      res.send("query server is running");
    });

    app.get("/services", async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(services);
    });
    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.send({ token });
      console.log(token);
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    app.post("/services/:id", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    app.get("/user-review", jwtVerify, async (req, res) => {
      let query = {};
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(401).send({ message: "unvalid token" });
      }
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    app.delete("/user-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const newReview = await reviewCollection.deleteOne(query);
      res.send(newReview);
    });
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const editReview = await reviewCollection.findOne(query);
      res.send(editReview);
    });
    app.patch("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const editedReview = req.body;

      const updateReview = {
        $set: {
          describe: editedReview.describe,
        },
      };
      const result = await reviewCollection.updateOne(query, updateReview);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log("listen on port " + port);
});
