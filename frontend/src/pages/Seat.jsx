// 席の状態に関するページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function Seat() {
  const [seats, setSeats] = useState([]);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  // 席一覧取得
  const getSeats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/seats",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 席の表示を id 順に表示
      setSeats(
        response.data.sort((a, b) => a.id - b.id)
      );

      setSeats(response.data);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // この画面が表示された時にgetSeats()を１度実行
  useEffect(() => {
    getSeats();
  }, []);

  // 席状態更新
  const updateSeatStatus = async (seatId, status) => {
    try {
      await axios.put(
        `http://localhost:8000/seat/${seatId}`,
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

      getSeats();
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>席一覧</h1>

      <button onClick={() => 
        navigate(
          role === "admin"
            ? "/admin"
            : "/staff"
        ) 
      }>
        戻る
      </button>

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
            <th>席名</th>
            <th>状態</th>
          </tr>
        </thead>

        <tbody>
          {seats.map((seat) => (
            <tr key={seat.id}>
              <td>
                <button
                  onClick={() => navigate(`/orders/${seat.id}`)}
                >
                  {seat.name}
                </button>
              </td>

              <td>
                <select
                  value={seat.status}
                  onChange={(e) =>
                    updateSeatStatus(
                      seat.id,
                      e.target.value
                    )
                  }
                >
                  <option value="empty">
                    空席（セットまだ）
                  </option>

                  <option value="available">
                    セット完了
                  </option>

                  <option value="occupied">
                    使用中
                  </option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Seat;