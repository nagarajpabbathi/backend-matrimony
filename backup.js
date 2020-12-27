const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const path = require('path');


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

//mongouri
const mongoURI ='mongodb+srv://nagarajpabbathi:Pabbathi123@testing.nej1j.mongodb.net/nagaraju?retryWrites=true&w=majority' ;
// create mongo connection
const conn = mongoose.createConnection(mongoURI,{ useNewUrlParser: true, useUnifiedTopology: true});

//Init gfs
let gfs;
//initialize stream
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });


app.post('/getdata', upload.single('file'), async (req, res, next) => {
    console.log(req.body)
    const createdBiodata = new Biodata({
        name: req.body.name,
        surname: req.body.surname,
        gender: req.body.gender,
        dob: req.body.dob,
        tob: req.body.tob,
        height: req.body.height,
        qualify: req.body.qualify,
        jobDetails: req.body.job,
        jobType: req.body.jobtype,
        company: req.body.company,
        salary: req.body.salary,
        caste: req.body.caste,
        gothram: req.body.gothram,
        father: req.body.father,
        fatheroccu: req.body.fatheroccu,
        mother: req.body.mother,
        motheroccu: req.body.motheroccu,
        sibilings: req.body.sibilings,
        district: req.body.district,
        pincode: req.body.pincode,
        photo1: "none",
        photo2: "jk"
    })
    createdBiodata.photo1 = req.file.filename;
    console.log(createdBiodata)
    createdBiodata.save((err) => {
        if (err) {
            res.type('html').status(500);
            res.send("Error:" + err);
        }
        else {
            console.log('success');
            res.send("success")
        }
    })
    console.log('nagaraj')

} );

app.get('/getdata',async (req, res) => {
    let data = await Biodata.find();
    res.send(data);
})

app.get('/',(req, res) => {
    res.send('working');

})

app.listen(process.env.PORT || 8080, console.log('server running on port 5000'));