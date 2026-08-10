import { NavLink } from "react-router-dom";

import "./BottomNav.css";

const icons = {
  orders: (
    <path d="M6 3.75h12a1.5 1.5 0 0 1 1.5 1.5v15l-3-2-3 2-3-2-3 2-3-2v-12A1.5 1.5 0 0 1 6 3.75Zm2.25 4.5h7.5m-7.5 4h7.5" />
  ),
  seats: (
    <path d="M6 10.5V7.25a2.25 2.25 0 0 1 4.5 0v3.25h3V7.25a2.25 2.25 0 0 1 4.5 0v3.25m-14.25 0v5.25h16.5V10.5M6 15.75v3m12-3v3" />
  ),
  sake: (
    <path d="M9 3.75h6m-5.25 0v3l-2.5 3.5v8.5a1.5 1.5 0 0 0 1.5 1.5h6.5a1.5 1.5 0 0 0 1.5-1.5v-8.5l-2.5-3.5v-3m-7 8.5h9.5" />
  ),
  more: (
    <path d="M5.25 12h.01M12 12h.01m6.74 0h.01" />
  ),
};

function NavIcon({ name }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
}

function BottomNav() {
  const role = localStorage.getItem("role");
  const morePath = role === "admin" ? "/admin" : "/staff";

  const items = [
    { label: "オーダー", to: "/orders", icon: "orders" },
    { label: "席", to: "/seats", icon: "seats" },
    { label: "日本酒", to: "/sakes", icon: "sake" },
    { label: "その他", to: morePath, icon: "more" },
  ];

  return (
    <nav className="bottom-nav" aria-label="メインメニュー">
      <div className="bottom-nav-inner">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item${isActive ? " is-active" : ""}`}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
