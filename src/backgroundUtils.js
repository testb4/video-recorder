function setBrowserIcon(icon) {
    chrome.browserAction.setIcon({
        path: {
            '19': `image/${icon}-19.png`,
            '38': `image/${icon}-38.png`
        }
    });
}

function downloadStateFile(file) {
    const downloadOptions = {
        url: window.URL.createObjectURL(new Blob([], {type: 'text/plain;charset=utf-8'})),
        filename: file,
        saveAs: false
    };
    chrome.downloads.download(downloadOptions, function (downloadId) {
        console.log('State file download started file: ' + file);
    });
}