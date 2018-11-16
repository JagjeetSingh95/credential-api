const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Share = require('../models/share');
const authCheck = require('../middleware/auth-check');
const Credential = require('../models/credential');

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
    Share.find({userId: user_id})
         .select('credential sharedBy userId _id')
         .populate('credential', 'email title password description') //get info about product details
         .exec()
         .then(docs => {
            res.status(200).json({
                count: docs.length,
                share: docs.map(item => {
                    const { password } = item.credential;
                    let decryptedPassword = decrypt(password);
                    return {...(item._doc || {}), credential: {...(item._doc.credential || {})._doc, password: decryptedPassword}}
                })
            });
         })
         .catch(err => {
            console.log(err, "err")
            res.status(500).json({
                error: err
            })
         });
});

//handle post request
router.post('/', authCheck, (req, res, next) => {
    const JWT_KEY = "codingapp";
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_KEY);
    let user_id = decoded.userId;
    Credential.findById(req.body.credentialId)
           .then(credential => {
               if (!credential){
                   return res.status(404).json({
                       msg: 'Credential not found'
                   });
               }
                const share = new Share({
                    _id: mongoose.Types.ObjectId(),
                    credential: req.body.credentialId,
                    sharedBy: req.body.sharedBy,
                    userId: user_id
                });
                return share.save();
           })
           .then(result => {
             res.status(201).json(result);
            })
           .catch(err => {
            res.status(500).json({
                msg: 'Credential not found'
            })
        });
});

module.exports = router;