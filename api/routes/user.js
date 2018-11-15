const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const  authCheck = require('../middleware/auth-check');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .select('name email password _id ')
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    msg: 'Mail already exists!'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(response => {
                                res.status(201).json({
                                    msg: 'User successfully created!',
                                    response: response
                                })
                            })
                            .catch(err => {
                              res.status(500).json({
                                  error: err
                              });  
                            });
                    }
                });
            }
        });
   
});

router.get('/signup', authCheck, (req, res, next) => {
    User.find()
        .exec().then(response => {
            res.status(200).json({
                count: response.length,
                response: response
            });
        }).catch(err => {
            res.status(500).json({error: err});
        });
});

router.get('/:userId', authCheck, (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
        .exec().then(response => {
        res.status(200).json({response});
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

router.put('/:userId', authCheck, (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {
        name: req.body.name,
        email: req.body.email
    };
    User.update({ _id: id }, { $set: updateOps })
            .exec()
            .then(response => {
                 res.status(200).json({
                response: response,
                 msg: 'User is updated!'
                });
            })
            .catch(err =>  res.status(500).json({error: err}));
   
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    msg: 'Auth failed'
                });
            } 
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(404).json({
                        msg: 'Password worng!'
                    });
                }
                const JWT_KEY = "codingapp"
                if (result) {
                 const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, 
                    JWT_KEY, 
                    {
                        expiresIn: "1h"
                    },

                 );
                  return res.status(200).json({
                    msg: 'Auth successful',
                    token: token
                  });
                }
                return res.status(401).json({
                    msg: 'Auth failed'
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:userId', authCheck, (req, res, next) => {
    User.remove({ _id: req.params.userId })
         .exec()
         .then(response => {
            res.status(200).json({
                msg: 'user deleted',
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
