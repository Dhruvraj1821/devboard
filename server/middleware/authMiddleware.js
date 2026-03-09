import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({error: 'No token provided'});
        }
    
        const token = authHeader.split(' ')[1];
        

        const decoded = jwt.verify(token, process.env.JWT_SECRET);   

        const user = await User.findById(decoded.userId).select('-githubAccessToken');

        if(!user){
            return res.status(401).json({error: 'User not found'});
        }
        req.user = user;
       

        next();
    } catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({error: 'Token expired'});
        }
        if(error.name==='JsonWebTokenError'){
            return res.status(401).json({error: 'Invalid token'});
        }

        console.error('Auth middleware error : ', error.message);
        return res.status(500).json({error: 'Authentication error'});
    }
}

export default authMiddleware;