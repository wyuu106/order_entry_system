// 注文一覧画面

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function Orders() {

  const navigate = useNavigate();

  const [seatOrders, setSeatOrders] = useState([]);

  // 追加：通知キュー & 現在表示中
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  const wsRef = useRef(null);
  const prevQueueLength = useRef(0);

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

  // WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token");

    const ws = new WebSocket(
      `ws://localhost:8000/ws/orders?token=${token}`
    );

    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_order") {
        const order = data.order;

        // 一覧更新
        setSeatOrders((prev) =>
          prev.map((seat) => {
            if (seat.seat_id === order.seat_id) {
              return {
                ...seat,
                orders: [...seat.orders, order],
              };
            }
            return seat;
          })
        );

        // キューに追加
        setQueue((prev) => [...prev, order]);
      }
    };

    return () => ws.close();
  }, []);

  // 最初の１回だけ通知音
  useEffect(() => {
  if (prevQueueLength.current === 0 && queue.length > 0) {
    const audio = new Audio("/notification.mp3");
    audio.play();
  }

    prevQueueLength.current = queue.length;
  }, [queue]);

  // キュー制御（次を表示）
  const showNext = () => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;

      const [next, ...rest] = prev;
      setCurrent(next);
      return rest;
    });
  };

  // queueが来たら最初だけ表示開始
  useEffect(() => {
    if (!current && queue.length > 0) {
      showNext();
    }
  }, [current, queue]);

  // 席の表示順を id 順にソート
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

            <h2
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => navigate(`/orders/${seat.seat_id}`)}
            >
              {seat.seat_name}
            </h2>

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

                    {order.remark != null && (
                      <div
                        style={{
                          fontSize: "0.9em",
                          marginLeft: "10px"
                        }}
                      >
                        備考: {order.remark}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 追加注文のポップアップ */}
      {current && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "black",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            width: "260px",
          }}
        >
          <h4>新規注文</h4>

          <div>
            {current.menu_name} × {current.quantity}
          </div>

          {current.remark && (
            <div style={{ fontSize: "0.9em" }}>
              備考: {current.remark}
            </div>
          )}

          <button
            style={{ marginTop: "10px" }}
            onClick={() => {
              setCurrent(null);
              showNext();
            }}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;