// オーダーのカテゴリ選択画面

import { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext, } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";
import OrderCart from "../components/OrderCart";

function OrderCategory() {
  const navigate = useNavigate();
  const { seatId, sessionId } = useParams();
  
  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);

  const { cart, setCart } = useOutletContext(); // cart を Outlet で定義

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

  // 注文送信
  const createOrders = async () => {
    try {

      if (cart.length === 0) {
        alert("商品を選択してください");
        return;
      }

      for (const item of cart) {

        await axios.post(
          "http://localhost:8000/order",
          {
            session_id: sessionId,
            menu_id: item.menu_id,
            quantity: item.quantity,
            remark: item.remark,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      alert("注文完了");

      setCart([]); // cartの中身を空にする

      navigate(`/orders/${seatId}`);  // 注文完了 -> 戻る

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return(
    <div>
      <h1>カテゴリー選択</h1>

      <button onClick={() => navigate(`/orders/${seatId}`)}>
        戻る
      </button>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >

        {/* 左側 カテゴリー一覧）*/}
        <div style={{ flex: 1 }}>
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
                        navigate(
                          `/orders/${seatId}/${sessionId}/menus/${category.id}`
                        )
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
        
        {/* 右側（カート表示）*/}
        <OrderCart cart={cart} createOrders={createOrders}/>
      </div>
    </div>
  );

}

export default OrderCategory;