// スタッフのページ

import LogoutButton from "../../components/LogoutButton";
import "../Menu.css";

function Staff() {
  return (
    <main className="menu-page">
      <header className="menu-page-header">
        <h1>その他</h1>
        <span>アカウントに関する操作</span>
      </header>

      <nav className="menu-grid">

      <LogoutButton />
      </nav>
    </main>
  );
}

export default Staff
