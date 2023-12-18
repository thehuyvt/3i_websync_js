
function LocalMedia()
{
    // We're going to use both audio and video
    // for this example.
    this.audio          = true;
    this.video          = true;
    this.videoWidth     = 640;
    this.videoHeight    = 480;
    this.videoFrameRate = 30;

    this.screenWidth = window.screen.width;
    this.screenHeight = window.screen.height;
    this.screenFrameRate = 3;

    this.localMediaStream = null;
    this.layoutManager = null;
};

LocalMedia.prototype.start = function(videoContainer, captureScreen, callback)
{
    var me = this;

    // WebRTC audio and video streams require us to first get access to
    // the local media stream (microphone, camera, or both).
    fm.icelink.webrtc.userMedia.getMedia({
        audio: captureScreen ? false : this.audio,
        video: this.video,
        videoWidth:         captureScreen ? this.screenWidth : this.videoWidth,         // optional
        videoHeight:        captureScreen ? this.screenHeight : this.videoHeight,       // optional
        videoFrameRate:     captureScreen ? this.screenFrameRate : this.videoFrameRate, // optional
        defaultVideoSource: captureScreen ? fm.icelink.webrtc.videoSource.Screen : fm.icelink.webrtc.videoSource.Camera, // optional
        defaultVideoScale: fm.icelink.webrtc.layoutScale.Contain,        // optional
        defaultVideoPreviewScale: fm.icelink.webrtc.layoutScale.Contain, // optional
        onFailure: function(e)
        {
            if (captureScreen && navigator.webkitGetUserMedia && !fm.icelink.webrtc.localMediaStream.chromeExtensionInstalled)
            {
                chromeExtensionInstallButton.style.display = '';
                callback('Could not get media. ' + e.getException().message + '\n\nClick "Install Screen-Sharing Extension" to install screen-sharing extension.');
            }
            else if (captureScreen && navigator.mozGetUserMedia)
            {
                firefoxExtensionInstallButton.style.display = '';
                callback('Could not get media. ' + e.getException().message + '\n\nClick "Install Screen-Sharing Extension" to install screen-sharing extension.');
            }
            else
            {
                callback('Could not get media. ' + e.getException().message);
            }
        },
        onSuccess: function(e)
        {
            // We have successfully acquired access to the local
            // audio/video device! Grab a reference to the media.
            // Internally, it maintains access to the local audio
            // and video feeds coming from the device hardware.
            me.localMediaStream = e.getLocalStream();
                
            // This is our local video control, a DOM element
            // that displays video coming from the capture source.
            var localVideoControl = e.getLocalVideoControl();
                
            // Create an IceLink layout manager, which makes the task
            // of arranging video controls easy. Give it a reference
            // to a DOM element that can be filled with video feeds.
            me.layoutManager = new fm.icelink.webrtc.layoutManager(videoContainer);
                
            // Display the local video control.
            me.layoutManager.setLocalVideoControl(localVideoControl);

            callback(null);
        }
    });
};

LocalMedia.prototype.stop = function(callback)
{
    // Clear out the layout manager.
    if (this.layoutManager)
    {
        this.layoutManager.removeRemoteVideoControls();
        this.layoutManager.unsetLocalVideoControl();
        this.layoutManager = null;
    }

    // Stop the local media stream.
    if (this.localMediaStream)
    {
        this.localMediaStream.stop();
        this.localMediaStream = null;
    }

    callback(null);
};

LocalMedia.prototype.toggleAudioMute = function()
{
    this.localMediaStream.toggleAudioMute();
    return this.localMediaStream.getAudioIsMuted();
};

LocalMedia.prototype.toggleVideoMute = function()
{
    this.localMediaStream.toggleVideoMute();
    return this.localMediaStream.getVideoIsMuted();
};