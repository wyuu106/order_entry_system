// ログインページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // ユーザー一覧取得
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("http://localhost:8000/users");
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", selectedUserId); // formdataのusernameにidを入れる
      formData.append("password", password);

      const res = await axios.post(
        "http://localhost:8000/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);

      navigate(res.data.role === "admin" ? "/admin" : "/staff");

    } catch (error) {
      alert(error.response.data.detail);
    }
  };

  return (
    <div>
      <h1>ログイン</h1>

      {/* ユーザー選択 */}
      <select
        value={selectedUserId}
        onChange={(e) => {
          setSelectedUserId(e.target.value);
          setPassword(""); // ユーザー変えたらリセット
        }}
      >
        <option value="">ユーザーを選択</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <br />

      {/* ユーザー選択でパスワード表示 */}
      {selectedUserId && (
        <>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>ログイン</button>
        </>
      )}
    </div>
  );
}

export default Login;