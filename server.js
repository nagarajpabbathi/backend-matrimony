const bodyParser = require('body-parser');
const express = require('express');
const testmodule = require('./mongoose')
const mongoose = require('mongoose')
const Grid = require('gridfs-stream');
const Biodata = require('./models/biodata');
const signupUser = require('./usersroutes')
const user = require('./models/user')
var cors = require('cors')
const token = "nagarajpabbathi";




const app = express();

app.use(cors())

 
app.use(bodyParser.json());



app.get('/',(req, res) => {
    res.send('working');

})


app.get('/images/:key', testmodule.gfsrender);

app.get('/imagesmall/:key', testmodule.resizerender);

app.get('/delete/:id', testmodule.deletegfs);

app.get('/getdata', async(req, res,next) => {
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
    const username = req.body.username||'';
    const password = req.body.password||'';
    const phone = req.body.username || '';
    console.log(username)
    // if (!username || username === "username")
     {
        const userslist = await user.findOne({ phone: phone }, (err, data) => {
            console.log(data)
        
            if (err||!data||data.length<=0) {
               // res.json({ login: false,description:"Phone no not exists.."  })
            }
            else {
                if (data.password == password) {
                    res.json({ login: true,username:username,password:password,token:token,paid:data.paid });
                }
                else {
                    res.json({ login: false,description:'Invalid password'});

                }
            }
        })
    }
   // else {
         userslist = await user.findOne({ username: username }, (err, data) => {
            if (err || !data || data.length <= 0) {

                res.json({ login: false,description:"Username not exists.." });
        }
        else {
            if (data.password == password) {
                res.json({ login: true,username:username,password:password,token:token,paid:data.paid });
                }
                else {
                    res.json({ login: false,description:'Invalid password'});

                }
        }
    })
  // }
})








app.post('/getdata', testmodule.createBiodata);

app.post('/getdata/:search', async (req, res, next) => {
    ///checking user paid or not
    //console.log(req.body)
    const userslist = await user.findOne({ username:req.body.username}, async(err, data) => {
        if (err || !data || data.length <= 0) {
            res.json({ paid: false });
            }
        else {
            console.log(data)
            if (data.password == req.body.password && data.paid) {
                const data = await Biodata.find({search:req.params.search}, (err, data) => {
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send(data);
                    }
                }); 
            }
            else {
                res.send([true]);
    
            }
        }
       
})


    var search = req.params.search;
    console.log(search);
    
})
  
app.listen(process.env.PORT || 8080, console.log('server running on port 5000'));