const jwt = require('jsonwebtoken');
const SECRET_KEY = "secretkey";

console.log("middleware code is running");

module.exports = function(req, res, next) {
    try {
        const token = req.header('x-token');
        if (!token) {
            return res.status(401).json({ message: 'Token not found' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded.userid;
        req.uuid1=decoded.uuid1
        console.log("decoded in payload",decoded)
        console.log("uuid1 in middleware",req.uuid1)
        next();
    } catch (err) {
        res.status(500).json({ err: 'Internal Server Error' });
    }
}
