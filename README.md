# express-mongobd-advanced

## Overview
This guide outlines the process of building a RESTful API using Express.js and MongoDB. It covers project setup, creating a server, defining schemas and models, and implementing CRUD operations. The tutorial also demonstrates securing sensitive data with environment variables and testing endpoints with Postman. Additionally, it includes steps for version control using Git and GitHub, making it a comprehensive resource for backend development.

**Deployed Site:** <https://express-mongodb-advanced.onrender.com>
## Setup
### Project setup:
- In your terminal make sure you `cd` into the directory that you want your project to go.
    - Make a new directory for your project:
        ```bash
        mkdir express-mongodb-advanced
    - Go into that directory:
        ```bash
        cd express-mongodb-advanced
    - Initialize `Node.js`:
        ```bash
        npm init -y
    - Install dependencies for the project:
        ```bash
        npm install express mongoose dotenv
    - Open your new project in VSCode:
        ```bash
        code .v
### Create the Server:
- Create a file named `index.js`.
    - Copy this server code into `index.js`:
        ```js
        // index.js
        const express = require('express');
        const mongoose = require('mongoose');
        const app = express();
        const port = 3000;

        // Middleware to parse JSON bodies
        app.use(express.json());

        // Connect to MongoDB
        mongoose
        .connect('your-mongodb-connection-string-here', {
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

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });


- In order to keep our `connection string` secure, we will need to store it in a `.env` file. 
    - Create a file named `.env`.
    - Define a variable for your `connection string`. NOTE: Your variable should be in all caps and no spaces between the variable and `=` or after.
        Example: `ATLAS_URL=mongodb+srv://<username>:<password>@cluster0.x3zgp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    - In order for us to use the environment variable in our server, we will need to import an configure dotenv:
        ```js
        require('dotenv').config()
    - We can add a console.log to confirm it is working, but remove after confirming:
        ```js
        console.log(process.env)
    - To use the environment variable in the server code, you can store it in a new variable to use it where you originally put your `connection string`:
        ```js
        const atlasUrl = process.env.ATLAS_URL
    - Replace your `'your-mongodb-connection-string-here'` with the new variable. 
- Test the Connection:
    - Start the server by running `node index.js`
    - In the terminal it should log `Connected to MongoDB`.
    - Navigate to `localhost/3000` in your browser to confirm that the page displays `Hello World!`. 

## Schema and Model
### Schema:
- A schema is a structure that defines the shape of the documents within a MongoDB collection. It acts as a blueprint for the data by specifying fields, their data types, and any constraints or validations.
- **Example Schema:**
    ```js
    const mongoose = require('mongoose');

    const userSchema = new mongoose.Schema({
        // Name is required and must be a string
        name: { type: String, required: true },
        // Email is required and unique  
        email: { type: String, required: true, unique: true }, 
        // Age must be a non-negative number
        age: { type: Number, min: 0 },  
        // Defaults to current date
        createdAt: { type: Date, default: Date.now }, 
    });
### Model:
- A model is a wrapper around a schema and provides an interface to interact with the database collection. With a model, you can create, read, update, and delete (CRUD) documents in the corresponding collection.
- **Example Model:**
    ```js
    const User = mongoose.model('User', userSchema);
### Define the Schema and Model
- Create a directory named `models`.
- Inside that directory, create a file named `users.js`.
- In `users.js` define a schema with the following fields: `name, email, age and isActive`.
- After the schema, create the model and export the user module:
    ```js
    //Create the User model
    const User = mongoose.model('User', userSchema);

    //Export the model
    module.exports = User;
## Routes
We will be using CRUD Operations to manipulate the users data.
CURD is basic operations performed on database data: Create, Read, Update and Delete
- In `index.js`, import the model:
    ```js
    //Import user model
    const User = require('./models/Users');
### Create and Read
- Create: Adding a new record.
    ```js
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
        // Log the saved user data to the console for debugging purposes
        console.log(savedUser);
        // Send the saved user data as a JSON response
        res.json(savedUser);
    })
- Read: Retrieving records.
    - We will use the `find({})` method to retrieve all documents in the 'User' collection
    ```js
    // Define a GET route to retrieve all users
    app.get('/users', async (req, res) => {
        // Query the database to fetch all users
        let allUsers = await User.find({})
        // Send the list of all users as a JSON response
        res.json(allUsers)
    })
- GET all `active` users:
    ```js
    //Get active users
    app.get('/users/active', async (req, res) => {
        let activeUsers = await User.find({ isActive: true })
        res.json(activeUsers)
    })
### Update and Delete
- If we want to manipulate user data by using their unique id, we use `ObjectId()` method. We need to import `Types` from `mongoose`:
    ```js
    //Import types and use ObjetId
    const { Types } = require('mongoose');
    const ObjectId = Types.ObjectId;
- Update: Modifying existing records.
    - We will use `:id` to retrieve the ID from the URL parameters with `req.params.id`. 
    - The `req.body` contains the fields to be updated.
    - We will use the `updateOne()` method to apply the updates to the user matching the `_id` from the query. 
    ```js
    // Define a PUT route to update a user by their unique ID
    app.put('/users/:id', async (req, res) => {
        // Create a query object to find the user by their ID
        const query = { _id: new ObjectId(req.params.id) };
        // Extract the updates from the request body
        const updates = req.body;
        // Update to the user matching the query
        let result = await User.updateOne(query, updates);
        // Send the result of the update operation as a JSON response
        res.json(result)
    })
- Delete: Removing records. 
    ```js
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
- Deactivate user by Id: 
    ```js
    //Deactivate user by Id
    app.put('/users/:id/deactivate', async (req, res) => {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = { $set: { isActive: false } };
        let result = await User.updateOne(query, updates);
        res.json(result)
    })
## Testing
### Test Create and Read
- Use `Postman` for testing routes:
- Create a User:
    * Method POST
    * Endpoint: http://localhost:3000/users
    * Response: 
        ```json
        {
            "name": "John Doe",
            "email": "johnD@gmail.com",
            "age": 21,
            "isActive": true,
            "_id": "675b0023b1b4bed754d109d0",
            "__v": 0
        }
    * Screenshot:
    ![POST User](</img/postUserPostman.png>)
- Get All Users:
    * Method: GET
    * Endpoint: http://localhost:3000/users
    * Response:
        ```json
        {
            "_id": "675904823d0ed7ba01f9b716",
            "name": "Jennifer",
            "email": "jenn@gmail.com",
            "age": 42,
            "isActive": false,
            "__v": 0
        },
        {
            "_id": "67590e55656a9809bf3c63c8",
            "name": "Jane Doe",
            "email": "jane@gmail.com",
            "age": 35,
            "isActive": true,
            "__v": 0
        },
        {
            "_id": "675b0023b1b4bed754d109d0",
            "name": "John Doe",
            "email": "johnD@gmail.com",
            "age": 21,
            "isActive": true,
            "__v": 0
        }
     * Screenshot:
    ![Get Users](</img/getUsersPostman.png>)
- Get Active Users:
    * Method: GET
    * Endpoint: http://localhost:3000/users/active
    * Response: 
        ```json
            {
            "_id": "67590e55656a9809bf3c63c8",
            "name": "Jane Doe",
            "email": "jane@gmail.com",
            "age": 35,
            "isActive": true,
            "__v": 0
        },
        {
            "_id": "675b0023b1b4bed754d109d0",
            "name": "John Doe",
            "email": "johnD@gmail.com",
            "age": 21,
            "isActive": true,
            "__v": 0
        }
    * Screenshot:
    ![Get Active Users](</img/activeUsersPostman.png>)
### Test Update and Delete
- Update a User:
    * Method: PUT
    * Endpoint: http://localhost:3000/users/67590e55656a9809bf3c63c8
    * Response:
        ```json
        {
        "acknowledged": true,
        "modifiedCount": 1,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1
        }
    * Screenshot:
    ![Update User](</img/updateUserPostman.png>)
- Deactivate a User:
    * Method: PUT
    * Endpoint: http://localhost:3000/users/675904823d0ed7ba01f9b716/deactivate
    * Response:
        ```json
        {
        "acknowledged": true,
        "modifiedCount": 1,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1
        }
    * Screenshot:
    ![Deactivate User](</img/deactivateUserPostman.png>)
- Delete a User:
    * Method: DELETE
    * Endpoint: http://localhost:3000/users/67590e76656a9809bf3c63ca
    * Response: 
        ```json
        {
        "acknowledged": true,
        "deletedCount": 1
        }
    * Screenshot:
    ![Delete User](</img/deleteUserPostman.png>)
## Initializing a Github Repository
- In your bash terminal, add a `.gitignore`:
    ```bash
    touch .gitignore
- Include `node_modules` and `.env`:
    ```bash
    echo "node_modules/" >> .gitignore
    echo ".env" >> .gitignore
- Create a new repository on Github, without a README.md or .gitignore.
- Back in bash initialize a empty repo:
    ```bash
    git init
- Add files to be staged for commit:
    ```bash
    git add .
- Initial commit:
    ```bash
    git commit -m "initial commit"
- Add a main branch:
    ```bash
    git branch -M main
- Add your new repository:
    ```bash
    git remote add origin https://github.com/username/reponame.git
- Push to Github
    ```bash
    git push -u origin main

## Conclusion
The Express-MongoDB-Advanced guide provides a solid foundation for building a robust API with Express.js and MongoDB. By following this tutorial, you’ve learned essential skills such as database integration, API routing, and CRUD operations. With added knowledge of secure data handling and version control, you’re ready to enhance this project further or integrate it into a larger application.
## Acknowledgements

- MongoDB Rest API - <https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial>