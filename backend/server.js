// backend/server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection string (update if needed)
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const client = new MongoClient(uri);

let db;
client.connect()
  .then(() => {
    db = client.db('salon'); // database name
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Helper to get collection
const getColl = (name) => db.collection(name);

// ---------- Generic CRUD routes ----------
// GET all documents in a collection
app.get('/api/:collection', async (req, res) => {
  try {
    const coll = getColl(req.params.collection);
    const docs = await coll.find({}).toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET single document by id (or custom key)
app.get('/api/:collection/:id', async (req, res) => {
  try {
    const coll = getColl(req.params.collection);
    const query = { _id: new ObjectId(req.params.id) };
    const doc = await coll.findOne(query);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    // fallback for non‑ObjectId keys (e.g., custom ids)
    try {
      const coll = getColl(req.params.collection);
      const doc = await coll.findOne({ id: req.params.id });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (e2) {
      res.status(500).json({ error: e2.message });
    }
  }
});

// POST create new document
app.post('/api/:collection', async (req, res) => {
  try {
    const coll = getColl(req.params.collection);
    const result = await coll.insertOne(req.body);
    const created = await coll.findOne({ _id: result.insertedId });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update document (replace fields)
app.put('/api/:collection/:id', async (req, res) => {
  try {
    const coll = getColl(req.params.collection);
    const filter = { _id: new ObjectId(req.params.id) };
    const update = { $set: { ...req.body, modifiedAt: new Date() } };
    const result = await coll.updateOne(filter, update);
    if (!result.matchedCount) return res.status(404).json({ error: 'Not found' });
    const updated = await coll.findOne(filter);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE document
app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const coll = getColl(req.params.collection);
    const result = await coll.deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
