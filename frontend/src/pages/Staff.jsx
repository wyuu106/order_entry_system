// スタッフのページ

import { useNavigate } from "react-router-dom";

function Staff() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>スタッフメニュー</h1>

      <button
        onClick={() => navigate("/orders")}
      >
        注文
      </button>

      <br />

      <button
        onClick={() => navigate("/seats")}
      >
        席の状態
      </button>

    </div>
  );
}

export default Staff