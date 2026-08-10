import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (!window.confirm("ログアウトしますか？")) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <button className="menu-card menu-card-logout" onClick={handleLogout}>
      <strong>ログアウト</strong>
      <span>現在のアカウントからログアウトします</span>
    </button>
  );
}

export default LogoutButton;
