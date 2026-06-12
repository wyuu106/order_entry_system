import { BrowserRouter, Routes, Route } from "react-router-dom";

// 各ページのファイルをimport
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminOrder from "./pages/AdminOrder"
import AdminCategory from "./pages/AdminCategory"
import AdminMenu from "./pages/AdminMenu"
import AdminSeat from "./pages/AdminSeat";
import AdminUser from "./pages/AdminUser"
import AdminRequest from "./pages/AdminRequest"
import Staff from "./pages/Staff"
import Seat from "./pages/Seat"
import Order from "./pages/Order"
import OrderCategory from "./pages/OrderCategory"
import OrderMenu from "./pages/OrderMenu"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン */}
        <Route
          path="/" // URL
          element={<Login />} // page関数
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

        {/* 管理者画面 */}
        <Route
          path="/admin/orders"
          element={<AdminOrder />}
        />

        {/* メニュー管理 */}
        <Route
          path="/admin/categories"
          element={<AdminCategory />}
        />

        <Route
          path="/admin/menus"
          element={<AdminMenu />}
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

        {/* 登録申請一覧 */}
        <Route
          path="/admin/requests"
          element={<AdminRequest />}
        />

        {/* スタッフ画面 */}
        <Route
          path="/staff"
          element={<Staff />}
        />

        {/* 席画面 */}
        <Route
          path="/seats"
          element={<Seat />}
        />

        {/* オーダー画面 */}
        <Route
          path="/orders/:seatId"
          element={<Order />}
        />

        {/* オーダーカテゴリー画面 */}
        <Route
          path="/orders/:seatId/:sessionId/categories"
          element={<OrderCategory />}
        />

        {/* オーダーメニュー画面 */}
        <Route
          path="/orders/:seatId/:sessionId/menus/:categoryId"
          element={<OrderMenu />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;