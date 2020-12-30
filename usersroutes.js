const user = require('./models/user')


const postUsers = (req,res) => {
    const createdUser = new user({
        phone: req.body.phone,
        username: req.body.username,
        password: req.body.password,
        wishlist:['nagaraj','pabbathi','arjun']
    })
    const result = createdUser.save().then((userfind) => {
        
        res.send("successfully signup"+userfind)
        
    })
        .catch((err) => {
            user.find({ username: req.body.username }, (err, data) => {
                console.log(data)
                if (data && data.length > 0) {
                    res.send("username already exist")
                }
                else {
                    user.find({ phone: req.body.username }, (err, data) => {
                        console.log(data)
                        if (data && data.length > 0) {
                            res.send("phone already exist")
                        }
                        else {
                            res.send('something went wrong try again')
                    }
                    })
                }
            })
          
    }) 
}

module.exports = {postUsers}