import { useNavigate } from "react-router-dom";
import { disablePushNotifications } from "../utils/push_notification";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますか？")) return;

    try {
      await disablePushNotifications();
    } catch {
      // 通信できない場合も、ログアウト処理は継続する
    }

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
