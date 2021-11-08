var browser = chrome || browser;
window.addEventListener("load", () => {
  console.log("Injected code running...");
  let ws_client = new WebSocket("ws://localhost:9000");
  ws_client.addEventListener("open", () => {console.log("[WebSocket] Connection opened");});
  ws_client.addEventListener("close", () => {console.log("[WebSocket] Connection closed");});
  ws_client.addEventListener("message", (m) => {
    console.log("[WebSocket] Message: " + m.data);
    if (m.data == "reload") {
      browser.runtime.reload();
    }
  });
});
