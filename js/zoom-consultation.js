/* ============================================================
   zoom-consultation.js — Blissful Yoga Miami Zoom Integration
   Embeds Zoom meetings directly in the consultation page using
   Zoom's Meeting SDK (Component View) so camera/audio run
   in-browser without opening Zoom separately.
   ============================================================ */

(function () {
  'use strict';

  var config = (window.BYM && window.BYM.config) || {};
  var zm = config.zoom || {};

  /* ------ DOM REFS ------ */
  var preJoin        = document.getElementById('zoomPreJoin');
  var container      = document.getElementById('zoomMeetingContainer');
  var sdkElement     = document.getElementById('zoomSDKElement');
  var joinBtn        = document.getElementById('zoomJoinBtn');
  var leaveBtn       = document.getElementById('zoomLeaveBtn');
  var nameInput      = document.getElementById('zoomDisplayName');
  var meetingInput   = document.getElementById('zoomMeetingId');
  var passcodeInput  = document.getElementById('zoomPasscode');
  var timerEl        = document.getElementById('zoomCallTimer');
  var testCamBtn     = document.getElementById('zoomTestCamera');
  var testMicBtn     = document.getElementById('zoomTestMic');
  var preview        = document.getElementById('zoomCameraPreview');
  var placeholder    = document.getElementById('zoomPreviewPlaceholder');
  var micBar         = document.getElementById('zoomMicBar');
  var micLevel       = document.getElementById('zoomMicLevel');

  var previewStream  = null;
  var callStartTime  = null;
  var timerInterval  = null;
  var zoomClient     = null;

  /* ------ CAMERA / MIC TEST ------ */
  if (testCamBtn) {
    testCamBtn.addEventListener('click', function () {
      testMedia(true, false);
    });
  }
  if (testMicBtn) {
    testMicBtn.addEventListener('click', function () {
      testMedia(false, true);
    });
  }

  function testMedia(video, audio) {
    stopPreview();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support camera/microphone access.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
      .then(function (stream) {
        previewStream = stream;
        if (video && preview) {
          preview.srcObject = stream;
          preview.style.display = 'block';
          preview.play();
          if (placeholder) placeholder.style.display = 'none';
        }
        if (audio) {
          showMicLevel(stream);
        }
      })
      .catch(function (err) {
        alert('Could not access ' + (video ? 'camera' : 'microphone') + ': ' + err.message);
      });
  }

  function showMicLevel(stream) {
    if (!micLevel || !micBar) return;
    micLevel.style.display = 'block';
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var analyser = audioCtx.createAnalyser();
    var src = audioCtx.createMediaStreamSource(stream);
    src.connect(analyser);
    analyser.fftSize = 256;
    var data = new Uint8Array(analyser.frequencyBinCount);
    (function tick() {
      if (!previewStream) return;
      analyser.getByteFrequencyData(data);
      var avg = data.reduce(function (a, b) { return a + b; }, 0) / data.length;
      micBar.style.width = Math.min(100, avg * 2) + '%';
      requestAnimationFrame(tick);
    })();
  }

  function stopPreview() {
    if (previewStream) {
      previewStream.getTracks().forEach(function (t) { t.stop(); });
      previewStream = null;
    }
    if (preview) {
      preview.srcObject = null;
      preview.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = '';
    if (micLevel) micLevel.style.display = 'none';
  }

  /* ------ JOIN MEETING ------ */
  if (joinBtn) {
    joinBtn.addEventListener('click', function () {
      var displayName = (nameInput && nameInput.value.trim()) || 'Guest';
      var meetingId = (meetingInput && meetingInput.value.replace(/\s/g, '')) || zm.meetingNumber || '';
      var passcode = (passcodeInput && passcodeInput.value.trim()) || zm.meetingPassword || '';

      if (!meetingId) {
        alert('Please enter a Meeting ID. You\'ll receive one after scheduling your consultation.');
        return;
      }
      if (!displayName || displayName === 'Guest') {
        alert('Please enter your name so Paola knows who is joining.');
        return;
      }

      stopPreview();

      // If Zoom SDK is available and configured, use embedded mode
      if (zm.sdkKey && zm.signatureEndpoint && typeof ZoomMtg !== 'undefined') {
        joinViaSDK(meetingId, passcode, displayName);
      } else {
        // Fallback: open Zoom web client directly in the meeting container
        joinViaWebClient(meetingId, passcode, displayName);
      }
    });
  }

  /* ------ ZOOM SDK (COMPONENT VIEW) ------ */
  function joinViaSDK(meetingId, passcode, displayName) {
    joinBtn.disabled = true;
    joinBtn.textContent = 'Connecting...';

    // Get signature from endpoint
    fetch(zm.signatureEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingNumber: meetingId,
        role: 0 // 0 = attendee, 1 = host
      })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var signature = data.signature;
      if (!signature) throw new Error('No signature returned');

      ZoomMtg.setZoomJSLib('https://source.zoom.us/3.11.0/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      ZoomMtg.init({
        leaveUrl: window.location.href,
        isSupportAV: true,
        isSupportChat: true,
        screenShare: true,
        success: function () {
          ZoomMtg.join({
            sdkKey: zm.sdkKey,
            signature: signature,
            meetingNumber: meetingId,
            passWord: passcode,
            userName: displayName,
            success: function () {
              showMeetingUI();
            },
            error: function (err) {
              alert('Failed to join meeting: ' + (err.errorMessage || 'Unknown error'));
              resetJoinBtn();
            }
          });
        },
        error: function (err) {
          alert('Zoom SDK init failed: ' + (err.errorMessage || 'Unknown error'));
          resetJoinBtn();
        }
      });
    })
    .catch(function (err) {
      alert('Could not connect to Zoom: ' + err.message + '\nFalling back to Zoom web client.');
      joinViaWebClient(meetingId, passcode, displayName);
    });
  }

  /* ------ ZOOM WEB CLIENT FALLBACK (IFRAME) ------ */
  function joinViaWebClient(meetingId, passcode, displayName) {
    joinBtn.disabled = true;
    joinBtn.textContent = 'Launching Zoom...';

    // Build Zoom web client URL
    var cleanId = meetingId.replace(/\s/g, '');
    var zoomUrl = 'https://zoom.us/wc/join/' + encodeURIComponent(cleanId);
    var params = [];
    if (passcode) params.push('pwd=' + encodeURIComponent(passcode));
    if (displayName) params.push('uname=' + encodeURIComponent(displayName));
    if (params.length) zoomUrl += '?' + params.join('&');

    // Use configured join URL if available
    if (zm.joinUrl) {
      zoomUrl = zm.joinUrl;
    }

    // Render Zoom web client in an iframe inside the container
    if (preJoin) preJoin.style.display = 'none';
    if (container) container.style.display = 'block';

    if (sdkElement) {
      var iframe = document.createElement('iframe');
      iframe.src = zoomUrl;
      iframe.id = 'zoomIframe';
      iframe.allow = 'camera; microphone; fullscreen; display-capture; autoplay';
      iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-downloads';
      iframe.style.cssText = 'width:100%;height:100%;min-height:65vh;border:none;border-radius:var(--radius-md);';
      iframe.title = 'Zoom Consultation with Paola';
      sdkElement.innerHTML = '';
      sdkElement.appendChild(iframe);
    }

    startTimer();
    resetJoinBtn();
  }

  /* ------ SHOW MEETING UI ------ */
  function showMeetingUI() {
    if (preJoin) preJoin.style.display = 'none';
    if (container) container.style.display = 'block';
    startTimer();
    resetJoinBtn();
  }

  /* ------ LEAVE MEETING ------ */
  if (leaveBtn) {
    leaveBtn.addEventListener('click', function () {
      // If SDK mode, leave via SDK
      if (typeof ZoomMtg !== 'undefined' && zm.sdkKey && zm.signatureEndpoint) {
        try { ZoomMtg.leaveMeeting({}); } catch (e) { /* ignore */ }
      }
      // Remove iframe if present
      var iframe = document.getElementById('zoomIframe');
      if (iframe) iframe.remove();

      stopTimer();
      if (container) container.style.display = 'none';
      if (preJoin) preJoin.style.display = '';
      if (sdkElement) sdkElement.innerHTML = '';
    });
  }

  /* ------ TIMER ------ */
  function startTimer() {
    callStartTime = Date.now();
    if (timerEl) {
      timerInterval = setInterval(function () {
        var elapsed = Date.now() - callStartTime;
        var mins = Math.floor(elapsed / 60000);
        var secs = Math.floor((elapsed % 60000) / 1000);
        timerEl.textContent = pad(mins) + ':' + pad(secs);
        if (mins >= 4 && secs >= 50) timerEl.style.color = '#e74c3c';
      }, 1000);
    }
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (timerEl) {
      timerEl.textContent = '00:00';
      timerEl.style.color = '';
    }
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function resetJoinBtn() {
    if (joinBtn) {
      joinBtn.disabled = false;
      joinBtn.textContent = '🎥 Request Free 5 Min Consultation';
    }
  }

})();
