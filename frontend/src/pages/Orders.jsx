// 注文一覧画面

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";

function Orders() {

  const navigate = useNavigate();

  const [seatOrders, setSeatOrders] = useState([]);

  // 通知キュー、現在表示中
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  const wsRef = useRef(null);
  const prevQueueLength = useRef(0);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 席ごとの注文一覧取得
  const getSeatOrders = async () => {

    try {
      const res = await axios.get(
        `${API_URL}/seat_orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // 席の表示を id 順にソート
      setSeatOrders(
        res.data.sort((a, b) => a.id - b.id)
      );

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
        const orderGroup = data.order;

        // 一覧更新
        setSeatOrders((prev) =>
          prev.map((seat) => {
            if (seat.seat_id === orderGroup.seat_id) {
              return {
                ...seat,
                orders: [
                  ...seat.orders,
                  ...orderGroup.orders,
                ],
              };
            }
            return seat;
          })
        );

        // キュー追加
        setQueue((prev) => [...prev, orderGroup]);
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

  // キューが来たら最初だけ表示開始
  useEffect(() => {
    if (!current && queue.length > 0) {
      showNext();
    }
  }, [current, queue]);

  // 提供状況変更
  const updateOrderStatus = async (order) => {
    const confirmed = window.confirm(
      order.status === "waiting"
        ? "この注文を提供済みにしますか？"
        : "この注文を未提供に戻しますか？"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
  
      const newStatus =
        order.status === "waiting"
          ? "served"
          : "waiting";

      await axios.put(
        `${API_URL}/order/${order.id}/status?status=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSeatOrders((prev) =>
        prev.map((seat) => ({
          ...seat,
          orders: seat.orders.map((o) =>
            o.id === order.id
              ? { ...o, status: newStatus }
              : o
          ),
        }))
      );
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>

      <h1>オーダー一覧</h1>

      <button onClick={() => 
        navigate(role === "admin" ? "/admin" : "/staff")
      }>
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

        {seatOrders.map((seat) => (
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
                      paddingBottom: "5px",
                      cursor: "pointer",
                      textDecoration: // CSS（ピンクの線）
                        order.status === "served"
                          ? "line-through"
                          : "none",
                      textDecorationColor: "deeppink",
                      textDecorationThickness: "3px",
                    }}
                    onClick={() => updateOrderStatus(order)}
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
      {current && 
       current.orders.some((order) => !order.is_drink) &&(
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "black",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            width: "300px",
          }}
        >
          <h4>
            新規注文（{current.seat_name}）
          </h4>

          {current.orders.map((order) => (
            <div
              key={order.id}
              style={{
                borderBottom: "1px solid gray",
                padding: "5px 0",
              }}
            >
              <div>
                {order.menu_name} × {order.quantity}
              </div>

              {order.remark && (
                <div style={{ fontSize: "0.9em" }}>
                  備考: {order.remark}
                </div>
              )}
            </div>
          ))}

          <button
            style={{ marginTop: "10px" }}
            onClick={() => {
              setCurrent(null);
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