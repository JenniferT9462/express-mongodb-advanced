const mongoose = require('mongoose');



//Define the User schema
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true } 
})



//Create the User model
const User = mongoose.model('User', userSchema);

//Export the model
module.exports = User;