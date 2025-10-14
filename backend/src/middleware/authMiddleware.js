const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {

    const token = req.headers.token.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
            return res.status(401).json({ status: "ERR", message: "Unauthorized" });
        }
        const { payload } = user;
        if (payload.isAdmin) {
            next();
        } else {
            return res.status(403).json({ status: "ERR", message: "Forbidden" });
        }

    })
}

module.exports = authMiddleware;