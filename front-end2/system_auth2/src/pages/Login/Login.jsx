import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../../api.js";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    function finalizarLogin(dados) {
        localStorage.setItem("token", dados.token);
        localStorage.setItem("user", JSON.stringify(dados.usuario));

        setSuccess("Login realizado com sucesso! Redirecionando para o dashboard...");
        setTimeout(() => {
            navigate("/dashboard");
        }, 1500);
    }

    function mensagemDeErro(erroRequisicao, padrao) {
        const dados = erroRequisicao.response?.data;
        return dados?.mensagem || dados?.message || padrao;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        setError('')
        setSuccess('')

        try {
            const response = await api.post("/login", {
                email,
                password,
            });

            finalizarLogin(response.data);
        } catch (erroRequisicao) {
            setError(mensagemDeErro(erroRequisicao, "Erro ao realizar login."));
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        setError('')
        setSuccess('')

        try {
            const response = await api.post("/login/google", {
                credential: credentialResponse.credential,
            });

            finalizarLogin(response.data);
        } catch (erroRequisicao) {
            setError(mensagemDeErro(erroRequisicao, "Erro ao entrar com o Google."));
        }
    }

    function handleGoogleError() {
        setError("Não foi possível entrar com o Google. Tente novamente.");
    }

    return (
        <div className="container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Senha
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <button type="submit">Entrar</button>
            </form>

            <p>ou</p>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

            <p>
                Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
            </p>
        </div>
    );
}

export default Login;
