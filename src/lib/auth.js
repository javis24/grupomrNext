import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        console.log('Token verified successfully:', decoded);
        req.user = decoded;
        next();
    });
};
