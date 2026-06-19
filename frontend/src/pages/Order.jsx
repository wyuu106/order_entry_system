// Order画面の枠
// Order追加に関する画面では、ここで定義する card の状態を保持

import { useState } from "react";
import { Outlet } from "react-router-dom";

function Order() {
  const [cart, setCart] = useState([]);

  return (
    <Outlet context={{ cart, setCart }} />
  );
}

export default Order;