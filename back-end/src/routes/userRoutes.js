import { Router } from "express"

import {
    cadastroUsuarios,
    login,
    loginGoogle,
    perfil,
    salvarEndereco
} from "../controllers/userControllers.js"

import verificarToken from "../middleware/auth.js"

const router = Router()


router.post("/cadastro", cadastroUsuarios)
router.post("/login", login)
router.post("/login/google", loginGoogle)


router.get("/perfil", verificarToken, perfil)
router.put("/endereco", verificarToken, salvarEndereco)


export default router
