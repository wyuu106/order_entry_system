// ユーザー管理ページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function AdminUser() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // ユーザー一覧取得
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/users");
      setUsers(res.data);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ユーザー削除
  const deleteUser = async (id) => {
    const ok = window.confirm(
      "本当にユーザーを削除しますか？"
    )

    if (!ok) {
      return
    }

    try {
      await axios.delete(`http://localhost:8000/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
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
              <td>
                {user.role === "admin"
                  ? "管理者"
                  : user.role === "staff"
                  ? "スタッフ"
                  : user.role}
              </td>
              <td>
                <button
                  onClick={() => deleteUser(user.id)}
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

export default AdminUser;