// 注文一覧画面

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, WS_URL } from "../../utils/api_util";
import { getErrorMessage } from "../../utils/error_util";
import "./Orders.css";

function Orders() {

  const navigate = useNavigate();

  const [seatOrders, setSeatOrders] = useState([]);

  // 通知キュー、現在表示中
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  const wsRef = useRef(null);
  const currentRef = useRef(null);

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
      `${WS_URL}/ws/orders?token=${token}`
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

        // キュー追加（最初の1件だけ通知音）
        setQueue((prev) => {
          if (prev.length === 0 && currentRef.current === null) {
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => {});
          }

          return [...prev, orderGroup];
        });
      }
    };

    return () => ws.close();
  }, []);

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

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

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
    <main className="orders-page">
      <header className="orders-header">
        <div>
          <h1>オーダー一覧</h1>
        </div>
      </header>

      <section className="orders-board" aria-label="席ごとの注文一覧">
        {seatOrders.length === 0 && (
          <p className="orders-empty-board">表示できる席がありません</p>
        )}

        {seatOrders.map((seat) => {
          const waitingCount = seat.orders.filter(
            (order) => order.status === "waiting"
          ).length;

          return (
            <article className="seat-lane" key={seat.seat_id}>
              <button
                className="seat-lane-header"
                onClick={() => navigate(`/orders/${seat.seat_id}`)}
              >
                <span>{seat.seat_name}</span>
                <span className="waiting-count">
                  未提供 {waitingCount}
                </span>
              </button>

              <div className="seat-orders">
                {seat.orders.length === 0 ? (
                  <p className="seat-empty">注文なし</p>
                ) : (
                  seat.orders.map((order) => (
                    <button
                      className={`order-ticket ${
                        order.status === "served" ? "is-served" : ""
                      }`}
                      key={order.id}
                      onClick={() => updateOrderStatus(order)}
                    >
                      <span className="order-menu-name">
                        {order.menu_name}
                      </span>

                      {order.remark?.trim() && (
                        <span className="order-remark">
                          （備考：{order.remark}）
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </article>
          );
        })}
      </section>
      
      {/* 追加注文のポップアップ */}
      {current && 
       current.orders.some((order) => !order.is_drink) &&(
        <aside className="new-order-popup" role="alert">
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
            className="button-base"
            onClick={() => {
              setCurrent(null);
            }}
          >
            次へ
          </button>
        </aside>
      )}
    </main>
  );
}

export default Orders;
