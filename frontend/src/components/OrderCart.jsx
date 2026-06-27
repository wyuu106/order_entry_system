// 注文時のカートに関するcomponent

function OrderCart({
  cart,
  increaseQuantity,
  decreaseQuantity,
  createOrders = null,
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "350px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        カート
      </h2>

      {cart.length === 0 ? (
        <p>商品が選択されていません</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div
              key={`${item.menu_id}-${index}`}
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>{item.name}</strong>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => decreaseQuantity(index)}
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>

                  <span>{item.quantity}個</span>

                  <button
                    onClick={() => increaseQuantity(index)}
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  >
                    ＋
                  </button>
                </div>
              </div>

              {item.remark && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    margin: 0,
                  }}
                >
                  備考: {item.remark}
                </p>
              )}
            </div>
          ))}
        </>
      )}

      {createOrders && (
        <button
          onClick={createOrders}
          disabled={cart.length === 0}
          style={{
            width: "100%",
            height: "45px",
            border: "none",
            borderRadius: "8px",
            background:
              cart.length === 0
                ? "#ccc"
                : "#333",
            color: "white",
            fontSize: "16px",
            cursor:
              cart.length === 0
                ? "default"
                : "pointer",
          }}
        >
          注文する
        </button>
      )}
    </div>
  );
}

export default OrderCart;