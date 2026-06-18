// 席ごとのオーダー詳細に関するページ

import { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext, } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";
import OrderCart from "../components/OrderCart";

function OrderHome() {
  const navigate = useNavigate();

  const { seatId } = useParams();

  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  const { cart, setCart } = useOutletContext();

  const [errorMessage, setErrorMessage] = useState(null);

  const token = localStorage.getItem("token");

  // セッション取得
  const fetchSession = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/seat_session/${seatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(res.data);

      if (res.data) {
        fetchOrders(res.data.id);
        fetchTotal(res.data.id);
      }

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // セッション作成
  const createSession = async () => {
    try {
      console.log(seatId);

      const res = await axios.post(
        "http://localhost:8000/seat_session",
        {
          seat_id: Number(seatId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(res.data);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // オーダー一覧取得
  const fetchOrders = async (sessionId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/orders/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(res.data);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
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
            session_id: session.id,
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

      window.location.reload();

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 合計金額取得
  const fetchTotal = async (sessionId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/total/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTotal(res.data);
      setErrorMessage(null)

    } catch (error) {
      console.log(error);
      setErrorMessage(getErrorMessage(error));
    }
  };

  // オーダー削除
  const deleteOrder = async (orderId) => {
    const ok = window.confirm(
      "本当にオーダーを削除しますか？"
    )

    if (!ok) {
      return
    }

    try {
      await axios.delete(
        `http://localhost:8000/order?order_id=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders(session.id);
      fetchTotal(session.id);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 金額変更
  const updatePrice = async (orderId) => {
    const newPrice = prompt("新しい金額を入力");

    if (!newPrice) return;

    try {
      await axios.put(
        `http://localhost:8000/order/price/${orderId}?price=${newPrice}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders(session.id);
      fetchTotal(session.id);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // セッション終了
  const endSession = async () => {
    try {
      await axios.put(
        `http://localhost:8000/seat_session/${session.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("会計完了");

      setSession(null);
      setOrders([]);
      setTotal(0);

      navigate(`/seats/`)

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <div>
      <h1>注文画面</h1>

      <button onClick={() => navigate("/orders")}>
        戻る
      </button>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >

        {/* 左側 */}
        <div style={{ flex: 1 }}>
          <p>席名 : {session?.seat_name}</p>

          {!session ? (
            <button onClick={createSession}>
              注文開始
            </button>
          ) : (
            <div>
              <h3>セッション情報</h3>

              <button onClick={endSession}>
                セッション終了
              </button>

              <hr />

              <button onClick={() => navigate(`/orders/${seatId}/${session.id}/categories`)}>
                追加
              </button>

              <hr />

              <h3>合計金額 : {total}円</h3>

              <hr />

              <h3>オーダー一覧</h3>

              {orders.length === 0 ? (
                <p>オーダーなし</p>
              ) : (
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
                      <th>商品</th>
                      <th>数量</th>
                      <th>備考</th>
                      <th>金額</th>
                      <th>操作</th>
                      <th>注文者</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.menu_name}</td>

                        <td>{order.quantity}</td>

                        <td>{order.remark}</td>

                        <td>{order.price ?? "未設定"}</td>

                        <td>
                          <button
                            onClick={() => deleteOrder(order.id)}
                          >
                            取り消し
                          </button>

                          <button
                            onClick={() => updatePrice(order.id)}
                          >
                            金額変更
                          </button>
                        </td>

                        <td>{order.user_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
          )}

          {errorMessage && (
            <div
              style={{
                margin: "20px auto",
                width: "fit-content",
                padding: "10px 20px",
                border: "1px solid red",
                borderRadius: "5px",
                color: "red",
                backgroundColor: "#ffeaea",
                fontWeight: "bold",
              }}
            >
              {errorMessage}
            </div>
          )} 
        </div>

        {/* 右側（カート）*/}
        <OrderCart cart={cart} createOrders={createOrders}/>
      </div>
    </div>
  );
}

export default OrderHome;