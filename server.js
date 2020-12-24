const bodyParser = require('body-parser');
const express = require('express');
const mongooseClient = require('mongoose')

const mongoPractice = require('./mongoose')

const Biodata = require('./models/biodata');


const app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.post('/getdata', mongoPractice.createBiodata);

app.get('/getdata',async (req, res) => {
    let data = await Biodata.find();
    res.send(data);
})

app.get('/',(req, res) => {
    res.send('working');

})

app.listen(process.env.PORT || 8080, console.log('server running on port 5000'));