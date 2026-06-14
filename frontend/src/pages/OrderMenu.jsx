// オーダー時のメニュー選択画面

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function OrderMenu() {
  const navigate = useNavigate();

  const { seatId, sessionId, categoryId } = useParams();

  const [menus, setMenus] = useState([]);

  // 選択中の商品一覧
  const [cart, setCart] = useState([]);

  // 数量選択モーダル用
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const token = localStorage.getItem("token");

  // メニュー一覧取得
  const getMenus = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/${categoryId}/menus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMenus(res.data);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  useEffect(() => {
    getMenus();
  }, []);

  // カート追加
  const addCart = () => {

    // 既にカートにあるか
    const exist = cart.find(
      (item) => item.menu_id === selectedMenu.id
    );

    if (exist) {

      // 数量加算
      setCart(
        cart.map((item) =>
          item.menu_id === selectedMenu.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        )
      );

    } else {

      // 新規追加
      setCart([
        ...cart,
        {
          menu_id: selectedMenu.id,
          name: selectedMenu.name,
          price: selectedMenu.price,
          quantity: quantity,
        },
      ]);
    }

    // モーダル閉じる
    setSelectedMenu(null);

    // 数量リセット
    setQuantity(1);
  };

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
            session_id: Number(sessionId),
            menu_id: item.menu_id,
            quantity: item.quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      alert("注文完了");

      navigate(`/orders/${seatId}`);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 合計金額
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
      }}
    >

      <button onClick={() => navigate(`/orders/${seatId}/${sessionId}/categories`)}>
        戻る
      </button>

      {/* 左側 メニュー一覧 */}
      <div style={{ flex: 1 }}>
        <h2>メニュー一覧</h2>

        {menus.length === 0 ? (
          <p>メニューなし</p>
        ) : (
          menus.map((menu) => (
            <div
              key={menu.id}
              style={{
                border: "1px solid black",
                marginBottom: "10px",
                padding: "10px",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedMenu(menu);
                setQuantity(1);
              }}
            >
              <p>{menu.name}</p>

              <p>{menu.price}</p>
            </div>
          ))
        )}
      </div>

      {/* 右側 注文一覧 */}
      <div
        style={{
          width: "300px",
          borderLeft: "2px solid black",
          paddingLeft: "20px",
        }}
      >
        <h2>選択中</h2>

        {cart.length === 0 ? (
          <p>未選択</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.menu_id}
              style={{
                borderBottom: "1px solid gray",
                marginBottom: "10px",
              }}
            >
              <p>{item.name}</p>

              <p>
                {item.quantity}個
              </p>

              <p>
                {item.price * item.quantity}円
              </p>
            </div>
          ))
        )}

        <hr />

        <h3>
          合計 : {totalPrice}円
        </h3>

        <button onClick={createOrders}>
          注文する
        </button>
      </div>

      {/* 数量選択モーダル */}
      {selectedMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              width: "300px",
            }}
          >
            <h2>{selectedMenu.name}</h2>

            <p>{selectedMenu.price}</p>

            <div>
              <button
                onClick={() => {
                  if (quantity > 1) {
                    setQuantity(quantity - 1);
                  }
                }}
              >
                -
              </button>

              <span style={{ margin: "0 10px" }}>
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            <hr />

            <button onClick={addCart}>
              決定
            </button>

            <button
              onClick={() => {
                setSelectedMenu(null);
                setQuantity(1);
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderMenu;