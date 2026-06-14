// オーダー時のカテゴリ選択画面

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function OrderCategory() {
  const navigate = useNavigate();
  const { seatId, sessionId } = useParams();
  
  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);

  // カテゴリ一覧
  const getCategories = async () => {
    try{
      const res = await axios.get(
        "http://localhost:8000/categories",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCategories(res.data);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 画面が最初に表示された時にgetCategoriesを実行
  useEffect(() => {
    getCategories();
  }, []);

  return(
    <div>
      <h1>カテゴリ一覧</h1>

      <button onClick={() => navigate(`/orders/${seatId}`)}>
        戻る
      </button>

      {/* 一覧 */}
      <table
        border="1"
        cellPadding="8"
        style={{
          margin: "0 auto",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead>
          <tr>
            <th>カテゴリ名</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>

              <td>
                <button
                  onClick={() =>
                    navigate(`/orders/${seatId}/${sessionId}/menus/${category.id}`)
                  }
                >
                  メニューを見る
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}

export default OrderCategory;