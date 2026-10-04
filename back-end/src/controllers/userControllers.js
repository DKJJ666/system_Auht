import db from '../config/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)



export const gerarToken = (usuario) => {
    const payload = {
        id: usuario.id,
        username: usuario.username,
        role: usuario.role
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    )

    return { token, payload }
}

export const validarEndereco = (endereco) => {
    if (!endereco) return null

    const cep = String(endereco.cep || '').replace(/\D/g, '')
    const { logradouro, numero, complemento, bairro, cidade, uf } = endereco

    if (cep.length !== 8 || !logradouro || !numero || !bairro || !cidade || !uf) {
        return null
    }

    return {
        cep,
        logradouro,
        numero,
        complemento: complemento || null,
        bairro,
        cidade,
        uf: String(uf).toUpperCase()
    }
}


export const cadastroUsuarios = async (req, res) => {
    const { username, email, password, endereco } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios (username, email, password)" })
    }

    const enderecoValido = validarEndereco(endereco)
    if (!enderecoValido) {
        return res.status(400).json({ mensagem: "Endereço inválido ou incompleto" })
    }

    const conexao = await db.getConnection()

    try {
        const [existente] = await conexao.query("SELECT id FROM users WHERE email = ?", [email])
        if (existente.length > 0) {
            conexao.release()
            return res.status(409).json({ mensagem: "O e-mail informado já foi cadastrado anteriormente" })
        }


        const senhaCriptografada = await bcrypt.hash(password, 10)

        await conexao.beginTransaction()

        const [resultadoUser] = await conexao.query(
            "INSERT INTO users (username, email, password, role, provedor) VALUES (?, ?, ?, 'user', 'local')",
            [username, email, senhaCriptografada]
        )

        const usuarioId = resultadoUser.insertId

        await conexao.query(
            `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioId,
                enderecoValido.cep,
                enderecoValido.logradouro,
                enderecoValido.numero,
                enderecoValido.complemento,
                enderecoValido.bairro,
                enderecoValido.cidade,
                enderecoValido.uf
            ]
        )

        await conexao.commit() 
        conexao.release()

        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" })
    } catch (erro) {
        await conexao.rollback()
        conexao.release()
        console.error(erro)
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." })
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ mensagem: "Preencha e-mail e senha" })
        }

        const [resultado] = await db.query(
            "SELECT * FROM users WHERE email = ?", [email]
        )

        if (resultado.length === 0) {
            return res.status(401).json({ mensagem: "E-mail ou senha inválidos" })
        }

        const usuario = resultado[0]


        if (!usuario.password) {
            return res.status(400).json({ mensagem: "Esta conta foi criada com o Google. Use o botão 'Entrar com Google'" })
        }

        const senhaConfere = await bcrypt.compare(password, usuario.password)

        if (!senhaConfere) {
            return res.status(401).json({ mensagem: "E-mail ou senha inválidos" })
        }


        await db.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [usuario.id])

        const { token, payload } = gerarToken(usuario)

        return res.status(200).json({
            mensagem: "Login realizado com sucesso",
            token,
            usuario: payload
        })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ mensagem: "Erro ao realizar login" })
    }
}


export const loginGoogle = async (req, res) => {
    const { credential } = req.body

    if (!credential) {
        return res.status(400).json({ mensagem: "Token do Google não enviado" })
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const dadosGoogle = ticket.getPayload()

        if (!dadosGoogle.email_verified) {
            return res.status(401).json({ mensagem: "E-mail do Google não foi verificado" })
        }

        const [resultado] = await db.query(
            "SELECT * FROM users WHERE google_id = ? OR email = ?",
            [dadosGoogle.sub, dadosGoogle.email]
        )

        let usuario

        if (resultado.length > 0) {
            usuario = resultado[0]


            if (!usuario.google_id) {
                await db.query(
                    "UPDATE users SET google_id = ?, foto = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?",
                    [dadosGoogle.sub, dadosGoogle.picture || null, usuario.id]
                )
            } else {
                await db.query(
                    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
                    [usuario.id]
                )
            }
        } else {

            const [novo] = await db.query(
                `INSERT INTO users (username, email, password, role, google_id, foto, provedor, last_login)
                 VALUES (?, ?, NULL, 'user', ?, ?, 'google', CURRENT_TIMESTAMP)`,
                [dadosGoogle.name, dadosGoogle.email, dadosGoogle.sub, dadosGoogle.picture || null]
            )

            usuario = {
                id: novo.insertId,
                username: dadosGoogle.name,
                role: 'user'
            }
        }

        const { token, payload } = gerarToken(usuario)

        return res.status(200).json({
            mensagem: "Login com o Google realizado com sucesso",
            token,
            usuario: payload
        })

    } catch (erro) {
        console.error(erro)
        return res.status(401).json({ mensagem: "Não foi possível validar o login com o Google" })
    }
}


export const perfil = async (req, res) => {
    try {

        const usuarioId = req.user.id 

        const [dados] = await db.query(
            `SELECT u.id, u.username, u.email, u.role, u.foto, u.provedor, u.criado_em, u.last_login,
                    e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf
             FROM users u
             LEFT JOIN enderecos e ON u.id = e.usuario_id
             WHERE u.id = ?`,
            [usuarioId]
        )

        if (dados.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        const { cep, logradouro, numero, complemento, bairro, cidade, uf, ...usuario } = dados[0]
        const endereco = cep ? { cep, logradouro, numero, complemento, bairro, cidade, uf } : null

        return res.status(200).json({
            usuario,
            endereco
        })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ mensagem: "Erro ao carregar perfil" })
    }
}


export const salvarEndereco = async (req, res) => {
    try {
        const usuarioId = req.user.id

        const enderecoValido = validarEndereco(req.body)
        if (!enderecoValido) {
            return res.status(400).json({ mensagem: "Endereço inválido ou incompleto" })
        }

        await db.query(
            `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                cep = VALUES(cep),
                logradouro = VALUES(logradouro),
                numero = VALUES(numero),
                complemento = VALUES(complemento),
                bairro = VALUES(bairro),
                cidade = VALUES(cidade),
                uf = VALUES(uf)`,
            [
                usuarioId,
                enderecoValido.cep,
                enderecoValido.logradouro,
                enderecoValido.numero,
                enderecoValido.complemento,
                enderecoValido.bairro,
                enderecoValido.cidade,
                enderecoValido.uf
            ]
        )

        return res.status(200).json({
            mensagem: "Endereço salvo com sucesso",
            endereco: enderecoValido
        })
    } catch (erro) {
        console.error(erro)
        return res.status(500).json({ mensagem: "Erro ao salvar endereço" })
    }
}