import { useEffect, useState } from "react";

import {
  disablePushNotifications,
  enablePushNotifications,
  getPushSubscription,
  isPushSupported,
} from "../utils/push_notification";


function PushNotificationSetting() {
  const isAdmin = localStorage.getItem("role") === "admin";
  const [status, setStatus] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      if (!isAdmin) {
        await disablePushNotifications();
        return;
      }

      if (!isPushSupported()) {
        if (active) setStatus("unsupported");
        return;
      }

      const subscription = await getPushSubscription();
      if (!active) return;

      if (subscription && Notification.permission === "granted") {
        setStatus("enabled");
      } else if (Notification.permission === "denied") {
        setStatus("denied");
      } else {
        setStatus("disabled");
      }
    };

    checkStatus().catch(() => {
      if (active) setStatus("disabled");
    });

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const handleEnable = async () => {
    setStatus("enabling");
    setErrorMessage("");

    try {
      await enablePushNotifications();
      setStatus("enabled");
    } catch (error) {
      setStatus(Notification.permission === "denied" ? "denied" : "disabled");
      setErrorMessage(error.message || "OS通知を設定できませんでした");
    }
  };

  if (!isAdmin) return null;

  if (status === "checking" || status === "enabled") {
    return status === "enabled" ? (
      <span className="push-status is-enabled">● OS通知：有効</span>
    ) : null;
  }

  if (status === "unsupported") {
    return (
      <span className="push-status is-warning">
        OS通知を利用するにはPWAとしてホーム画面から起動してください
      </span>
    );
  }

  if (status === "denied") {
    return (
      <span className="push-status is-warning">
        OSの設定から通知を許可してください
      </span>
    );
  }

  return (
    <div className="push-setting">
      <span>新規注文をOS通知でお知らせできます</span>
      <button type="button" onClick={handleEnable} disabled={status === "enabling"}>
        {status === "enabling" ? "設定中…" : "OS通知を有効にする"}
      </button>
      {errorMessage && <span className="push-setting-error">{errorMessage}</span>}
    </div>
  );
}

export default PushNotificationSetting;
