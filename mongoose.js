const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const Biodata = require('./models/biodata');
const sharp = require('sharp');




const mongoURI ='mongodb+srv://nagarajpabbathi:Pabbathi123@testing.nej1j.mongodb.net/nagaraju?retryWrites=true&w=majority' ;
// create mongo connection
const conn = mongoose.createConnection(mongoURI,{ useNewUrlParser: true, useUnifiedTopology: true});

//Init gfs
let gfs;
//initialize stream
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage }).fields([
    { name: 'file' },
    {name:'file2'}
])


const createBiodata = async (req, res, next) => {
    console.log(req.body)
    upload(req, res, async err => {
        if (err) {
            console.log(err)
        }
        else {
            const createdBiodata = new Biodata({
                name: req.body.name,
                surname: req.body.surname,
                gender: req.body.gender,
                dob: req.body.dob,
                tob: req.body.tob,
                height: req.body.height,
                qualify: req.body.qualify,
                jobDetails: req.body.job,
                jobType: req.body.jobtype,
                company: req.body.company,
                salary: req.body.salary,
                caste: req.body.caste,
                gothram: req.body.gothram,
                father: req.body.father,
                fatheroccu: req.body.fatheroccu,
                mother: req.body.mother,
                motheroccu: req.body.motheroccu,
                sibilings: req.body.sibilings,
                district: req.body.district,
                pincode: req.body.pincode,
                qualifyType: req.body.qualifyType,
                phone:req.body.phone,
                username:req.body.username,
                photo1: req.files.file[0].filename,
                photo2: 'none',
                search: "none"
            });
            var search = req.body.gender.substring(0, 1) + req.body.qualifyType.substring(0, 2) + req.body.caste.substring(0, 2) + req.body.jobtype.substring(0, 1) + req.body.dob.substring(0, 4) 
            + req.body.height.substring(0, 1) +req.body.height.substring(2, 4) +
                req.body.surname.substring(0, 1) + req.body.name.substring(0, 2);
                createdBiodata.search = search;
                if ((req.files.file2)) {
                    createdBiodata.photo2 = req.files.file2[0].filename;
                    const getuser = await user.findOne({ username: req.body.username });
                    if (getuser) {
                        const update = { searchkey: search };
                        await getuser.updateOne(update);
                     }
                    const result = createdBiodata.save();
                    res.send(true)
            }
                else {
                    const result = createdBiodata.save();
                    const getuser = await user.findOne({ username: req.body.username });
                    if (getuser) {
                        const update = { searchkey: search };
                        await getuser.updateOne(update);
                     }

                    res.send(true)
            }
        }
    })
   
  
  



}

const gfsrender = (req, res) => {
    gfs.files.findOne({ filename: req.params.key }, (err, file) => {
        //checking files
        if (!file || file.length === 0) {
            // return res.status(404).json({
            //     err: 'no file exist'
            // });
            console.log('no image found')
            res.sendFile('noImageFound.jpg', { root: path.join(__dirname, '../public/images') });
        }
        else {
            if ((file.contentType === 'image/jpeg') || (file.contentType === 'image/png') || (file.contentType === 'image/jpg') || (file.contentType === 'image/JPEG')) {
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            }
        }
    });
}

const resizerender = (req, res) => {
    gfs.files.findOne({ filename: req.params.key }, (err, file) => {
        //checking files
        if (!file || file.length === 0) {
            // return res.status(404).json({
            //     err: 'no file exist'
            // });
            console.log('no image found')
            res.sendFile('noImageFound.jpg', { root: path.join(__dirname, '../public/images') });
        }
        else {
            if ((file.contentType === 'image/jpeg') || (file.contentType === 'image/png') || (file.contentType === 'image/jpg') || (file.contentType === 'image/JPEG')) {
                const readstream = gfs.createReadStream(file.filename);
                var resizeTransform = sharp().resize(200);
                readstream.pipe(resizeTransform).pipe(res);
            }
        }
    });
}

const deletegfs = async (req,res)=>{
    var filename = req.params.id;
    await gfs.files.findOne({ filename: filename }, (err, file) => {
        if (!file || file.length === 0) {
            Biodata.deleteOne({photo1:filename},err=>{
                if (err) {
                res.send("photo deleted biodata not deleted");
              }
            })
            res.send("no file to delete")
        }
        })
   await gfs.remove({filename:filename, root:'uploads'},async(err,file)=>{
      if(file.length===0||!file){
        res.send("something went wrong")
      }
      else {
        await Biodata.deleteOne({photo1:filename},err=>{
            if (err) {
            res.send("photo deleted biodata not deleted");
          }
        })
        res.send("successfully deleted")
      }
    })
}


    


module.exports ={createBiodata,upload,gfsrender,deletegfs,resizerender}
