function PainelUsuario() {
  return (
    <div className="painel painel-usuario">
      <h2>Painel do Usuário</h2>
      <p>Você está vendo esta tela pois o seu usuario tem o cargo (role) "user"</p>
      <ul>
        <li>Meu Perfil</li>
        <li>Meus Pedidos</li>
        <li>Preferências</li>
      </ul>
    </div>
  );
}
export default PainelUsuario;