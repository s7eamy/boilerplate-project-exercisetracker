const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config({path: 'sample.env'})

// Mongo setup
mongoose.connect(process.env.MONGO_URI);
const userSchema = new mongoose.Schema({
  username: String,
});
const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
  _id: String
})
var userModel = new mongoose.model('User', userSchema);
var exerciseModel = new mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
.post((req, res) => {
  const user = new userModel({
    username: req.body.username
  })
  user.save().then(() => console.log('User', req.body.username, 'has been added.'));
  res.json(user);
})
.get((req, res) => {
  userModel.find().then(data => res.send(data));
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  var idUsername = String;
  await userModel.findOne({_id: id}).then(data => {
    if(!data) res.status(404).send('User not found')
    else {
      idUsername = data.username;
  }
  })
  const exercise = new exerciseModel({
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? new Date(req.body.date).toDateString() : new Date(Date.now()).toDateString(),
    _id: id
  })
  exercise.save().then(() => console.log('Exercise', req.body.description, 'added to user\'s', idUsername, 'log.'));
  res.json({
    username: idUsername,
    ...exercise._doc,
  });
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
