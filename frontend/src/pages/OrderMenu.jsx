// オーダーのメニュー選択画面

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

function OrderMenu() {
  const navigate = useNavigate();

  const { seatId, sessionId, categoryId } = useParams();

  const [menus, setMenus] = useState([]);

  // 数量選択モーダル
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [remark, setRemark] = useState("");

  // スマホ用カート
  const [showCart, setShowCart] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  const {
    cart,
    setCart,
    increaseQuantity,
    decreaseQuantity,
  } = useOutletContext();

  const token = localStorage.getItem("token");

  // メニュー一覧取得
  const getMenus = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/${categoryId}/active/menus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMenus(
        res.data.sort((a, b) => a.id - b.id)
      );

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  useEffect(() => {
    getMenus();
  }, [categoryId]);

  // 画面幅監視
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

  // カート追加
  const addCart = () => {
    const normalizedRemark =
      remark.trim() || null;

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
                quantity:
                  item.quantity + quantity,
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
      <h1>メニュー選択</h1>

      <button
        onClick={() =>
          navigate(
            `/orders/${seatId}/${sessionId}/categories`
          )
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
        {/* メニュー一覧 */}
        <div
          style={{
            flex: 1,
            maxWidth: "700px",
          }}
        >
          <h2>メニュー一覧</h2>

          {menus.length === 0 ? (
            <p>メニューなし</p>
          ) : (
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
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  onClick={() => {
                    setSelectedMenu(menu);
                    setQuantity(1);
                    setRemark("");
                  }}
                  style={{
                    minHeight: "110px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "20px",
                    background: "white",
                    cursor: "pointer",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent:
                      "center",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px",
                    }}
                  >
                    {menu.name}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "18px",
                    }}
                  >
                    {menu.price}
                  </p>
                </div>
              ))}
            </div>
          )}
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
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
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
          カートを見る（{cart.length}）
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
              <h2
                style={{
                  margin: 0,
                }}
              >
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
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              createOrders={() => {
                createOrders();
                setShowCart(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 数量選択モーダル */}
      {selectedMenu && (
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
            zIndex: 1002,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "350px",
              background: "white",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h2>{selectedMenu.name}</h2>

            <p>
              ¥{selectedMenu.price}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => {
                  if (quantity > 1) {
                    setQuantity(
                      quantity - 1
                    );
                  }
                }}
              >
                −
              </button>

              <span
                style={{
                  fontSize: "20px",
                }}
              >
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(
                    quantity + 1
                  )
                }
              >
                ＋
              </button>
            </div>

            <textarea
              placeholder="備考"
              value={remark}
              onChange={(e) =>
                setRemark(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                minHeight: "80px",
                marginBottom: "20px",
                boxSizing:
                  "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={addCart}
                style={{
                  flex: 1,
                }}
              >
                決定
              </button>

              <button
                onClick={() => {
                  setSelectedMenu(
                    null
                  );
                  setQuantity(1);
                  setRemark("");
                }}
                style={{
                  flex: 1,
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderMenu;