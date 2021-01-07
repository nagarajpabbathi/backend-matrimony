const bodyParser = require('body-parser');
const express = require('express');
const testmodule = require('./mongoose')
const mongoose = require('mongoose')
const Grid = require('gridfs-stream');
const Biodata = require('./models/biodata');
const signupUser = require('./usersroutes')
const user = require('./models/user')
const cors = require('cors')
const Razorpay = require('razorpay')
const Shortid = require('shortid');
const token = "nagarajpabbathi";
const razor= require('./models/razor');
const { json } = require('body-parser');

const razorpay = new Razorpay({
    key_id: 'rzp_live_r8t2KbUTPTN0OU',
    key_secret: 'lSB2dwAoc5I1y37YJjxqd8SI'
  })


const app = express();

app.use(cors())

 
app.use(bodyParser.json());



app.get('/',(req, res) => {
    res.send('working');

})


app.get('/images/:key', testmodule.gfsrender);

app.get('/imagesmall/:key', testmodule.resizerender);

app.get('/delete/:id', testmodule.deletegfs);

app.get('/getdata/:searchid', async (req, res, next) => {
    let searchid = req.params.searchid;
    const data = await Biodata.findOne({ search: searchid }, { "name": 1, "qualify": 1, "dob": 1, "district": 1, "photo1": 1, "search": 1, "caste": 1,"searchid":1 }, (err, data) => {
        console.log(data);
        if (err) {
            res.send({data:false})
        }
        else {
            res.json({data:data});
        }
    });
})
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
app.get('/searchids', async(req, res,next) => {
    const data = await Biodata.find({},{"search":1}, (err, data) => {
        if (err) {
            res.send(err)
        }
        else {
            console.log(data)
            res.send(data);
        }
    });
})

app.post('/addtowishlist', async (req, res) => {
    let searchid = req.body.searchid.toString();
    let username = req.body.username;
    let method = req.body.method;
    const getuser = await user.findOne({ username: username });
    if (method == 'add') {
        if (getuser) {
            try {
                let wishlist = getuser.wishlist;
                if (!wishlist.includes(searchid)) {
                    wishlist.push(searchid);
                    const update = { wishlist: wishlist };
                    await getuser.updateOne(update);
                    const updatedDoc = await user.findOne({ username: username });
                    console.log(updatedDoc);  
                    res.json({response:true})    
                }
                else {
                    res.json({response:true})    
                }
            }
            catch {
                res.json({response:false})           
            }
        } 
    }
    if (method == 'remove') {
        try {
            let wishlist = getuser.wishlist;
            if (wishlist.includes(searchid)) {
                var filteredAry = wishlist.filter(e => e !== searchid)
                const update = { wishlist: filteredAry };
                await getuser.updateOne(update);
                const updatedDoc = await user.findOne({ username: username });
                console.log(updatedDoc);  
                res.json({response:true})    
            }
            else {
                res.json({response:true})    
            }
        }
        catch {
            res.json({response:false})           
        }
    }
   
})
app.post("/signup", signupUser.postUsers)

app.post("/signin", async (req, res,next) => {
    const username = req.body.username||'';
    const password = req.body.password||'';
    const phone = req.body.username || '';
    console.log(username)
    // if (!username || username === "username")
    var temp = true;
        const userslist = await user.findOne({ phone: phone }, (err, data) => {
            console.log(data)
        
            if (err||!data||data.length<=0) {
               // res.json({ login: false,description:"Phone no not exists.."  })
            }
            else {
                temp = false;
                if (data.password == password) {
                    res.json({ login: true,username:username,phone:data.phone,password:password,token:token,paid:data.paid,wishlist:data.wishlist,search:data.searchkey||false });
                }
                else {
                    res.json({ login: false,description:'Invalid password'});

                }
            }
        })
    
   // else {
       temp&&( userslist = await user.findOne({ username: username }, (err, data) => {
            if (err || !data || data.length <= 0) {
                res.json({ login: false,description:"Username not exists.." });
        }
        else {
            if (data.password == password) {
                res.json({ login: true,username:username,password:password,token:token,paid:data.paid,wishlist:data.wishlist });
                }
                else {
                    res.json({ login: false,description:'Invalid password..'});

                }
        }
    }))
  // }
})

app.post('/getdata', testmodule.createBiodata);

app.post('/getdata/:search', async (req, res, next) => {
    ///checking user paid or not
    //console.log(req.body)
    const userslist = await user.findOne({ username:req.body.username},{'phone':0,'surname':0} ,async(err, data) => {
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
})

app.post('/razorpay', async (req, res) => {
    const payment_capture = 1
    const amount = '100'  
    const currency = 'INR'
    const receipt = Shortid.generate()
    const options = {
        amount,
        currency,
        receipt,
        payment_capture
    }
    const response = await razorpay.orders.create(options)
    console.log(response);
    res.json({
        id: response.id,
        currency: 'INR',
        amount: response.amount,
        
    })
})
app.post('/razorverify', async (req, res) => {
    const secret = 'nagaraj'
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest('hex')
    const header = req.headers['x-razorpay-signature']
    if (header == digest) {
        const createdRazor = new razor({
            data: JSON.stringify(req.body)
        })

        const username = req.body.payload.payment.entity.notes.username;
        await createdRazor.save();

        const userslist = await user.findOne({ username:username})
        if (userslist) {
              await userslist.updateOne({paid:true});
            }      
    
    }
   
    
    res.json({status:'ok'})
})
  
app.listen(process.env.PORT || 8080, console.log('server running on port 5000'));