const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const JWT_KEY = "codingapp";
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            msg: 'Auth failed',
            error : error
        });
    }
};
