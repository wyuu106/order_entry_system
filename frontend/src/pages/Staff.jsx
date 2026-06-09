// スタッフのページ

import { useNavigate } from "react-router-dom";

function Staff() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>スタッフメニュー</h1>

      <button
        onClick={() => navigate("/seats")}
      >
        注文
      </button>
    </div>
  );
}

export default Staff