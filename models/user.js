const mongoose = require('mongoose');
const mongoURI ='mongodb+srv://nagarajpabbathi:Pabbathi123@testing.nej1j.mongodb.net/nagaraju?retryWrites=true&w=majority' ;
mongoose.connect(mongoURI,{useUnifiedTopology: true });
const userSchema = new mongoose.Schema({
    phone: { type:String, required:true, unique:true},
    username: { type:String, required:true, unique:true },
    password: { type:String, required:true },
    paid: { type: Boolean, default:0,  },
    wishlist: { type: Array, default:[]},
    myrequests: { type: Array, default: [] },
    myaccepts: { type: Array, default: [] },
    myrejects:{type:Array,default:[]},
    searchkey: { type: String, default:"" },
    checkdate: { type: Number, default:0},
    todayViewed:{type:Array,default:[]}
})

module.exports = mongoose.model('userlist', userSchema)
