// オーダー時のメニュー選択画面

import { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext, } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";
import OrderCart from "../components/OrderCart";

function OrderMenu() {
  const navigate = useNavigate();

  const { seatId, sessionId, categoryId } = useParams();

  const [menus, setMenus] = useState([]);

  // 数量選択モーダル用
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [remark, setRemark] = useState("")

  const { cart, setCart } = useOutletContext();

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
  }, [categoryId]);

  // カート追加
  const addCart = () => {
    const normalizedRemark = remark.trim() || null;

    const exist = cart.find(
      (item) =>
        item.menu_id === selectedMenu.id &&
        item.remark === normalizedRemark
    );

    if (exist) {
      setCart(
        cart.map((item) =>
          item.menu_id === selectedMenu.id &&
          item.remark === normalizedRemark
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        )
      );

    } else {
      setCart([
        ...cart,
        {
          menu_id: selectedMenu.id,
          name: selectedMenu.name,
          price: selectedMenu.price,
          quantity: quantity,
          remark: normalizedRemark,
        },
      ]);
    }
    setSelectedMenu(null);
    setQuantity(1);
    setRemark("");
  };

  return (
    <div>
      <h1>メニュー選択</h1>
      
      <button onClick={() => navigate(`/orders/${seatId}/${sessionId}/categories`)}>
        戻る
      </button>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >

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
        
        {/* 右側（カート） */}
        <OrderCart cart={cart}/>

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

              <textarea
                placeholder="備考"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />

              <hr />

              <button onClick={addCart}>
                決定
              </button>

              <button
                onClick={() => {
                  setSelectedMenu(null);
                  setQuantity(1);
                  setRemark("")
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderMenu;