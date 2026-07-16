// 日本酒に関する画面

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";
import "../styles/button.css"

function Sake() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sakes, setSakes] = useState([]);

  const [sakeName, setSakeName] = useState("");
  const [remark, setRemark] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const [editingSakeId, setEditingSakeId] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 日本酒情報一覧取得
  const getSakes = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/sakes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSakes(res.data);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };
  
  // 画面表示時にgetMenusを実行
  useEffect(() => {
    getSakes()
  }, []);

  // 状態リセット用関数
  const resetForm = () => {
    setEditingSakeId(null);
    setSakeName("");
    setRemark("");
  };

  // 日本酒情報作成
  const createSake = async () => {
    try {
      await axios.post(
        `${API_URL}/sake`,
        {
          name: sakeName,
          remark: remark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOpen(false)
      resetForm()
      getSakes();
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 日本酒情報更新
  const updateSake = async () => {
    try {
      await axios.put(
        `${API_URL}/sake/${editingSakeId}`,
        {
          name: sakeName,
          remark: remark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOpen(false)
      resetForm()
      getSakes();
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 日本酒情報削除
  const deleteSake = async (id) => {
    const ok = window.confirm(
      "本当に日本酒の情報を削除しますか？"
    )

    if (!ok) {
      return
    }

    try {
      await axios.delete(
        `${API_URL}/sake/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getSakes();
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>日本酒情報</h1>

      <button
        className="button-base"
        onClick={() =>
          navigate(role === "admin" ? "/admin" : "/staff")
        }
      >
        戻る
      </button>

      <br />

      <button
        className="button-base button-primary"
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
      >
        日本酒追加
      </button>

      {/* 入力モーダル */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              minWidth: "350px",
            }}
          >
            <h2>
              {editingSakeId ? "編集" : "追加"}
            </h2>

            <div>
              <input
                placeholder="日本酒名"
                value={sakeName}
                onChange={(e) => setSakeName(e.target.value)}
              />
            </div>

            <br />

            <div>
              <input
                placeholder="説明"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            <br />
            <br />

            <button
              className="button-base button-primary"
              onClick={async () => {
                if (editingSakeId) {
                  await updateSake();
                } else {
                  await createSake();
                }

                setIsOpen(false);
              }}
            >
              {editingSakeId ? "更新" : "追加"}
            </button>

            <button
              className="button-base"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              style={{ marginLeft: "10px" }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 一覧 */}
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
            <th>日本酒名</th>
            <th>説明</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {sakes.map((sake) => (
            <tr key={sake.id}>
              <td>{sake.name}</td>

              <td>{sake.remark}</td>

              <td>
                <button
                  className="button-base"
                  onClick={() => {
                    setEditingSakeId(sake.id);
                    setSakeName(sake.name);
                    setRemark(sake.remark);
                    setIsOpen(true);
                  }}
                >
                  編集
                </button>

                <button
                  className="button-base button-danger"
                  onClick={() => deleteSake(sake.id)}
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

export default Sake;