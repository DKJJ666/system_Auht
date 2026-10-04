import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

function verificarToken(req, res, next){
    const authHeader =  req.headers['authorization']
    if(!authHeader) return res.status(401).json({ message: "Token não fornecido"})

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, (err, userDecoded) => {
        if (err) return res.status(403).json({ message: "Token inválido ou expirado" })
        req.user = userDecoded
        next()
    })
}

export default verificarToken