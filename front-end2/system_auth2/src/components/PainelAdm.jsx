function PainelAdm() {
  return (
    <div className="painel painel-admin">
      <h2>Painel do Administrador</h2>
      <p>Você está vendo esta tela pois o seu usuario tem o cargo (role) "admin"</p>
      <ul>
        <li>Gerenciar usuários</li>
        <li>Ver relatórios</li>
        <li>Configurações do sistema</li>
      </ul>
    </div>
  );
}
export default PainelAdm;