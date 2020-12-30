const bodyParser = require('body-parser');
const express = require('express');
const testmodule = require('./mongoose')
const mongoose = require('mongoose')
const Grid = require('gridfs-stream');
const Biodata = require('./models/biodata');
const signupUser = require('./usersroutes')
const user = require('./models/user')




const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
 
app.use(bodyParser.json());



app.get('/',(req, res) => {
    res.send('working');

})


app.get('/images/:key', testmodule.gfsrender);

app.get('/imagesmall/:key', testmodule.resizerender);

app.get('/delete/:id', testmodule.deletegfs);

app.get('/getdata', async(req, res) => {
    const data = await Biodata.find({},{"name":1,"qualify":1,"dob":1,"district":1,"photo1":1,"search":1,"caste":1}, (err, data) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(data);
        }
    });
 
})

 
app.post("/signup", signupUser.postUsers)

app.post("/signin", async (req, res,next) => {
    const username = req.body.username;
    const password = req.body.password;
    const phone = req.body.phone;
    if (!username || username === "username")
    {
        const userslist = await user.findOne({phone:phone}, (err, data) => {
            if (err||data.length<=0) {
                res.send("no phone found found")
            }
            else {
                if (data.password == password) {
                    res.send('success full logged in with phone');
                }
            }
        })
    }
    else {
    const userslist = await user.findOne({username:username}, (err, data) => {
        if (err||data.length <= 0) {
            res.send("no username match")
        }
        else {
            if (data.password == password) {
               res.send('successfully logged in with username')
           }
        }
    })
   }
})








app.post('/getdata', testmodule.createBiodata);

app.get('/getdata/:search', async (req, res) => {
    var search = req.params.search;
    console.log(search);
    const data = await Biodata.find({search:req.params.search}, (err, data) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(data);
        }
    });
})
  
app.listen(process.env.PORT || 8080, console.log('server running on port 5000'));