// オーダーのカテゴリ選択画面

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";
import OrderCart from "../components/OrderCart";

function OrderCategory() {
  const navigate = useNavigate();

  const { seatId, sessionId } = useParams();

  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);

  const [showCart, setShowCart] = useState(false);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  const { cart, setCart } = useOutletContext();

  // カテゴリー一覧取得
  const getCategories = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategories(
        res.data.sort((a, b) => a.id - b.id)
      );

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // 注文送信
  const createOrders = async () => {
    try {
      if (cart.length === 0) {
        alert("商品を選択してください");
        return;
      }

      await axios.post(
        `${API_URL}/order`,
        {
          session_id: sessionId,
          orders: cart.map((item) => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
            remark: item.remark,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("注文完了");

      setCart([]);

      navigate(`/orders/${seatId}`);
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: isMobile
          ? "90px"
          : "20px",
      }}
    >
      <h1>カテゴリー選択</h1>

      <button
        onClick={() =>
          navigate(`/orders/${seatId}`)
        }
        style={{
          marginBottom: "20px",
        }}
      >
        戻る
      </button>

      <div
        style={{
          display: "flex",
          gap: "30px",
          justifyContent: "center",
          alignItems: "flex-start",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* カテゴリー一覧 */}
        <div
          style={{
            flex: 1,
            maxWidth: "700px",
          }}
        >
          <h2>カテゴリー</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() =>
                  navigate(
                    `/orders/${seatId}/${sessionId}/menus/${category.id}`
                  )
                }
                style={{
                  minHeight: "110px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "white",
                  cursor: "pointer",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>

        {/* PC用カート */}
        {!isMobile && (
          <div
            style={{
              width: "350px",
              position: "sticky",
              top: "20px",
            }}
          >
            <OrderCart
              cart={cart}
              createOrders={createOrders}
            />
          </div>
        )}
      </div>

      {/* スマホ用カートボタン */}
      {isMobile && (
        <button
          onClick={() =>
            setShowCart(true)
          }
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform:
              "translateX(-50%)",
            width: "90%",
            height: "55px",
            border: "none",
            borderRadius: "12px",
            background: "#333",
            color: "white",
            fontSize: "18px",
            zIndex: 1000,
          }}
        >
          🛒 カートを見る（{cart.length}）
        </button>
      )}

      {/* スマホ用カートモーダル */}
      {showCart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            zIndex: 1001,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "400px",
              background: "white",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                カート
              </h2>

              <button
                onClick={() =>
                  setShowCart(false)
                }
              >
                ×
              </button>
            </div>

            <OrderCart
              cart={cart}
              createOrders={() => {
                createOrders();
                setShowCart(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderCategory;