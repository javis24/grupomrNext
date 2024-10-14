import jwt from 'jsonwebtoken';

export default function handler(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Incluir el email en el nuevo token de acceso
        const newAccessToken = jwt.sign(
            { id: user.id, role: user.role, email: user.email }, // Asegúrate de incluir el email aquí
            process.env.JWT_SECRET,
            { expiresIn: '1h' }  
        );

        res.json({ accessToken: newAccessToken });
    });
}
