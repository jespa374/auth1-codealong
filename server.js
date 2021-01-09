import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/auth";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const User = mongoose.model('User', {
  name: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken:{
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
});

//Encrypts password using one-way encription
const user = new User({ name: 'Bob', password:bcrypt.hashSync('foobar') });
user.save();

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world');
});


app.post('/sessions', async (req, res) => {
  const user = await User.findOne({ name: req.body.name});
  //if the user exists and the password from the response matches the password in the db => success
  if(user && bcrypt.compareSync(req.body.password, user.password)){
    //Success
    res.json({ userId: user._id, accessToken: user.accessToken });
  } else {
    //Failure
    //a. User doesn't exist
    //b. Encrypted password does not match
    res.json({ noteFound: true });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
});

//console.log(bcrypt.hashSync('foobar'));

//console.log(crypto.randomBytes(128).toString('hex'));