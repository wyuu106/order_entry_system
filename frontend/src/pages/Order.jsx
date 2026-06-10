// オーダーページ

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Order() {
  const { seatId } = useParams();

  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);

  // セッション取得
  const getSession = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/seat_session/${seatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSession(response.data);
      getOrders(response.data.id);

    } catch (error) {
      console.log(error);

      setSession(null);
    }
  };

  // オーダー一覧取得
  const getOrders = async (sessionId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/orders/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(response.data);

    } catch (error) {
      console.log(error);
    }
  };
  
  // 提供状況変更
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `http://localhost:8000/order/status/${orderId}`,
        null,
        {
          params: {
            status: status,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      getOrders(session.id);

    } catch (error) {
      console.log(error);
    }
  };
  
  // オーダーの値段変更
  const updatePrice = async (orderId, price) => {
    try {
      await axios.put(
        `http://localhost:8000/order/price/${orderId}`,
        null,
        {
          params: {
            price: Number(price),
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      getOrders(session.id);

    } catch (error) {
      console.log(error);
    }
  };

  // セッション開始
  const createSession = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/seat_session",
        {
          seat_id: Number(seatId),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSession(response.data);

      setOrders([]);

    } catch (error) {
      console.log(error);
    }
  };

  // セッション終了、会計
  const endSession = async () => {
    try {
      await axios.put(
        `http://localhost:8000/seat_session/${session.id}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSession(null);

      setOrders([]);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  return (
    <div>
      <button onClick={() => navigate("/seats")}>
        戻る
      </button>

      <h2>席詳細</h2>

      {session ? (
        <div>
          <h3>
            {session.seat_name}
          </h3>

          <p>
            セッション開始時刻：
            {session.start_at}
          </p>

          <button onClick={endSession}>
            会計
          </button>

          <h3>オーダー一覧</h3>

          <table border="1">
            <thead>
              <tr>
                <th>商品名</th>
                <th>値段</th>
                <th>数量</th>
                <th>注文者</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.menu_name}</td>

                  <td>{order.price}</td>

                  <td>{order.quantity}</td>

                  <td>{order.user_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <p>
            現在セッションはありません
          </p>

          <button onClick={createSession}>
            注文開始
          </button>
        </div>
      )}
    </div>
  );
}

export default Order;