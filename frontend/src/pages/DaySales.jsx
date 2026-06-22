// 売り上げ表画面

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";

function DaySales() {
  const navigate = useNavigate();

  const [targetDate, setTargetDate] = useState("");
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");

  const getDayOrders = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/day_orders`,
        {
          params: {
            target_date: targetDate,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>日別売上</h1>

      <button onClick={() => navigate("/admin")}>
        戻る
      </button>

      <br />

      <input
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
      />

      <button onClick={getDayOrders}>
        売上表示
      </button>

      {orders.map((session) => (
        <div
          key={session.session_id}
          style={{
            border: "1px solid black",
            marginTop: "20px",
            padding: "10px",
          }}
        >
          <h2>{session.seat_name}</h2>

          <p>
            {new Date(session.start_at).toLocaleTimeString()} ~{" "}
            {new Date(session.end_at).toLocaleTimeString()}
          </p>

          <p>
            合計売上: {session.total_sales}円
          </p>

          <table>
            <thead>
              <tr>
                <th>メニュー</th>
                <th>数量</th>
                <th>売上</th>
              </tr>
            </thead>

            <tbody>
              {session.orders.map((order) => (
                <tr key={`${session.session_id}-${order.menu_id}`}>
                  <td>{order.menu_name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.sales}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default DaySales;