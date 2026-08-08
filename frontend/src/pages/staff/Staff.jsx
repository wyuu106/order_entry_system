// スタッフのページ

import { useNavigate } from "react-router-dom";
import "../Menu.css";

function Staff() {
  const navigate = useNavigate();

  return (
    <main className="menu-page">
      <header className="menu-page-header">
        <p>STAFF CONSOLE</p>
        <h1>スタッフメニュー</h1>
        <span>作業する項目を選んでください</span>
      </header>

      <nav className="menu-grid">

      <button
        className="menu-card menu-card-primary"
        onClick={() => navigate("/orders")}
      >
        <strong>オーダー一覧</strong>
        <span>注文の確認・提供状況の更新</span>
      </button>

      <button
        className="menu-card"
        onClick={() => navigate("/seats")}
      >
        <strong>席の状態確認</strong>
        <span>空席・使用中の切り替え</span>
      </button>

      <button
        className="menu-card"
        onClick={() => navigate("/sakes")}
      >
        <strong>日本酒情報</strong>
        <span>銘柄や説明を確認</span>
      </button>

      </nav>
    </main>
  );
}

export default Staff
