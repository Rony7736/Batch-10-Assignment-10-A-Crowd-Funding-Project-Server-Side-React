const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { isFuture } = require('date-fns');

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ehhvi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const campaignCollection = client.db('campaignDB').collection('campaign')
    const donatedCollection = client.db('campaignDB').collection('donated')

    // campaign post data
    app.post("/addcampaign", async (req, res) => {
      const data = req.body
      console.log(data)      
      const result = await campaignCollection.insertOne(data)
      res.send(result)
    })

    // capmaign get data
    app.get("/addcampaign", async (req, res) => {
      const result = await campaignCollection.find().toArray()
      res.send(result)
    })

    // my campaign
    app.post("/mycampaign", async (req, res) => {
      const {email : mail} = req.body
      const result = await campaignCollection.find({email : mail}).toArray()
      res.send(result)
    })

    // running campaign
    // app.get("/runningCampaign", async(req, res) => {
    //   const newDate = new Date()
    //   const result = await campaignCollection.find({"date" : {$gte: new Date("2023-01-01T00:00:00Z")}}).toArray()
    //   console.log(result);
    //   res.send(result)
      
    // })

    // delete campaign data
    app.delete("/campaign/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await campaignCollection.deleteOne(query)
      res.send(result)
    })

    // campaign update a single data
    app.get("/campaign/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await campaignCollection.findOne(query)
      res.send(result)
    })

    app.patch("/campaign/:id", async (req, res) => {
      const id = req.params.id
      // console.log(req.params);

      const data = req.body
      const query = { _id: new ObjectId(id) }
      const update = {
        $set: {
          photo: data?.photo,
          title: data?.title,
          campaigntype: data?.campaigntype,
          description: data?.description,
          amount: data?.amount,
          date: data?.date,
          email: data?.email,
          name: data?.name,
        },
      }

      const result = await campaignCollection.updateOne(query, update)
      res.send(result)
    })


    // Donated Collection
    app.post("/donated", async (req, res) => {
      const donated = req.body
      // console.log(donated)   
      console.log(new Date(donated.date).toDateString(), new Date().toDateString());
      const isDate = isFuture(new Date(donated.date)) 
      
      if(!isDate){
        return res.status(410).json({"success" : false})
      }
      
      const result = await donatedCollection.insertOne(donated)
      res.send(result)
    })

    app.get("/donated", async(req, res) => {
      const email = req.query.email 
      const query = {}
      if(email){
        query.email = email
      }
      const result = await donatedCollection.find(query).toArray()
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close(); 
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Campaign server is running")
})

app.listen(port, () => {
  console.log(`Campaign server is running on port: ${port}`)
})