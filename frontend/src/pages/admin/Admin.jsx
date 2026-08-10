// 管理者画面

import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import "../Menu.css";

function Admin() {
  const navigate = useNavigate();

  return (
    <main className="menu-page">
      <header className="menu-page-header">
        <h1>その他</h1>
        <span>確認・設定したい項目を選んでください</span>
      </header>

      <nav className="menu-grid">

      <button
        className="menu-card"
        onClick={() => navigate("/admin/day_sales")}
      >
        <strong>売り上げ表</strong>
        <span>日ごとの売上を確認</span>
      </button>

      <button
        className="menu-card"
        onClick={() => navigate("/admin/categories")}
      >
        <strong>メニュー設定</strong>
        <span>カテゴリー・商品を編集</span>
      </button>

      <button
        className="menu-card"
        onClick={() => navigate("/admin/seats")}
      >
        <strong>席の設定</strong>
        <span>席の追加・編集</span>
      </button>

      <button
        className="menu-card"
        onClick={() => navigate("/admin/users")}
      >
        <strong>スタッフ設定</strong>
        <span>ユーザー情報を管理</span>
      </button>

      <button
        className="menu-card"
        onClick={() => navigate("/admin/requests")}
      >
        <strong>登録申請一覧</strong>
        <span>新規アカウント申請を確認</span>
      </button>
      <LogoutButton />
      </nav>
    </main>
  );
}

export default Admin;
