self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { body: event.data?.text() ?? "新しい注文があります" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? "新規注文", {
      body: data.body ?? "新しい注文があります",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: data.tag ?? "new-order",
      renotify: true,
      data: { url: data.url ?? "/orders" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url ?? "/orders", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existingClient) {
        existingClient.navigate(targetUrl);
        return existingClient.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
