const bodyParser = require('body-parser');
const express = require('express');
const mongooseClient = require('mongoose')

const mongoPractice = require('./mongoose')

const Biodata = require('./models/biodata');


const app = express();

app.use('*', function(req, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
 });
app.use(bodyParser.json());




app.post('/getdata', mongoPractice.createBiodata);

app.get('/getdata',async (req, res) => {
    let data = await Biodata.find();
    res.send(data);
})

app.get('/',(req, res) => {
    res.send('working');

})

app.listen(process.env.PORT || 8080, console.log('server running on port 5000'));