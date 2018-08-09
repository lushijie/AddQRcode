chrome.extension.onConnect.addListener(function(conn) {
  conn.onMessage.addListener(function(data) {
    window.localStorage.setItem('__DB__', JSON.stringify(data));
  });
});