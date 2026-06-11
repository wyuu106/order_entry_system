
function OrderMenu() {
  const navigate = useNavigate();

  const { sessionId, categoryId } = useParams();

  const [menus, setMenus] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const token = localStorage.getItem("token");

  // メニュー一覧取得
  const getMenus = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/${categoryId}/menus`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenus(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  
  // 画面が最初に表示された時にgetCategoriesを実行
  useEffect(() => {
    getMenus(categoryId);
  }, []);

  // オーダー追加
  const createOrder = async (menuId) => {
    try {
      await axios.post(
        "http://localhost:8000/order",
        {
          session_id: Number(sessionId),
          menu_id: Number(menuId),
          quantity: Number(quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("追加した");

      navigate("/seats");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2>メニュー一覧</h2>

      <div>
        <button
          onClick={() => {
            if (quantity > 1) {
              setQuantity(quantity - 1);
            }
          }}
        >
          -
        </button>

        <span style={{ margin: "0 10px" }}>
          {quantity}
        </span>

        <button
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </button>
      </div>

      <hr />

      {menus.length === 0 ? (
        <p>メニューなし</p>
      ) : (
        menus.map((menu) => (
          <div
            key={menu.id}
            style={{
              border: "1px solid black",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            <p>{menu.name}</p>

            <p>{menu.price}円</p>

            <button
              onClick={() => createOrder(menu.id)}
            >
              {quantity}個追加
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderMenu;