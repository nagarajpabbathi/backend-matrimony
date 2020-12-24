const mongoose = require('mongoose');

const Biodata = require('./models/biodata');

mongoose.connect("mongodb+srv://nagarajpabbathi:Pabbathi123@testing.nej1j.mongodb.net/nagaraju?retryWrites=true&w=majority").then(() => {
    console.log("connected")
}).catch(() => {
    console.log('failed to connect')
})

const createBiodata = async (req, res, next) => {
    console.log(req.body);
    const createdBiodata = new Biodata({
        name:     req.body.name,
        surname:  req.body.surname,
        gender:   req.body.gender,
        dob:      req.body.dob,
        tob:      req.body.tob,
        height:   req.body.height,
        qualify:  req.body.qualify,
        jobDetails: req.body.job,
        jobType:    req.body.jobtype,
        company:   req.body.company,
        salary: req.body.salary,
        caste: req.body.caste,
        gothram: req.body.gothram,
        father: req.body.father,
        fatheroccu: req.body.fatheroccu,
        mother: req.body.mother,
        motheroccu: req.body.motheroccu,
        sibilings: req.body.sibiling,
        district: req.body.district,
        pincode: req.body.pincode,
        photo1: req.body.photo1,
        photo2:req.body.photo2
        
       
    })
    const result = await createdBiodata.save();
    console.log(result)
    res.send(true)

}
exports.createBiodata = createBiodata;
