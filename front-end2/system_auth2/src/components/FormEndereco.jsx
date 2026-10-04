import { useState } from "react";
import { buscarCep } from "../services/viacep.js";


function FormEndereco({ endereco, setEndereco }) {
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState("");

  function atualizarCampo(campo, valor) {
    setEndereco((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function handleCepChange(ev) {
    const apenasNumeros = ev.target.value.replace(/\D/g, "").slice(0, 8);
    atualizarCampo("cep", apenasNumeros);
    setErroCep("");

  
    if (apenasNumeros.length === 8) {
      setBuscando(true);
      try {
        const dados = await buscarCep(apenasNumeros);
        setEndereco((anterior) => ({
          ...anterior,
          cep: dados.cep,
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.cidade,
          uf: dados.uf,
        }));
      } catch (erro) {
        setErroCep(erro.message || "CEP não encontrado");
      } finally {
        setBuscando(false);
      }
    }
  }

  return (
    <>
      <label>
        CEP
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="Somente números"
          value={endereco.cep}
          onChange={handleCepChange}
          required
        />
      </label>
      {buscando && <p>Buscando CEP...</p>}
      {erroCep && <p className="error">{erroCep}</p>}

      <label>
        Logradouro
        <input
          type="text"
          value={endereco.logradouro}
          onChange={(e) => atualizarCampo("logradouro", e.target.value)}
          required
        />
      </label>
      <label>
        Número
        <input
          type="text"
          value={endereco.numero}
          onChange={(e) => atualizarCampo("numero", e.target.value)}
          required
        />
      </label>
      <label>
        Complemento
        <input
          type="text"
          value={endereco.complemento}
          onChange={(e) => atualizarCampo("complemento", e.target.value)}
        />
      </label>
      <label>
        Bairro
        <input
          type="text"
          value={endereco.bairro}
          onChange={(e) => atualizarCampo("bairro", e.target.value)}
          required
        />
      </label>
      <label>
        Cidade
        <input
          type="text"
          value={endereco.cidade}
          onChange={(e) => atualizarCampo("cidade", e.target.value)}
          required
        />
      </label>
      <label>
        UF
        <input
          type="text"
          maxLength={2}
          value={endereco.uf}
          onChange={(e) => atualizarCampo("uf", e.target.value.toUpperCase())}
          required
        />
      </label>
    </>
  );
}

export default FormEndereco;
