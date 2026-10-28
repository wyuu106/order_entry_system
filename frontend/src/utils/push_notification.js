import axios from "axios";

import { API_URL } from "./api_util";


function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = window.atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export function isPushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushSubscription() {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function enablePushNotifications() {
  if (!isPushSupported()) {
    throw new Error("この端末ではOS通知を利用できません");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("OSの通知が許可されていません");
  }

  const registration = await navigator.serviceWorker.ready;

  // 現在サーバーで使用しているVAPID公開鍵を取得
  const response = await axios.get(`${API_URL}/push/vapid-public-key`, {
    headers: authHeaders(),
  });
  const publicKey = urlBase64ToUint8Array(response.data.public_key);

  let subscription = await registration.pushManager.getSubscription();

  // 既存の購読で使われている公開鍵を取得
  if (subscription) {
    const oldKey = subscription.options.applicationServerKey;

    const isSameKey =
      oldKey &&
      new Uint8Array(oldKey).length === publicKey.length &&
      new Uint8Array(oldKey).every((byte, i) => byte === publicKey[i]);

    // 公開鍵が変更されていたら古い購読を解除
    if (!isSameKey) {
      try {
        await axios.delete(`${API_URL}/push/subscriptions`, {
          headers: authHeaders(),
          data: { endpoint: subscription.endpoint },
        });
      } catch (error) {
        console.error("古い購読情報の削除に失敗:", error);
      }

      await subscription.unsubscribe();
      subscription = null;
    }
  }

  // 購読が存在しない場合は新しい公開鍵で登録
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });
  }

  // バックエンドに最新の購読情報を登録
  await axios.post(`${API_URL}/push/subscriptions`, subscription.toJSON(), {
    headers: authHeaders(),
  });

  return subscription;
}

export async function disablePushNotifications() {
  const subscription = await getPushSubscription();
  if (!subscription) return;

  try {
    await axios.delete(`${API_URL}/push/subscriptions`, {
      headers: authHeaders(),
      data: { endpoint: subscription.endpoint },
    });
  } finally {
    await subscription.unsubscribe();
  }
}
