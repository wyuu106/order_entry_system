// 席に関するページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function AdminSeat() {
  const navigate = useNavigate();

  const [seats, setSeats] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  const token = localStorage.getItem("token");

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

      // 席の表示順を id 順にソート
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

  // 席作成
  const createSeat = async () => {
    try {
      await axios.post(
        "http://localhost:8000/seat",
        {
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setName("");
      setShowCreate(false);
      getSeats();
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 席削除
  const deleteSeat = async (id) => {
    const ok = window.confirm(
      "本当に席を削除しますか？"
    )

    if (!ok) {
      return
    }

    try {
      await axios.delete(
        `http://localhost:8000/seat/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      <h1>席管理</h1>

      <button onClick={() => navigate("/admin")}>
        戻る
      </button>

      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
        >
          席を追加
        </button>
      )}

      {showCreate && (
        <div
          style={{
            border: "1px solid black",
            padding: "10px",
            marginTop: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>席追加</h3>

          <input
            placeholder="席名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <br />
          <br />

          <button onClick={createSeat}>
            登録
          </button>

          <button
            onClick={() => {
              setShowCreate(false);
              setName("");
            }}
          >
            キャンセル
          </button>
        </div>
      )}

      <hr />

      <h2>席一覧</h2>

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
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {seats.map((seat) => ( // mapは配列の要素を１つずつ処理
            <tr key={seat.id}>
              <td>{seat.name}</td>
              <td>{seat.status}</td>
              <td>
                <button
                  onClick={() => deleteSeat(seat.id)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminSeat;