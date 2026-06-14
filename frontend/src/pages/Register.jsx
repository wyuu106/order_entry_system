// ユーザー登録のページ

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("")

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/register/request",
        {
          name: name,
          password: password,
        }
      );

      setMessage(response.data.message);

      // 入力欄を空にする
      setName("");
      setPassword("");
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>ユーザー登録申請</h1>

      <div>
        <input
          type="text"
          placeholder="ユーザー名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <button onClick={handleRegister}>
          申請する
        </button>

        <button onClick={() => navigate("/")}>
        ログイン画面へ
        </button>
      </div>

      <p>{message}</p>
    </div>
  );
}

export default Register;