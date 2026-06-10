// ユーザー登録申請に関するページ

import { useEffect, useState } from "react";
import axios from "axios";

function AdminRequest() {
  const [requests, setRequests] = useState([]);

  const token = localStorage.getItem("token");

  // 申請一覧取得
  const getRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/requests",
        {
          headers: {
          Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setRequests(response.data);

    } catch (error) {
      console.log(error);
    }
  };
    
    // 画面が最初に表示された時にgetRequestsを実行
    useEffect(() => {
      getRequests();
    }, []);

  // 申請許可
  const approveRequest = async (id) => {
    try{
      await axios.post(
        "http://localhost:8000/register/approve",
        null,
        {
          params: {
            request_id: id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getRequests();

      } catch (error) {
      console.log(error);
      }
  };

  // 申請却下
  const rejectRequest = async (id) => {
    try{
      await axios.post(
        "http://localhost:8000/register/reject",
        null,
        {
          params: {
            request_id: id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getRequests();

      } catch (error) {
      console.log(error);
      }
  };

  return (
    <div>
      <button onClick={() => navigate("/admin")}>
        戻る
      </button>
      
      <h1>ユーザー登録申請一覧</h1>

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