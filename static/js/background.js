chrome.extension.onConnect.addListener(function(conn) {
  conn.onMessage.addListener(function(data) {
    window.localStorage.setItem('__QR_DB__', JSON.stringify(data));
  });
});