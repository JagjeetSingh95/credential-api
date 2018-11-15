const express = require('express'); 
const router = express.Router(); 
const bcrypt = require('bcrypt');
const moment = require('moment');
const crypto = require('crypto');

const mongoose = require('mongoose');
const Credential = require('../models/credential');
const authCheck = require('../middleware/auth-check');
const jwt = require('jsonwebtoken');

function userId () {
    const JWT_KEY = "codingapp";
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_KEY);
    return decoded.userId;
}

function encrypt(text){
    var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
  
function decrypt(text){
    var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}


router.get('/', authCheck, (req, res, next) => {
    const JWT_KEY = "codingapp";
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_KEY);
    let user_id = decoded.userId;
        Credential.find({userId: user_id})
            .exec().then(response => {
                 res.status(200).json({
                    count: response.length,
                    response: response.map(item =>
                        {
                          return {...(item._doc), password : decrypt(item.password)};
                        })
                });
            }).catch(err => {
                res.status(200).json({response: err});
        });
});

router.post('/', authCheck, (req, res, next) => {
    const JWT_KEY = "codingapp";
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_KEY);
    let user_id = decoded.userId;

                const credential = new Credential({
                    _id: new mongoose.Types.ObjectId(),
                    userId: user_id,
                    title: req.body.title,
                    email: req.body.email,
                    password: encrypt(req.body.password),
                    description: req.body.description,
                    date: moment(new Date()).format('Do MMMM, YYYY')
                });
                credential.save().then(response => {
                    res.status(201).json({
                      msg: "Credential successfully uploaded!",
                      response: response
                    });
                }).catch(err => {
                      res.status(500).json({
                          error: err,
                          msg: 'error in credential'
                      });  
                    });
});


//get by id 
router.get('/:credentialId', authCheck, (req, res, next) => {
    const id = req.params.credentialId;
    Credential.findById(id)
        .exec().then(response => {
        res.status(200).json({response});
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

router.put('/:credentialId', authCheck, (req, res, next) => {
    const id = req.params.credentialId;
    const updateOps = {
        title: req.body.title,
        email: req.body.email,
        password: req.body.password,
        description: req.body.description
    };
    Credential.update({ _id: id }, { $set: updateOps })
            .exec()
            .then(response => {
                 res.status(200).json({
                response: response,
                 msg: 'Credential is updated!'
                });
            })
            .catch(err =>  res.status(500).json({error: err}));
   
});

//handle delete request
router.delete('/:credentialId', (req, res, next) => {
    Credential.remove({ _id: req.params.credentialId })
         .exec()
         .then(response => {
            res.status(200).json({
                msg: 'Credential deleted',
                response: response
            });
         })
         .catch(err => {
             res.status(500).json({
                 error: err
             });
         });
});

module.exports = router;
