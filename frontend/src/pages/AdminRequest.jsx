// ユーザー登録申請に関するページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";

function AdminRequest() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  const token = localStorage.getItem("token");

  // 申請一覧取得
  const getRequests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/requests`,
        {
          headers: {
          Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setRequests(response.data);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };
    
    // 画面が最初に表示された時にgetRequestsを実行
    useEffect(() => {
      getRequests();
    }, []);

  // 申請許可
  const approveRequest = async (id) => {
    const ok = window.confirm(
      "本当に申請を許可しますか？"
    )

    if (!ok) {
      return
    }

    try{
      await axios.post(
        `${API_URL}/register/approve/${id}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getRequests();

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 申請却下
  const rejectRequest = async (id) => {
    const ok = window.confirm(
      "本当に申請を却下しますか？"
    )

    if (!ok) {
      return
    }

    try{
      await axios.put(
        `${API_URL}/register/reject/${id}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getRequests();

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>ユーザー登録申請一覧</h1>

      <button onClick={() => navigate("/admin")}>
        戻る
      </button>

      {requests.length === 0 ? (
        <p>申請はありません</p>
      ) : (
        requests.map((request) => (
          <div
            key={request.id}
            style={{
              border: "1px solid black",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>ユーザー名: {request.name}</p>

            <button
              onClick={() => approveRequest(request.id)}
            >
              許可
            </button>

            <button
              onClick={() => rejectRequest(request.id)}
              style={{ marginLeft: "10px" }}
            >
              却下
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminRequest;