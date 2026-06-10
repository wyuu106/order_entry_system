// メニューカテゴリに関するページ

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminCategory() {
  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [targetId, setTargetId] = useState(null);

  const navigate = useNavigate();

  // カテゴリ一覧
  const getCategories = async () => {
    try{
      const res = await axios.get(
        "http://localhost:8000/categories"
      );

      setCategories(res.data);
      } catch (error) {
      console.log(error);
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
        "http://localhost:8000/category",
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
      }
  };
  
  // カテゴリ更新
  const updateCategory = async () => {
    try{
      await axios.put(
        `http://localhost:8000/category/${editingCategoryId}`,
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
      }
  };

  // カテゴリ削除
  const deleteCategory = async (id) => {
    try{
      await axios.delete(
          `http://localhost:8000/category/${id}`,
          {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      getCategories();

      } catch (error) {
      console.log(error);
      }
  };

  return(
    <div>
      <h1>カテゴリ管理</h1>

      <button onClick={() => navigate("/admin")}>
        戻る
      </button>

      {/* 一覧 */}
      {categories.map((category) => (
        <div key={category.id}>
          <span>{category.name}</span>

          <button
            onClick={() => navigate(`/admin/menus?categoryId=${category.id}`)}
          >
            メニューを見る
          </button>

          <button
            onClick={() => {
              setEditingCategoryId(category.id);
              setCategoryName(category.name);
            }}
          >
            編集
          </button>

          <button
            onClick={() => {
              setTargetId(category.id);
              setShowModal(true);
            }}
          >
            削除
          </button>
        </div>  
      ))}

      <hr />

      {/* フォーム（新規・編集共通） */}
      <input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="名前"
      />

      <button onClick={editingCategoryId ? updateCategory : createCategory}>
        {editingCategoryId ? "更新" : "追加"}
      </button>

      {/* 削除モーダル */}
      {showModal && (
        <div>
          <p>本当に削除する？</p>

          <button
            onClick={async () => {
              await deleteCategory(targetId);
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

export default AdminCategory;