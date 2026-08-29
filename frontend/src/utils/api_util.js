// .envから環境変数を取り出す
export const API_URL = import.meta.env.VITE_API_URL;

const getWebSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_WS_URL?.trim();
  const baseUrl = configuredUrl || API_URL || window.location.origin;
  const url = new URL(baseUrl, window.location.origin);

  // HTTPSで開いた画面からws://へ接続するとモバイルブラウザに遮断されるため補正する
  if (window.location.protocol === "https:" || url.protocol === "https:") {
    url.protocol = "wss:";
  } else {
    url.protocol = "ws:";
  }

  return url.origin;
};

export const WS_URL = getWebSocketUrl();
