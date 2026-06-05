import { BrowserRouter, Routes, Route } from "react-router-dom";

// 各ページのファイルをimport
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminMenu from "./pages/AdminMenu"
import AdminSeat from "./pages/AdminSeat";
import AdminUser from "./pages/AdminUser"
import AdminRequest from "./pages/AdminRequest"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン */}
        <Route
          path="/" // URL
          element={<Login />} // pageファイル
        />

        {/* ユーザー登録 */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* 管理者画面 */}
        <Route
          path="/admin"
          element={<Admin />}
        />

        {/* メニュー管理 */}
        <Route
          path="/admin/categories"
          element={<AdminCategory />}
        />

        {/* 席情報管理 */}
        <Route
          path="/admin/seats"
          element={<AdminSeat />}
        />

        {/* ユーザー管理 */}
        <Route
          path="/admin/users"
          element={<AdminUser />}
        />

        {/* 登録申請 */}
        <Route
          path="/admin/requests"
          element={<AdminRequest />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;