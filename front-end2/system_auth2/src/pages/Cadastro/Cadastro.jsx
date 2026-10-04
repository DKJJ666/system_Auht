import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api.js";
import FormEndereco from "../../components/FormEndereco.jsx";
import { ENDERECO_VAZIO } from "../../services/endereco.js";

function Cadastro() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [endereco, setEndereco] = useState(ENDERECO_VAZIO);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(ev) {
    ev.preventDefault();
    setSuccess("");
    setError("");

    try {
      await api.post("/cadastro", {
        username,
        email,
        password,
        endereco,
      });
      setSuccess(
        "Cadastro realizado com sucesso! Redirecionando para o login...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (erroRequisicao) {
      const mensagem =
        erroRequisicao.response?.data?.mensagem ||
        "Erro ao realizar cadastro. Tente novamente.";
      setError(mensagem);
    }
  }
  return (
    <div className="container">
      <h1>Cadastro</h1>
      <form onSubmit={handleSubmit}>

        <label>
          Nome
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <h2>Endereço</h2>
        <FormEndereco endereco={endereco} setEndereco={setEndereco} />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit">Cadastrar</button>
      </form>
      <p>
        Já tem conta? <Link to="/login">Fazer login</Link>
      </p>
    </div>
  );
}

export default Cadastro;
