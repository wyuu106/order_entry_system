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
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const response = await axios.get(`${API_URL}/push/vapid-public-key`, {
      headers: authHeaders(),
    });
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(response.data.public_key),
    });
  }

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
