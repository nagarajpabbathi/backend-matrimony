const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const Biodata = require('./models/biodata');
const sharp = require('sharp');
const user = require('./models/user');
const { RSA_NO_PADDING } = require('constants');
var AWS = require('aws-sdk');
const biodata = require('./models/biodata');

const s3 = new AWS.S3({
    accessKeyId: 'AKIAIFBROWSLNHDB7SSA',
    secretAccessKey : '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'
})

const mongoURI ='mongodb+srv://nagarajpabbathi:Pabbathi123@testing.nej1j.mongodb.net/nagaraju?retryWrites=true&w=majority' ;
// create mongo connection
const conn = mongoose.createConnection(mongoURI,{ useNewUrlParser: true, useUnifiedTopology: true});

const storage = multer.memoryStorage({
    destination: function (req, files, callback) {
        callback(null, '')
    }
})

const upload = multer({ storage }).fields([
    { name: 'file' },
    {name:'file2'}
])


const createBiodata = async (req, res, next) => {
    var photo;
    var photo2;
    upload(req, res, async err => {
        var filename = Math.random().toString().substr(2, 5) + req.files.file[0].originalname;
        if (err) {
            console.log(err)
            res.send(false);
        }
        else {
            console.log(req.files)
            console.log(filename,'filename')
            const params = {
                Bucket: 'my-backend-images',
                Key: filename,
                Body: req.files.file[0].buffer
            }
            await s3.upload(params, async (err, datas3) => {
                if (err) {
                    console.log(err);
                    res.send(false)
                }
                else {
                    photo = datas3.Location;
                    console.log(photo)
        
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
                phone: req.body.phone,
                username: req.body.username,
                photo1: 'none',
                photo2: 'none',
                photo : photo,
                search: "none"
            });
            var height = req.body.height
            if (height.length == 3) {
                height = height + '0'
            }
            var search = req.body.gender.substring(0, 1) +    //1
                req.body.qualifyType.substring(0, 3) +        //2-4
                req.body.caste.substring(0, 2) +              //5-6
                req.body.jobtype.substring(0, 1) +            //7
                req.body.dob.substring(2, 4) +                //8-9
                req.body.height.substring(0, 1) +
                req.body.height.substring(2, 4) +             //10-11-12
                req.body.surname.substring(0, 1) +            //13
                req.body.name.substring(0, 2);
            search = search.toLowerCase();            //14-15
            createdBiodata.search = search;
                const result = createdBiodata.save();
                const getuser = await user.findOne({ username: req.body.username });
                if (getuser) {
                    const update = { searchkey: search };
                    await getuser.updateOne(update);
                    }
                    res.json({ res: true, search: search })  
                }


            })    
        }
    })
}
const updateBiodata = async (req, res, next) => {
    const searchid = req.params.searchid;
    const updatedData = req.body.updatedData;
    await Biodata.findOne({ search: searchid }, async(err, data) => {
        if (err) {
            res.send('try again later');
        }
        else {
            if (data) {
               await data.updateOne(updatedData);
                res.send('successfully updated..')
            }
            else {
                res.send('invalid search id..')
            }
        }
    })
}
    
const updatePhoto = async (req, res, next) => {
    console.log(req.body)


        upload(req, res, async err => {
            if (err) {
                console.log(err)
            }
            else {
                const searchid = req.params.searchid;
                const username = req.body.username;
                const password = req.body.password;
                if (username == 'username' && password == 'password') { 
                const biodata = await Biodata.findOne({ search: searchid });
                console.log(biodata)
                    let update = biodata;
                    update.photo1 = req.files.file[0].filename;
                if ((req.files.file2)) {
                    update.photo2 = req.files.file2[0].filename;
                }
                await biodata.updateOne(update);
                res.json({ res: true, des: 'successfully updated' })
                }
                else {
                    res.send('invalid credentials')
                }
            }
        })
    
  
}

const gfsrender = async(req, res) => {
    if (req.params.key == 'aldjl') {
        res.send(true)
    }
    Biodata.findOne({ search: req.params.key }).then((data) => {
        if (data) {
            gfs.files.findOne({ filename: data.photo1 }, (err, file) => {
                //checking files
               // console.log(file)
                if (!file || file.length === 0) {
                    res.send('noImageFound');
                }
                else {
                    if ((file.contentType === 'image/jpeg') || (file.contentType === 'image/png') || (file.contentType === 'image/jpg') || (file.contentType === 'image/JPEG')) {
                        const readstream = gfs.createReadStream(file.filename);
                        console.log(file)
                        var resizeTransform = sharp().resize(500);
                        readstream.pipe(resizeTransform).pipe(res);
                        //readstream.pipe(res);
                    }
                    else {
                        res.send('invalid image')
                    }
                }
            });
        }
        else {
            gfs.files.findOne({ filename: req.params.key }, (err, file) => {
                //checking files
                if (!file || file.length === 0) {
                    console.log('no image found')
                    res.send('noImageFound');
                }
                else {
                    if ((file.contentType === 'image/jpeg') || (file.contentType === 'image/png') || (file.contentType === 'image/jpg') || (file.contentType === 'image/JPEG')) {
                        const readstream = gfs.createReadStream(file.filename);               
                        var resizeTransform = sharp().resize(500);
                         readstream.pipe(resizeTransform).pipe(res);
                        //readstream.pipe(res);
                    }
                    else {
                        res.send('invalid image')
                    }
                }
            });
        }
    }).catch(() => {
        res.send('something went wrong');
    })
   
}

const sendaws = async(req, res) => {
  
    Biodata.find({ },{'photo1':1,'photo':1}).then(async(data) => {
        if (data) {
            console.log(data)
            for (let i = 0; i < data.length; i++) {
                if (data[i].photo) {
                }
                else {
                    console.log(data[i].photo1,' filename')
                gfs.files.findOne({ filename: data[i].photo1 }, (err, file) => {
                    //checking files
                    if (!file || file.length === 0) {
                        console.log('no image found')
                    }
                    else {
                        if ((file.contentType === 'image/jpeg') || (file.contentType === 'image/png') || (file.contentType === 'image/jpg') || (file.contentType === 'image/JPEG')) {
                            const readstream = gfs.createReadStream(file.filename);
                            var bufferArray = [];
                            var buffer;
                            //////////////////////////////
                            readstream.on('data', function (chunk) {
                                bufferArray.push(chunk);
                            });
                    
                            readstream.on('end', async function () {
                                buffer = Buffer.concat(bufferArray);
                                console.log(buffer)
                                const params = {
                                    Bucket: 'my-backend-images',
                                    Key: file.filename,
                                    Body: buffer
                                }
                                await s3.upload(params, async (err, datas3) => {
                                    if (err) {
                                        console.log(err, i)
                                    }
                                    else {
                                        //res.send(data)
                                        console.log(datas3)
                                        biodata.findOne({ photo1: data[i].photo1 }, async (err, databd) => {
                                            if (err) {
                                                console.log('error in updating photo url')
                                            }
                                            else {
                                                if (databd) {
                                                    await databd.updateOne({ photo: datas3.Location });
                                                    console.log(i, 'updated')

                                                }
                                            }
                                        })
                                    }
                                })
                            })
                        }
                        else {
                            res.send('invalid image')
                        }
                    }
                });
            }
        }
        }
        else {
           console.log('no photo1 array get')
        }
    }).catch(() => {
        res.send('something went wrong');
    })
   
}

const resizerender = async(req, res) => {
    await gfs.files.findOne({ filename: req.params.key }, async(err, file) => {
        //checking files
        if (!file || file.length === 0) {
            res.sendFile('noImageFound.jpg');
        }
        else {
            if ((file.contentType === 'image/jpeg') || (file.contentType === 'image/png') || (file.contentType === 'image/jpg') || (file.contentType === 'image/JPEG')) {
                const readstream = gfs.createReadStream(file.filename);
                var resizeTransform =sharp().resize(200);
                readstream.pipe(resizeTransform).pipe(res);
            }
            else {
                res.send('not an image')
            }
        }
    });
}

const deletegfs = async (req, res) => {
    let filename;
    const username = req.body.username;
    const password = req.body.password;
    const searchid = req.params.searchid;
    if (username == 'username' && password == 'password') {
        await Biodata.findOne({ search: searchid }, { 'photo1': 1 }, async(err, data) => {
            if (err) {
                res.send(err);
            }
            else {
                if (data) {
                    filename = data.photo1;
                    // await gfs.remove({ filename: filename, root: 'uploads' }, async (err, file) => {
                    //     if (file.length === 0 || !file) {
                    //         res.send("something went wrong")
                    //     }
                    //     else {
                    //         await Biodata.deleteOne({ photo1: filename }, err => {
                    //             if (err) {
                    //                 res.send("photo deleted biodata not deleted");
                    //             }
                    //             else {
                    //                 res.send("successfully deleted")
                    //             }
                    //         })
                    //     }
                    // })


                    await Biodata.deleteOne({ photo1: filename }, err => {
                                    if (err) {
                                        res.send(false);
                                    }
                                    else {
                                        res.send("successfully deleted")
                                     }
                                })
                }
                else{res.send('invalid search id')}
   
            }
        })
        
    }
}

const deletegfsimg = async (req, res) => {
    let filename;
    const username = req.body.username;
    const password = req.body.password;
    const searchid = req.params.searchid;
    if (username == 'username' && password == 'password') {
        await Biodata.findOne({ search: searchid }, { 'photo1': 1 }, async(err, data) => {
            if (err) {
                res.send(err);
            }
            else {
                if (data) {
                    filename = data.photo1;
                    await gfs.remove({ filename: filename, root: 'uploads' }, async (err, file) => {
                        console.log(file)
                        if (!file) {
                            res.send("no file found")
                        }
                        else {
                            await Biodata.findOne({ photo1: filename },async(err,data) => {
                                if (err) {
                                    res.send("photo deleted not inserted dummy one");
                                }
                                else {
                                    if (data) {
                                        let updatedata = data;
                                        updatedata.photo1 = 'nagaraj'
                                         await  data.updateOne(updatedata);
                                        res.send("successfully deleted")
                                    }
                                }
                            })
                        }
                    })
                }
                else{res.send('invalid search id')}
            }
        }) 
    }
}
const deletegfsimage = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const filename = req.params.filename;
    if (username == 'username' && password == 'password') {
        await gfs.remove({ filename: filename, root: 'uploads' }, async (err, file) => {
            console.log(file)
            if (!file) {
                res.send("no file found")
            }
            else {
                res.send("successfully deleted")
            }

        })
    }
   }

module.exports = {
    createBiodata, gfsrender,upload, deletegfs,
    resizerender, deletegfsimg, updatePhoto, deletegfsimage,
    updateBiodata,sendaws
}