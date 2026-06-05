// 管理者のページ

import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>管理者メニュー</h1>

      <button
        onClick={() => navigate("/admin/categories")}
      >
        メニュー設定
      </button>

      <br />

      <button
        onClick={() => navigate("/admin/seats")}
      >
        席の設定
      </button>

      <br />

      <button
        onClick={() => navigate("/admin/users")}
      >
        スタッフ設定
      </button>

      <br />

      <button
        onClick={() => navigate("/admin/requests")}
      >
        登録申請一覧
      </button>

    </div>
  );
}

export default Admin;