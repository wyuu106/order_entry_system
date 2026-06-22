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
  const [isDrink, setIsDrink] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [editingMenuId, setEditingMenuId] = useState(null);

  const token = localStorage.getItem("token");
  
  /* lacation.search で送られてきたクエリパラメータを取得
  params = ?categoryId=${category.id} */
  const params = new URLSearchParams(location.search);

  // メニュー一覧取得
  const getMenus = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/admin/${categoryId}/menus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

  // 状態リセット用関数
  const resetForm = () => {
    setEditingMenuId(null);
    setMenuName("");
    setMenuPrice("");
    setIsDrink(false);
  };

  // メニュー作成
  const createMenu = async () => {
    try {
      await axios.post(
        "http://localhost:8000/admin/menu",
        {
          name: menuName,
          price: menuPrice === "" ? null : Number(menuPrice), // nullでも可
          category_id: Number(selectedCategory),
          is_drink: isDrink
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOpen(false)
      resetForm()
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
        `http://localhost:8000/admin/menu/${editingMenuId}`,
        {
          name: menuName,
          price: menuPrice === "" ? null : Number(menuPrice),
          category_id: Number(selectedCategory)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsOpen(false)
      resetForm()
      getMenus(selectedCategory);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // メニュー削除
  const deleteMenu = async (id) => {
    const ok = window.confirm(
      "本当にメニューを削除しますか？"
    )

    if (!ok) {
      return
    }

    try {
      await axios.delete(
        `http://localhost:8000/admin/menu/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getMenus(selectedCategory);
    
    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // メニュー復元
  const restoreMenu = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/admin/menu/restore/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

      <br />

      <button
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
      >
        メニュー追加
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
              {editingMenuId ? "メニュー編集" : "メニュー追加"}
            </h2>

            <div>
              <input
                placeholder="メニュー名"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
              />
            </div>

            <br />

            <div>
              <input
                type="number"
                placeholder="価格"
                value={menuPrice}
                onChange={(e) => setMenuPrice(e.target.value)}
              />
            </div>

            <br />

            <label>
              <input
                type="checkbox"
                checked={isDrink}
                onChange={(e) => setIsDrink(e.target.checked)}
              />
              ドリンク
            </label>

            <br />
            <br />

            <button
              onClick={async () => {
                if (editingMenuId) {
                  await updateMenu();
                } else {
                  await createMenu();
                }

                setIsOpen(false);
              }}
            >
              {editingMenuId ? "更新" : "追加"}
            </button>

            <button
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
            <th>メニュー名</th>
            <th>価格</th>
            <th>ドリンク</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {menus.map((menu) => (
            <tr key={menu.id}>
              <td>{menu.name}</td>

              <td>{menu.price}円</td>

              <td>{menu.is_drink ? "⚪︎" : "-"}</td>

              <td>
                <button
                  onClick={() => {
                    setEditingMenuId(menu.id);
                    setMenuName(menu.name);
                    setMenuPrice(menu.price);
                    setIsDrink(menu.is_drink);
                    setIsOpen(true);
                  }}
                >
                  編集
                </button>

                {/* 表示 or 非表示 */}
                <label>
                  <input
                    type="checkbox"
                    checked={menu.is_active}
                    onChange={() => {
                      if (menu.is_active) {
                        deleteMenu(menu.id);
                      } else {
                        restoreMenu(menu.id);
                      }
                    }}
                  />
                  表示
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMenu;