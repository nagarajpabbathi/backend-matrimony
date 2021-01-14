const user = require('./models/user')


const postUsers = (req,res,next) => {
    const createdUser = new user({
        phone: req.body.phone,
        username: req.body.username,
        password: req.body.password,
       // paid:req.body.paid,
        wishlist:[]
    })
        createdUser.save().then(() => {
        res.json({user:true,userinfo:createdUser}) 
    })
        .catch((err) => {
            user.find({ username: req.body.username }, (err, data) => {
                console.log(data)
                if (data && data.length > 0) {
                    res.json({ user: "username already exist" })
                }
                else {
                    user.find({ phone: req.body.phone }, (err, data) => {
                        console.log(data)
                        if (data && data.length > 0) {
                            res.json({ user: "phone already exist" })
                        }
                        else {
                            res.send({ user: 'something went wrong try after sometime..' })
                    }
                    })
                }
            })
          
    }) 
}

module.exports = {postUsers}