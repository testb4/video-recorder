let fileName;
let downloads = [];
let records = [];
let recording = false;

function record(msg) {
    console.log('record called', JSON.stringify(msg));
    const source = msg.source;
    const action = msg.action;
    const data = msg.data;
    if (action === 'start-recording') {
        if (source === 'snaptest') {
            fileName = data.fileName;
        }
        const constraints = {
            audio: false,
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab'
                }
            }
        };
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            const activeTab = tabs[0];
            const tabRecord = records.find(item => item.windowId === activeTab.windowId);
            if (!tabRecord) {
                chrome.tabCapture.capture(constraints, function (stream) {
                    console.log('Tab capture with stream id:', stream.id);
                    const mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm'});
                    records.push({
                        windowId: data.windowId, streamId: stream.id, chunks: [], status: 'queued', stop: function () {
                            mediaRecorder.stop()
                        }
                    });
                    mediaRecorder.ondataavailable = function (e) {
                        if (e.data.size > 0) {
                            console.log('mediaRecorder.ondataavailable with stream id:', e.target.stream.id);
                            const tabRecord = records.find(item => item.streamId === e.target.stream.id);
                            tabRecord.chunks.push(e.data)
                        }
                    };
                    mediaRecorder.onstart = function (e) {
                        console.log('mediaRecorder.onstart with stream id:', e.target.stream.id);
                        if (!recording) {
                            recording = true;
                            downloadStateFile(`${fileName}_tb4-started`);
                            setBrowserIcon('main-icon-recording');
                        }
                        const tabRecord = records.find(item => item.streamId === e.target.stream.id);
                        tabRecord.status = 'started';
                        console.log(`Record started: ${JSON.stringify(tabRecord)}`)
                    };
                    mediaRecorder.onstop = function (e) {
                        console.log('mediaRecorder.onstop with stream id:', e.target.stream.id);
                        const tabRecord = records.find(item => item.streamId === e.target.stream.id);
                        tabRecord.status = 'stopped';
                        if (!records.find(item => item.status === 'started')) {
                            setBrowserIcon('main-icon');
                        }
                        e.target.stream.getVideoTracks()[0].stop();
                        const blob = new Blob(tabRecord.chunks, {'type': 'video/mp4'});
                        let downloadName = fileName;
                        if (data.windowId > 1) {
                            downloadName += '_' + data.windowId;
                        }
                        const downloadOptions = {
                            url: window.URL.createObjectURL(blob),
                            filename: `${downloadName}.mp4`,
                            saveAs: false
                        };
                        chrome.downloads.download(downloadOptions, function (downloadId) {
                            console.log('Download started with id:' + downloadId + ' options:' + JSON.stringify(downloadOptions));
                            downloads.push({id: downloadId, status: 'started', filename: downloadOptions.filename})
                        });
                        chrome.downloads.onChanged.addListener(function (downloadDelta) {
                            console.log('Download state changed with download id:' + downloadDelta.id + (downloadDelta.state ? 'state:' + downloadDelta.state.current : ''));
                            const download = downloads.find(item => item.id === downloadDelta.id);
                            if (download) {
                                if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                                    console.log(`Download completed with id:${download.id} path:${download.path}`);
                                    download.status = 'completed';
                                    const startedDownload = downloads.find(item => item.status === 'started');
                                    const startedRecord = records.find(item => item.status === 'started');
                                    if (!startedDownload && !startedRecord) {
                                        downloadStateFile(`${fileName}_tb4-completed`);
                                        recording = false;
                                        records = [];
                                        downloads = [];
                                        fileName = null;
                                    }
                                }
                            }
                        });
                    };

                    mediaRecorder.start();
                });
            } else {
                console.log(`Tab is already capturing, active record: ${JSON.stringify(tabRecord)}`)
            }
        });
    } else if (action === 'stop-recording') {
        if (data && data.windowId) {
            records.find(item => item.windowId === data.windowId && item.status !== 'stopped').stop()
        } else {
            records.filter(item => item.status !== 'stopped').forEach(item => item.stop());
        }
    }
}
