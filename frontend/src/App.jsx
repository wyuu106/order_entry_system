import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";

// 各ページのファイルをimport
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Admin from "./pages/admin/Admin";
import AdminCategory from "./pages/admin/AdminCategory";
import AdminInactiveMenu from "./pages/admin/AdminInactiveMenu";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminRequest from "./pages/admin/AdminRequest";
import AdminSeat from "./pages/admin/AdminSeat";
import AdminUser from "./pages/admin/AdminUser";
import DaySales from "./pages/admin/DaySales";
import Staff from "./pages/staff/Staff";
import Order from "./pages/common/Order";
import OrderCategory from "./pages/common/OrderCategory";
import OrderHome from "./pages/common/OrderHome";
import OrderMenu from "./pages/common/OrderMenu";
import Orders from "./pages/common/Orders";
import Sake from "./pages/common/Sake";
import Seat from "./pages/common/Seat";
import BottomNav from "./components/BottomNav";

import "./pages/shared.css";

function AppContent() {
  const location = useLocation();
  const isAuthPage = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* ログイン */}
        <Route
          path="/login" // URL
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

        {/* 注文一覧画面 */}
        <Route
          path="/orders"
          element={<Orders />}
        />

        {/* カテゴリー管理 */}
        <Route
          path="/admin/categories"
          element={<AdminCategory />}
        />

        {/* メニュー管理 */}
        <Route
          path="/admin/menus"
          element={<AdminMenu />}
        />

        {/* 非表示メニュー管理 */}
        <Route
          path="/admin/inactive/menus"
          element={<AdminInactiveMenu />}
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

        {/* オーダー画面（cart情報を保持するために、各画面をOrderの管轄に入れる */}
        <Route path="/orders/:seatId" element={<Order />}>
          <Route index element={<OrderHome />} />
          <Route path=":sessionId/categories" element={<OrderCategory />} />
          <Route path=":sessionId/menus/:categoryId" element={<OrderMenu />} />
        </Route>

        {/* 売り上げ表 */}
        <Route
          path="/admin/day_sales"
          element={<DaySales />}
        />

        {/* 日本酒 */}
        <Route
          path="/sakes"
          element={<Sake />}
        />

      </Routes>
      {!isAuthPage && (
        <BottomNav key={location.pathname === "/orders" ? "orders" : "default"} />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
