import { useState } from "react";

/* JavaScriptの関数
Reactでは、画面 = 関数 */
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // formData作成 -> サーバに送る用
  const handleLogin = async () => {
    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    // 指定されたURL（サーバ）にデータを送る -> resにサーバからのレスポンスを入れる
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    // resをJSが読める形に変換
    const data = await res.json();
    // 結果表示
    console.log(data);
  };

  // 画面に表示するUIを返す
  return (
    <div>
      <h1>ログイン</h1>

      <input
        placeholder="ユーザーネーム"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="パスワード"
        type="password" // パスワード形式の入力
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
}

// Login関数を他のファイルで使えるようにする
export default Login;