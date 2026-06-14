// 管理者メニュー管理画面

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/error_util";

function AdminMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [menuName, setMenuName] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [editingMenuId, setEditingMenuId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [targetId, setTargetId] = useState(null);
  
  /* lacation.search で送られてきたクエリパラメータを取得
  params = ?categoryId=${category.id} */
  const params = new URLSearchParams(location.search);

  // メニュー一覧取得
  const getMenus = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/${categoryId}/menus`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenus(res.data);

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };
  
  // 画面表示時にgetMenusを実行
  useEffect(() => {
    // params.get("categoryId")でクエリパラメータの中身取得
    const categoryId = params.get("categoryId");

    if (categoryId) {
      setSelectedCategory(categoryId);
      getMenus(categoryId);
    }
  }, []);

  // メニュー作成
  const createMenu = async () => {
    try {
      await axios.post(
        "http://localhost:8000/menu",
        {
          name: menuName,
          price: menuPrice === "" ? null : Number(menuPrice),
          category_id: Number(selectedCategory)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuName("");
      setMenuPrice("");
      getMenus(selectedCategory);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // メニュー更新
  const updateMenu = async () => {
    try {
      await axios.put(
        `http://localhost:8000/menu/${editingMenuId}`,
        {
          name: menuName,
          price: menuPrice === "" ? null : Number(menuPrice),
          category_id: Number(selectedCategory)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setEditingMenuId(null);
      setMenuName("");
      setMenuPrice("");
      getMenus(selectedCategory);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // メニュー削除
  const deleteMenu = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8000/menu/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      getMenus(selectedCategory);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1>メニュー管理</h1>

      <button onClick={() => navigate("/admin/categories")}>
        戻る
      </button>

      {/* フォーム */}
      <div>
        <input
          placeholder="メニュー名"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
        />

        <input
          placeholder="価格"
          value={menuPrice}
          onChange={(e) => setMenuPrice(e.target.value)}
        />

        <button onClick={editingMenuId ? updateMenu : createMenu}>
          {editingMenuId ? "更新" : "追加"}
        </button>
      </div>

      <hr />

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
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {menus.map((menu) => (
            <tr key={menu.id}>
              <td>{menu.name}</td>

              <td>{menu.price}円</td>

              <td>
                <button
                  onClick={() => {
                    setEditingMenuId(menu.id);
                    setMenuName(menu.name);
                    setMenuPrice(menu.price);
                  }}
                >
                  編集
                </button>

                <button
                  onClick={() => {
                    setTargetId(menu.id);
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

      {/* 削除モーダル */}
      {showModal && (
        <div>
          <p>本当に削除する？</p>

          <button
            onClick={async () => {
              await deleteMenu(targetId);
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

export default AdminMenu;