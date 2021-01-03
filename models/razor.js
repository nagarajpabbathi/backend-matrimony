const mongoose = require('mongoose');
const mongoURI ='mongodb+srv://nagarajpabbathi:Pabbathi123@testing.nej1j.mongodb.net/nagaraju?retryWrites=true&w=majority' ;
mongoose.connect(mongoURI,{useUnifiedTopology: true });
const razorSchema = new mongoose.Schema({
    data: { type: String, required: true, unique: true },

})
module.exports = mongoose.model('razordata', razorSchema)