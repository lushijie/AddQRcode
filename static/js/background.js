chrome.extension.onConnect.addListener(function(conn) {
  conn.onMessage.addListener(function(data) {
    window.localStorage.setItem('__QrCodeDb__', JSON.stringify(data));
  });
});