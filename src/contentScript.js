console.log(`Test Video Record v${chrome.runtime.getManifest().version}`);
//multiple times called?
window.addEventListener('message', function (event) {
    if (event.source !== window) {
        return;
    }
    const msg = event.data;
    console.log('Window message received', JSON.stringify(msg));
    if (msg.source === 'snaptest') {
        chrome.extension.sendRequest(msg);
    }
});