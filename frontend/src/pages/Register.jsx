// ユーザー登録のページ

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";
import "../styles/button.css"
import "../styles/form.css"

function Register() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/register/request`,
        {
          name: name,
          password: password,
        }
      );

      alert("申請しました");

      // 入力欄を空にする
      setName("");
      setPassword("");

      navigate('/')
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">

        <input
          type="text"
          placeholder="ユーザー名"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="button-base button-primary"
          onClick={handleRegister}
        >
          申請する
        </button>

        <button
          className="button-base"
          onClick={() => navigate("/")}
        >
          ログイン画面へ戻る
        </button>
      </div>
    </div>
  );
}

export default Register;