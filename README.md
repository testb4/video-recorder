# Test Video Recorder

Record tab activity, manage by window messages.

## Start Recording
```javascript
window.postMessage({source: 'snaptest', key: 'start-recording', value: 'recordFileName'}, '*')
```

**snaptestRecording** in local storage will be true after start recording successfully.

## Stop Recording
```javascript
window.postMessage({source: 'snaptest', key: 'stop-recording'}, '*')
```

**snaptestRecording** in local storage will be false, **snaptestRecordPath** will be recorded file path and download will completed after stop recording successfully.

## Debugging

To use source instead of crx, edit chrome options in snaptest:
```java
options.addArguments(“--load-extension=path”)
```