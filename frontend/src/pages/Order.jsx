// Order画面の枠
// Order追加に関する画面では、ここで定義する card の状態を保持

import { useState } from "react";
import { Outlet } from "react-router-dom";

function Order() {
  const [cart, setCart] = useState([]);

  const increaseQuantity = (index) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (index) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0) // 数量0の注文を除く
    );
  }


  return (
    <Outlet
      context={{
        cart,
        setCart,
        increaseQuantity,
        decreaseQuantity,
      }}
    />
  );
}

export default Order;