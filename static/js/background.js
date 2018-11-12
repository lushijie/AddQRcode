chrome.extension.onConnect.addListener(function(conn) {
  conn.onMessage.addListener(function(data) {
    window.localStorage.setItem(data.dbName, JSON.stringify(data));
  });
});