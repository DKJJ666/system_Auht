
export const ENDERECO_VAZIO = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};


export function enderecoParaForm(endereco) {
  return {
    ...ENDERECO_VAZIO,
    ...Object.fromEntries(
      Object.entries(endereco || {}).map(([chave, valor]) => [chave, valor ?? ""])
    ),
  };
}
