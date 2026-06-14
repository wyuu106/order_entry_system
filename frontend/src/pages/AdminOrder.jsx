// 注文一覧画面

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function Orders() {

  const navigate = useNavigate();

  const [seatOrders, setSeatOrders] = useState([]);

  // 席ごとの注文一覧取得
  const getSeatOrders = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:8000/seat_orders",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSeatOrders(response.data);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  useEffect(() => {
    getSeatOrders();
  }, []);

  const sortedSeats = [...seatOrders].sort(
    (a, b) => Number(a.seat_id) - Number(b.seat_id)
  );

  return (
    <div>

      <h1>オーダー一覧</h1>

      <button onClick={() => navigate("/admin")}>
        戻る
      </button>

      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
          marginTop: "20px"
        }}
      >

        {sortedSeats.map((seat) => (

          <div
            key={seat.seat_id}
            style={{
              minWidth: "150px"
            }}
          >

            <h2>{seat.seat_name}</h2>

            {seat.orders.length === 0 ? (

              <p>注文なし</p>

            ) : (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >

                {seat.orders.map((order) => (

                  <div
                    key={order.id}
                    style={{
                      borderBottom: "1px solid gray",
                      paddingBottom: "5px"
                    }}
                  >

                    {order.menu_name} × {order.quantity}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;