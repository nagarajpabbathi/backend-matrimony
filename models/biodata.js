const mongoose = require('mongoose');

const biodataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    tob: { type: String, required: true },
    height: { type: Number, required: true },
    qualify: { type: String, required: true },
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
    pincode: { type: Number, required: true },
    photo1: { type: String, required: true },
    photo2:{type:String}
    
})

module.exports=mongoose.model('biodata',biodataSchema)