// var __fillDB__ = {};
// //when refresh content send current localstorage to plugin
// chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
// 	__fillDB__ = request;
// });

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
// 	//console.log("onUpdated");
//     chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
//     	chrome.tabs.sendMessage(tabs[0].id, {action: "refresh",transdata:"onUpdated"});
// 	});
// });

// chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
// 	//console.log("onCreated");
//     chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
//     	chrome.tabs.sendMessage(tabs[0].id, {action: "refresh",transdata:"onCreated"});
// 	});
// });

// chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
// 	//console.log("onActivated");
// 	chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
//     	chrome.tabs.sendMessage(tabs[0].id, {action: "refresh",transdata:"onActivated"});
// 	});
// });

