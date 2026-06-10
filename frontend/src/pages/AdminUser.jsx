// ユーザー管理ページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminUser() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const [showModal, setShowModal] = useState(false);
  const [targetId, setTargetId] = useState(null);

  // ユーザー一覧取得
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ユーザー削除
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("削除失敗");
    }
  };

  return (
    <div>
      <h1>ユーザー管理</h1>

      <button onClick={() => navigate("/admin")}>
        戻る
      </button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ユーザー名</th>
            <th>ロール</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button
                  onClick={() => {
                  setTargetId(user.id);
                  setShowModal(true);
                  }}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div>
          <p>本当に削除する？</p>

          <button
            onClick={async () => {
              await deleteSeat(targetId);
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

export default AdminUser;