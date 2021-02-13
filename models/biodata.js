const mongoose = require('mongoose');
const mongoURI ='mongodb+srv://nagarajpabbathi:Pabbathi123@testing.nej1j.mongodb.net/nagaraju?retryWrites=true&w=majority' ;
mongoose.connect(mongoURI,{useUnifiedTopology: true });
const biodataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    tob: { type: String, required: true },
    height: { type: String, required: true },
    qualify: { type: String, required: true },
    qualifyType: { type: String, required: true },
    jobDetails: { type: String, required: true },
    jobType: { type: String, required: true },
    company: { type: String, required: true },
    salary: { type: String, required: true },
    caste: { type: String, required: true },
    gothram: { type: String, required: true },
    father: { type: String, required: true },
    fatheroccu: { type: String, required: true },
    mother: { type: String, required: true },
    motheroccu: { type: String, required: true },
    sibilings: { type: String, required: true },
    district: { type: String, required: true },
    pincode: { type: String, required: true },
    photo1: { type: String, required: true },
    photo: { type: String},
    photo2: { type: String },
    driveimg: { type: String, default: false},
    driveimg2: { type: String },
    search: { type: String, required:true},
    phone: { type: String, required:true},
    username: { type: String },  
    makemyprofile:{type:Boolean,default:0},
    verified:{type:Boolean,default:0}
})

module.exports=mongoose.model('biodata',biodataSchema)