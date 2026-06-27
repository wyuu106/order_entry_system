import { BrowserRouter, Routes, Route } from "react-router-dom";

// 各ページのファイルをimport
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders"
import AdminCategory from "./pages/AdminCategory"
import AdminMenu from "./pages/AdminMenu"
import AdminInactiveMenu from "./pages/AdminInactiveMenu"
import AdminSeat from "./pages/AdminSeat";
import AdminUser from "./pages/AdminUser"
import AdminRequest from "./pages/AdminRequest"
import Staff from "./pages/Staff"
import Seat from "./pages/Seat"
import Order from "./pages/Order"
import OrderHome from "./pages/OrderHome"
import OrderCategory from "./pages/OrderCategory"
import OrderMenu from "./pages/OrderMenu"
import DaySales from "./pages/DaySales"
import Sake from "./pages/Sake"

import OrderCart from "./components/OrderCart"

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
    </BrowserRouter>
  );
}

export default App;