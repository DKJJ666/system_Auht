import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import PainelAdm from "../components/PainelAdm";
import PainelUsuario from "../components/PainelUsuario";
import MeusDados from "../components/MeusDados";


function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    function sair() {
        googleLogout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    return (
        <div className="container">
            <div className="topo-dashbord">
                <p>Bem-vindo, <strong>{user?.username}</strong>
                ({user?.role})</p>
                <button onClick={sair}>Sair</button>

                <MeusDados />

                {user?.role === "admin" ? <PainelAdm /> : <PainelUsuario />}
            </div>
        </div>
    );
}

export default Dashboard;
