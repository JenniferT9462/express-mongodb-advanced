const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

//Import user model
const User = require('./models/users')

//Import types and ObjetId
const { Types } = require('mongoose');
const ObjectId = Types.ObjectId;

//Import environment variables
require('dotenv').config();
const atlasUrl = process.env.ATLAS_URL;

//Middleware to parse JSON
app.use(express.json());

mongoose
  .connect(atlasUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


// Define a GET route to retrieve all users
app.get('/users', async (req, res) => {
    // Query the database to fetch all users
    // The `find({})` method retrieves all documents 
    // in the 'User' collection
    let allUsers = await User.find({})
    // Send the list of all users as a JSON response
    res.json(allUsers)
})

//Get active users
app.get('/users/active', async (req, res) => {
  let activeUsers = await User.find({ isActive: true })
  res.json(activeUsers)
})

// Define a POST route to handle creating a new user
app.post('/users', async (req, res) => {
    // Extract the request body containing the user data
    const data = req.body;
    // Create a new User instance with the provided data
    const user = new User({
        name: data.name,
        email: data.email,
        age: data.age,
        isActive: data.isActive
    });
    // Save the user data to the database
    const savedUser = await user.save();
    console.log(savedUser);
    // Send the saved user data as a JSON response
    res.json(savedUser);
})

// Define a PUT route to update a user by their unique ID
app.put('/users/:id', async (req, res) => {
  // Create a query object to find the user by their ID
  // `req.params.id` retrieves the ID from the URL parameters
  const query = { _id: new ObjectId(req.params.id) };
  // Extract the updates from the request body
  // `req.body` contains the fields to be updated
  const updates = req.body;
  // Use the `updateOne` method to apply the updates to the user matching the query
  let result = await User.updateOne(query, updates);
  // Send the result of the update operation as a JSON response
  res.json(result)
})

//Deactivate user by Id
app.put('/users/:id/deactivate', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const updates = { $set: { isActive: false } };
  let result = await User.updateOne(query, updates);
  res.json(result)

})

// Define a DELETE route to remove a user by their unique ID
app.delete('/users/:id/', async (req, res) => {
  // Create a query object to match the user by their ID
  // `req.params.id` retrieves the ID from the URL parameters
  const query = { _id: new ObjectId(req.params.id) };
  // Use the `deleteOne` method to delete the user that matches the query
  let result = await User.deleteOne(query);
  // Send the result of the delete operation as a JSON response
  res.json(result)
})

//Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});