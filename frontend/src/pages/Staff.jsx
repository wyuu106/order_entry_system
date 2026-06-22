// スタッフのページ

import { useNavigate } from "react-router-dom";

function Staff() {
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
      <h1>スタッフメニュー</h1>

      <div
        style={menuStyle}
        onClick={() => navigate("/orders")}
      >
        注文
      </div>

      <div
        style={menuStyle}
        onClick={() => navigate("/seats")}
      >
        席の状態確認
      </div>

      <div
        style={menuStyle}
        onClick={() => navigate("/sakes")}
      >
        日本酒情報
      </div>

    </div>
  );
}

export default Staff