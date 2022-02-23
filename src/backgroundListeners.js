chrome.extension.onRequest.addListener(function (msg, sender, sendResponse) {
    console.log('Extension message received', JSON.stringify(msg));
    if (msg.source === 'snaptest') {
        chrome.downloads.setShelfEnabled(false);
        if (msg.action !== 'stop-recording') {
            if (msg.data) {
                msg.data.windowId = sender.tab.windowId;
            } else {
                msg.data = {
                    windowId: sender.tab.windowId
                }
            }
        }
        record(msg)
    }
});
chrome.windows.onCreated.addListener(function (window) {
    console.log('Window created with id: ' + window.id);
    record({source: 'windowListener', action: 'start-recording', data: {windowId: window.id}})
});
chrome.windows.onRemoved.addListener(function (windowId) {
    console.log('Window removed with id: ' + windowId);
    record({source: 'windowListener', action: 'stop-recording', data: {windowId: windowId}})
});
