// 管理者、非表示メニュー管理画面

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";

function AdminInactiveMenu() {
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);

  const token = localStorage.getItem("token");

  // 非表示メニュー一覧取得
  const getInactiveMenus = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/inactive/menus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // メニューの表示を id 順にソート
      setMenus(
        res.data.sort((a, b) => a.id - b.id)
      );

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 画面が最初に表示された時にgetCategoriesを実行
  useEffect(() => {
    getInactiveMenus();
  }, []);

  // メニュー復元
  const activeMenu = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/menu/${id}/active`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await getInactiveMenus();
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>非表示メニュー管理</h1>

      <button onClick={() => navigate("/admin/categories")}>
        戻る
      </button>

      <br />

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
            <th>メニュー名</th>
            <th>価格</th>
            <th>カテゴリー</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {menus.length === 0 ? (
            <tr>
              <td colSpan={4}>
                非表示メニューはありません
              </td>
            </tr>
          ) : (
            menus.map((menu) => (
              <tr key={menu.id}>
                <td>{menu.name}</td>

                <td>
                  {menu.price === null
                    ? "未設定"
                    : `${menu.price}円`
                  }
                </td>

                <td>{menu.category_name}</td>

                <td>
                  {/* 表示  */}
                  <button
                    onClick={() => activeMenu(menu.id)}
                  >
                    表示
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminInactiveMenu;