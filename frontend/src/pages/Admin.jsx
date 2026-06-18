// 管理者画面

import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  const menuStyle = {
    width: "300px",
    padding: "20px",
    margin: "10px 0",
    fontSize: "20px",
    textAlign: "center",
    border: "1px solid #ccc",
    cursor: "pointer",
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",   // 横中央
    height: "100vh",         // 画面いっぱい使う
  };

  return (
    <div style={containerStyle}>
      <h1>管理者メニュー</h1>

      <div
        style={menuStyle}
        onClick={() => navigate("/orders")}
      >
        注文一覧
      </div>

      <div
        style={menuStyle}
        onClick={() => navigate("/seats")}
      >
        注文
      </div>

      <div
        style={menuStyle}
        onClick={() => navigate("/admin/categories")}
      >
        メニュー設定
      </div>

      <div
        style={menuStyle}
        onClick={() => navigate("/admin/seats")}
      >
        席の設定
      </div>

      <div
        style={menuStyle}
        onClick={() => navigate("/admin/users")}
      >
        スタッフ設定
      </div>

      <div
        style={menuStyle}
        onClick={() => navigate("/admin/requests")}
      >
        登録申請一覧
      </div>
    </div>
  );
}

export default Admin;