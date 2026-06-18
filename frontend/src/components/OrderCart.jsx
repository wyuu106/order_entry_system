// 注文時のカートに関するcomponent

function OrderCart({
  cart,
  createOrders = null,
}) {
  return (
    <div
      style={{
        width: "300px",
        borderLeft: "2px solid black",
        paddingLeft: "20px",
      }}
    >
      <h2>選択中</h2>

      {cart.length === 0 ? (
        <p>未選択</p>
      ) : (
        cart.map((item) => (
          <div
            key={item.id}
            style={{
              borderBottom: "1px solid gray",
              marginBottom: "10px",
            }}
          >
            <p>{item.name}</p>

            <p>{item.quantity}個</p>

            {item.remark && (
              <p>備考: {item.remark}</p>
            )}
          </div>
        ))
      )}

      {createOrders && (
        <button onClick={createOrders}>
          注文する
        </button>
      )}
    </div>
  );
}

export default OrderCart;