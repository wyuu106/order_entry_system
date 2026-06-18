// Order画面の枠

import { useState } from "react";
import { Outlet } from "react-router-dom";

function Order() {
  const [cart, setCart] = useState([]);

  return (
    <Outlet context={{ cart, setCart }} />
  );
}

export default Order;