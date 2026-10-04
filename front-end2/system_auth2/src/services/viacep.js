
export async function buscarCep(cep) {
  const cepLimpo = String(cep).replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    throw new Error("CEP não encontrado");
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

  if (!resposta.ok) {
    throw new Error("CEP não encontrado");
  }

  const dados = await resposta.json();

  if (dados.erro) {
    throw new Error("CEP não encontrado");
  }


  return {
    cep: cepLimpo,
    logradouro: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    uf: dados.uf,
  };
}
