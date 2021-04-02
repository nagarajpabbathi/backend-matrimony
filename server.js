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
const { update } = require('./models/user');
const biodata = require('./models/biodata');

var _admin ='checking'
const razorpay = new Razorpay({
    key_id: 'rzp_live_r8t2KbUTPTN0OU',
    key_secret: 'lSB2dwAoc5I1y37YJjxqd8SI'
  })


const app = express();

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({  extended: true})); 

let date = new Date();
var compareDate=date.getMonth().toString()+date.getDate().toString()
compareDate = Number(compareDate)
app.get('/',(req, res) => {
    res.send('working');

})
console.log(compareDate,'date');
app.get('/modify', async (req, res) => {
    
    const data = await biodata.find({})
    for (let i = 0; i < data.length; i++){
        if(data[i].gender)
        var gender =data[i].gender.substring(0, 1);
        else gender ='0'
        
        if(data[i].qualifyType)
        var qualifyType = data[i].qualifyType.substring(0,3)
        else qualifyType ='000'

        if(data[i].caste)
        var caste =data[i].caste.substring(0,2)
        else caste="00"

        if(data[i].jobType)
        var jobtype=data[i].jobType.substring(0,1)
        else jobtype="0"

        var dob =data[i].dob.substring(2, 4)||"00"
        var height = data[i].height.substring(0, 1)||"0"
        height=height+data[i].height.substring(2, 4)||"00"
        var surname=data[i].surname.substring(0, 1)||"0"
        var name = data[i].name.substring(0, 2)||"00"
        var search = gender +    //0
        qualifyType+        //1-3
        caste+              //4-5
        jobtype +            //6
        dob +                //7-8
       height +              //9-10-11
       surname +            //12
       name;                 //13-14
        search = search.toLowerCase();  
        await data[i].updateOne({ search:search})
        console.log(true,search);
    }
    res.send(true)
} );


app.get('/images/:key', testmodule.gfsrender);

app.get('/imagesmall/:key', testmodule.resizerender);

app.get('/getdata/:searchid', async (req, res, next) => {
    let searchid = req.params.searchid;
    const data = await Biodata.findOne({ search: searchid }, { "name": 1, "qualify": 1, "dob": 1, "district": 1, "photo1": 1,"photo":1, "search": 1, "caste": 1,"searchid":1 }, (err, data) => {
        console.log(data);
        if (err) {
            res.send({data:false})
        }
        if (data) {
            res.json({data:data})
        }
        else {
            res.json(false);
        }
    });
})

app.get('/getdata', async(req, res,next) => {
    const data = await Biodata.find({verified:true},{"name":1,"photo":1,"qualify":1,"dob":1,"district":1,"photo1":1,"search":1,"caste":1,"makemyprofile":1}, (err, data) => {
        if (err) {
            res.send(err)
        }
        else {
            for (let i = 0; i < data.length; i++){
                if (data[i].makemyprofile) {
                   let lockedImage ='https://my-backend-images.s3.ap-south-1.amazonaws.com/IMG_20210401_060909.jpg'
                    data[i].photo = lockedImage;
               } 
            }
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


app.post('/limit/:username', async (req, res) => {
    let username = req.params.username;
    await user.findOne({ username:username }, async(err, data) => {
        if (err) {
            res.send(err);
        }
        else {
            if (data) {
                if (data.checkdate < compareDate) {
                    await data.updateOne({ checkdate: compareDate, todayViewed: 0 })
                    res.json({todayViewed:0})
                }
                else {
                    res.json({todayViewed:data.todayViewed})
                }
            }
            else {
                res.send('invalid username')
            }
        }
    }
   )
        
    
})

app.post("/signup", signupUser.postUsers)

app.post("/signin", async (req, res,next) => {
    const username = req.body.username.toLowerCase()||'';
    const password = req.body.password||'';
    const phone = req.body.username.toLowerCase() || '';
    console.log(username)
    // if (!username || username === "username")
    var temp = true;
        const userslist = await user.findOne({ phone: phone }, async(err, data) => {
            console.log(data)
            if (err) {
                temp = false;
                res.json({desc:'try after sometime..'})
            }
            if (!data) {
                userslist = await user.findOne({ username: username }, (err, data) => {
                    if (err || !data || data.length <= 0) {
                        res.json({ login: false,description:"Username not exists.." });
                }
                else {
                    if (data.password == password) {
                        res.json({ login: true,username:data.username,password:password,phone:data.phone,token:token,paid:data.paid,wishlist:data.wishlist,search:data.searchkey||false,todayViewed:data.todayViewed  });
                        }
                        else {
                            res.json({ login: false,description:'Invalid password..'});
        
                        }
                }
            })
            }
            else {
                temp = false;
                if (data.password == password) {
                    res.json({ login: true,username:data.username,phone:data.phone,password:password,token:token,paid:data.paid,wishlist:data.wishlist,search:data.searchkey||false,todayViewed:data.todayViewed });
                }
                else {
                    res.json({ login: false,description:'Invalid password'});

                }
            }
        })
    
   // else {

  // }
})

app.post('/getdata', testmodule.createBiodata);

app.post('/test', testmodule.createBiodata);
// app.get('/sendaws', testmodule.sendaws);
// app.get('/photo', (req, res) => {
//     biodata.find({}, { "photo": 1 }, (err, data) => {
//         var search=[];
//         for (let i = 0; i < data.length; i++){
//             search[i] = data[i].photo;
//         }
//         console.log(search)
//         res.send(data);
//     })
// })

app.post('/getdata/:search', async (req, res, next) => {
    ///checking user paid or not
    //console.log(req.body)
    var  secure ={'phone':0,'surname':0}
    if (req.body.username == _admin) {
       secure ={}
    }
    const userslist = await user.findOne({ username:req.body.username},{} ,async(err, data) => {
        if (err || !data || data.length <= 0) {
            res.json({ paid: false });
            }
        else {
           // console.log(data)
            if (data.password == req.body.password && data.paid) {
                let todayViewed = data.todayViewed;
                if (data.checkdate < compareDate) {
                    if (req.body.username == 'checking') {
                        
                    }
                    else {
                        await data.updateOne({ checkdate:compareDate,todayViewed: 0 })
                    }
                }
                else {
                    if (todayViewed < 5) {
                        if (req.body.username == 'checking') {
                        }
                        else {
                            await data.updateOne({ todayViewed: data.todayViewed+1})
                        }
                    }
                }
                
            if (todayViewed<5) {
                      const data = await Biodata.find({search:req.params.search},secure, (err, data) => {
                        if (err) {
                            res.send(err)
                        }
                        else {
                            if (data.makemyprofile && req.body.username != _admin) {
                                let lockedImage ='https://my-backend-images.s3.ap-south-1.amazonaws.com/IMG_20210401_060909.jpg'
                                data.photo = lockedImage;
                            }
                            res.send(data);
                        }
                    }); 
                }  
                else {
                    res.send('over')
                }
                }
               
            else {
                res.send(false);
  
            }
        }      
}) 
})

app.post('/razorpay', async (req, res) => {
    const payment_capture = 1
    const amount = '300000'  
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
        const userslist = await user.findOne({ username: username })
        await userslist.updateOne({paid:true});
        await createdRazor.save(); 
    }  
    res.json({status:'ok'})
})
/////////////////////////managing routes/////////////////
////////////view all profiles////////////////////////////
app.post('/all', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username =='username' && password=='password'){
        const data = await Biodata.find({verified:true},{"name":1,"qualify":1,"dob":1,"district":1,"photo1":1,"search":1,"caste":1,"phone":1,"driveimg":1}, (err, data) => {
            if (err) {
                res.send(err)
            }
            else {
                res.send(data);
            }
        });
    }
    else {
        res.send('invalid credintials')
    }
})
//////////////////////////////////////////////
////////////wishlist check////////////////////
app.post('/wishlist/:phone', async (req, res, next) => {
    var phone = req.params.phone;
    const username = req.body.username;
    const password = req.body.password;

   await user.findOne({ username: phone }).then(data => {
        console.log(data)
        if (data) {
            phone = data.phone;
           }
    }) 
    if (username == 'username' && password == 'password') {
     await user.findOne({ phone:phone }, { "wishlist":1}, (err, data) => {
            if (err) {
                res.send(err)
            }
            else {
                if (!data) {
                    res.send('no user found for id')
                }
                else {
                    console.log(data)
                    res.send(data);
                }
            } 
        });
    }
    else {
        res.send('invalid credintials')
    }
})
/////////////////////////////////////////////////////////////////
////////////////////////ACTIVATE USER////////////////////////////
app.post('/activate/:phone', async (req, res, next) => {
    var phone = req.params.phone;
    const username = req.body.username;
    const password = req.body.password;
    if (username == 'username' && password == 'password') {
        const updateData = await user.findOne({phone:phone }).then(async (data) => {
            const update = data;
            if (!data.paid) {
                update.paid = true;
                console.log(update);
                await data.updateOne(update);
                res.json('updated successfully.')   
            }
            else {
                res.json('already paid user')   
            }
           
        }).catch((err) => {
            console.log(err);
            res.json('error try again..')   

        })
    }
    else {
        res.json('invalid credintials')
    }
})
/////////////////////////////////////////////////////////////////////

//////////////NOT VERIFIED PROFILES///////////////////////////////
app.post('/notverified', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username == 'username' && password == 'password') {
        const data = await Biodata.find({ verified: false })
        .then(async (data) => {
        res.json(data)
        }).catch((err) => {
            res.json(err);
        })
        res.json('server error')
    }
})
////////////////////////////////////////////////////////////////////

///////////////////////NOT VERIFIED GETDATA///////////////////////////
app.get('/ngetdata', async(req, res,next) => {
    const data = await Biodata.find({verified:false},{"name":1,"qualify":1,"dob":1,"district":1,"photo1":1,"search":1,"caste":1}, (err, data) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(data);
        }
    });
})
app.post('/profiles', async (req, res, next) => {
    if (req.body.username == 'username' && req.body.password == 'password') {
        const data = await Biodata.find({verified:true},{"name":1,"qualify":1,"dob":1,"district":1,"photo":1,"photo1":1,"search":1,"caste":1,"phone":1}, (err, data) => {
            if (err) {
                res.send(err)
            }
            else {
                res.send(data);
            }
        });
    } else {
        res.send('invalid credentials')
    }
})
////////////////////////////////////////////////////////////

/////////////////////////MAKE VERIFY///////////////////////////////
app.post('/verify/:searchid', async (req, res) => {
    const searchid = req.params.searchid;
    const username = req.body.username;
    const password = req.body.password;
    if (username == 'username' && password == 'password') {
        const updateData = await Biodata.findOne({ verified: false,search:searchid }).then(async (data) => {
            const update = data;
            update.verified = true;
            await data.updateOne(update);
            res.send(true)
        }).catch((err) => {
            console.log(err);
        })
    }
    else {
        res.send('invalid credintials..')
    }})
/////////////////////////////////////////////////////////////////////

//////////////////////////PRIVATE MAKING////////////////////////////////
app.post('/private/:searchid', async (req, res) => {
    const searchid = req.params.searchid;
    const username = req.body.username;
    const password = req.body.password;
    if (username == 'username' && password == 'password') {
        const updateData = await Biodata.findOne({ search:searchid }).then(async (data) => {
            const update = data;
            update.makemyprofile = true;
            if (data.makemyprofile == false) {
                await data.updateOne(update);
                res.send(true)
            }
            else {
                res.send('already in private mode')
            }
        }).catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    else {
        res.send('invalid credintials..')
    }})
///////////////////////////////////////////////////////////////////////

///////////////DELETE ENTIRE PROFILE/////////////////////////////////////
app.post('/delete/:searchid', testmodule.deletegfs);
/////////////////////////////////////////////////////

////////////////DELETE ONLY IMAGE///////////////////
app.post('/deleteimg/:searchid', testmodule.deletegfsimg);
////////////////////////////////////////////////

///////////////DELETE BY FILENAME//////////////////////////
app.post('/deleteimage/:filename', testmodule.deletegfsimage);
/////////////////////////////////////////////////////

//////////////////////UPDATE PHOTO///////////////////////////////////
app.post('/updatephoto/:searchid',testmodule.updatePhoto)
/////////////////////////////////////////////////////////////////////

///////////////////////////GET DATA//////////////////////////////////
app.post('/getbiodata/:searchid',async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const searchid = req.params.searchid;
    console.log(searchid);
    if (username == 'username' && password == 'password') {
        await Biodata.findOne({search :searchid}, (err, data) => {
            if (err) {
                res.send('try again something went wrong');
            }
            else {
                console.log(data)
                if (data) {
                    res.send(data);
                }
                else {
                    res.send('invalid search id');
                }
            }
      })
    }
})

//////////////////////UPDATE BIODATA///////////////////////////////////
app.post('/updatebiodata/:searchid',testmodule.updateBiodata)
/////////////////////////////////////////////////////////////////////
app.post('/driveadd/:searchid',async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const searchid = req.params.searchid;
    const driveurl = req.body.driveurl;
    let driveid;
    const trim = driveurl.slice(32, driveurl.length)
   let index = trim.indexOf('/')
    driveid= trim.slice(0,index)

    if (username == 'username' && password == 'password') {
        await Biodata.findOne({search:searchid}, async(err, data) => {
            if (err) {
                res.send('try again something went wrong');
            }
            else {
                if (data) {
                    await data.updateOne({ driveimg: driveid,drive:true });
                    res.send('drive id successfully updated');
                }
                else {
                    res.send('invalid search id');
                }
            }
      })
    }
})

  
app.listen(process.env.PORT || 8080, console.log('server running on port 5000'));