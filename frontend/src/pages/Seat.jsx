// 席の状態に関するページ

import { useEffect, useState } from "react";
import axios from "axios";

function Seat(){
  const [seats, setSeats] = useState([]);

  // 席一覧取得
  const getSeats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/seats"
      );

      setSeats(response.data);
    } catch (error) {
      console.log(error);
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
        `http://localhost:8000/seats/${seatId}`,
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
    }
  };

  return(
    <div>
      <h2>席一覧</h2>

      <table border="1">
        <thead>
          <tr>
            <th>席名</th>
            <th>状態</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {seats.map((seat) => ( // mapは配列の要素を１つずつ処理
            <tr key={seat.id}>
              <td>{seat.name}</td>
              <td>{seat.status}</td>
              <td>
                <select
                  value={seat.status}
                  onChange={(e) => {
                    updateSeatStatus(
                      seat.id,
                      e.target.value
                    );
                  }}
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