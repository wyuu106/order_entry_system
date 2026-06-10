// 席の状態に関するページ

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Order() {
  const navigate = useNavigate();

  const { seat_id } = useParams();

  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  const [menuId, setMenuId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [targetId, setTargetId] = useState(null);

  const token = localStorage.getItem("token");

  // セッション取得
  const fetchSession = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/seat_session/${seat_id}`,
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

    } catch (err) {
      console.log(err);
    }
  };

  // セッション作成
  const createSession = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/seat_session",
        {
          seat_id: Number(seat_id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(res.data);

    } catch (err) {
      console.log(err);
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

    } catch (err) {
      console.log(err);
    }
  };

  // 合計金額取得
  const fetchTotal = async (sessionId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/total?session_id=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTotal(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // オーダー追加
  const createOrder = async () => {
    try {
      await axios.post(
        "http://localhost:8000/order",
        {
          session_id: session.id,
          menu_id: Number(menuId),
          quantity: Number(quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchOrders(session.id);
      fetchTotal(session.id);

      setMenuId("");
      setQuantity(1);

    } catch (err) {
      console.log(err);
    }
  };

  // オーダー削除
  const deleteOrder = async (orderId) => {
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

    } catch (err) {
      console.log(err);
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

    } catch (err) {
      console.log(err);
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

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <div>
      <button onClick={() => navigate("/staff")}>
        戻る
      </button>

      <h2>注文画面</h2>

      <p>席ID : {seat_id}</p>

      {!session ? (
        <button onClick={createSession}>
          注文開始
        </button>
      ) : (
        <div>
          <h3>セッション情報</h3>

          <p>
            セッションID : {session.id}
          </p>

          <button onClick={endSession}>
            セッション終了
          </button>

          <hr />

          <h3>オーダー追加</h3>

          <input
            type="number"
            placeholder="menu_id"
            value={menuId}
            onChange={(e) => setMenuId(e.target.value)}
          />

          <input
            type="number"
            placeholder="数量"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <button onClick={createOrder}>
            追加
          </button>

          <hr />

          <h3>合計金額 : {total}円</h3>

          <hr />

          <h3>オーダー一覧</h3>

          {orders.length === 0 ? (
            <p>オーダーなし</p>
          ) : (
            <table border="1">
              <thead>
                <tr>
                  <th>注文者</th>
                  <th>商品</th>
                  <th>数量</th>
                  <th>金額</th>
                  <th>状態</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.user_name}</td>

                    <td>{order.menu_name}</td>

                    <td>{order.quantity}</td>

                    <td>{order.price}</td>

                    <td>{order.status}</td>

                    <td>
                      <button
                        onClick={() => {
                          setTargetId(order.id);
                          setShowModal(true);
                        }}
                      >
                        取り消し
                      </button>

                      <button
                        onClick={() => updatePrice(order.id)}
                      >
                        金額変更
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 削除モーダル */}
      {showModal && (
        <div>
          <p>本当に削除する？</p>

          <button
            onClick={async () => {
              await deleteOrder(targetId);
              setShowModal(false);
            }}
          >
            削除
          </button>

          <button onClick={() => setShowModal(false)}>
            キャンセル
          </button>
        </div>
      )}

    </div>
  );
}

export default Order;