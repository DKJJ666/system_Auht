import { useEffect, useState } from "react";
import api from "../../api.js";
import FormEndereco from "./FormEndereco.jsx";
import { ENDERECO_VAZIO, enderecoParaForm } from "../services/endereco.js";

function MeusDados() {

  const [dados, setDados] = useState(null);
  const [form, setForm] = useState(ENDERECO_VAZIO);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let ativo = true;

    api
      .get("/perfil")
      .then((resposta) => {
        if (ativo) setDados(resposta.data);
      })
      .catch((erroRequisicao) => {
        if (!ativo) return;
        const retorno = erroRequisicao.response?.data;
        setError(retorno?.mensagem || retorno?.message || "Erro ao carregar seus dados.");
      });

    return () => {
      ativo = false;
    };
  }, []);

  const endereco = dados?.endereco;

  function abrirEdicao() {
    setForm(enderecoParaForm(endereco));
    setSuccess("");
    setError("");
    setEditando(true);
  }

  async function handleSalvar(ev) {
    ev.preventDefault();
    setError("");
    setSuccess("");

    try {
      const resposta = await api.put("/endereco", form);
      setDados((anterior) => ({ ...anterior, endereco: resposta.data.endereco }));
      setEditando(false);
      setSuccess("Endereço salvo com sucesso!");
    } catch (erroRequisicao) {
      const retorno = erroRequisicao.response?.data;
      setError(retorno?.mensagem || retorno?.message || "Erro ao salvar o endereço.");
    }
  }

  if (!dados) {
    return (
      <section>
        <h2>Meus dados</h2>
        {error ? <p className="error">{error}</p> : <p>Carregando...</p>}
      </section>
    );
  }

  return (
    <section>
      <h2>Meus dados</h2>

      {dados.usuario?.foto && (
        <img
          src={dados.usuario.foto}
          alt="Foto do perfil"
          width="80"
          height="80"
          referrerPolicy="no-referrer"
          style={{ borderRadius: "50%" }}
        />
      )}
      <p><strong>Nome:</strong> {dados.usuario?.username}</p>
      <p><strong>E-mail:</strong> {dados.usuario?.email}</p>

      <h3>Endereço</h3>

      {editando || !endereco ? (
        <form
          onSubmit={(ev) => {

            handleSalvar(ev);
          }}
        >
          {!endereco && <p>Você ainda não cadastrou um endereço.</p>}
          <FormEndereco endereco={form} setEndereco={setForm} />
          <button type="submit">Salvar endereço</button>
          {endereco && (
            <button type="button" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          )}
        </form>
      ) : (
        <>
          <p>
            {endereco.logradouro}, {endereco.numero}
            {endereco.complemento ? ` - ${endereco.complemento}` : ""}
          </p>
          <p>
            {endereco.bairro} - {endereco.cidade}/{endereco.uf}
          </p>
          <p>CEP: {endereco.cep}</p>
          <button type="button" onClick={abrirEdicao}>Editar endereço</button>
        </>
      )}

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </section>
  );
}

export default MeusDados;
