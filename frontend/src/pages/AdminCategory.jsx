// メニューカテゴリに関するページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api_util";
import { getErrorMessage } from "../utils/error_util";

function AdminCategory() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const token = localStorage.getItem("token");

  // カテゴリ一覧
  const getCategories = async () => {
    try{
      const res = await axios.get(
        `${API_URL}/admin/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // カテゴリーの表示を id 順にソート
      setCategories(
        res.data.sort((a, b) => a.id - b.id)
      );

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // 画面が最初に表示された時にgetCategoriesを実行
  useEffect(() => {
    getCategories();
  }, []);

  // カテゴリ作成
  const createCategory = async () => {
    try{
      await axios.post(
        `${API_URL}/admin/category`,
        {
          name: categoryName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategoryName("");
      getCategories();

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };
  
  // カテゴリ更新
  const updateCategory = async () => {
    try{
      await axios.put(
        `${API_URL}/admin/category/${editingCategoryId}`,
        {
          name: categoryName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingCategoryId(null);
      setCategoryName("");
      getCategories();

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // カテゴリ削除
  const inactiveCategory = async (id) => {
    const ok = window.confirm(
      "本当にカテゴリーを削除しますか？"
    )

    if (!ok) {
      return
    }

    try{
      await axios.put(
          `${API_URL}/category/${id}/inactive`,
          {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      getCategories();

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  // カテゴリ復元
  const activeCategory = async (id) => {
    try{
      await axios.put(
          `${API_URL}/admin/category/${id}/active`,
          {},
          {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      getCategories();

    } catch (error) {
      console.log(error);
      alert(getErrorMessage(error));
    }
  };

  return(
    <div>
      <h1>カテゴリ管理</h1>

      <button onClick={() => navigate("/admin")}>
        戻る
      </button>

      <br />

      {/* フォーム（追加・更新） */}
      <input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="名前"
      />

      {/* ボタン（追加・更新） */}
      <button onClick={editingCategoryId ? updateCategory : createCategory}>
        {editingCategoryId ? "更新" : "追加"}
      </button>

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
            <th>カテゴリ名</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td
                style={{
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                }}
                onClick={() =>
                  navigate(`/admin/menus?categoryId=${category.id}`)
                }
              >
                {category.name}
              </td>

              <td>
                {/* 編集 */}
                <button
                  onClick={() => {
                    setEditingCategoryId(category.id);
                    setCategoryName(category.name);
                  }}
                >
                  編集
                </button>
                
                {/* 表示 or 非表示 */}
                <label>
                  <input
                    type="checkbox"
                    checked={category.is_active}
                    onChange={() => {
                      if (category.is_active) {
                        inactiveCategory(category.id);
                      } else {
                        activeCategory(category.id);
                      }
                    }}
                  />
                  表示
                </label>
              </td>
            </tr>
          ))}

          {/* 非表示メニュー */}
          <tr>
            <td
              colSpan={2}
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
              onClick={() =>
                navigate("/admin/inactive/menus")
              }
            >
              非表示メニュー
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AdminCategory;