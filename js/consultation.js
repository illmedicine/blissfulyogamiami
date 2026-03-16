/* ============================================================
   consultation.js — Blissful Yoga Miami Video Consultation
   WebRTC video room, camera/mic testing, consent, call timer
   ============================================================ */

(function () {
  'use strict';

  /* ------ DOM REFS ------ */
  var preJoin = document.getElementById('preJoin');
  var activeRoom = document.getElementById('activeRoom');
  var localPreview = document.getElementById('localPreview');
  var remoteVideo = document.getElementById('remoteVideo');
  var selfView = document.getElementById('selfView');
  var roomCodeInput = document.getElementById('roomCode');
  var joinBtn = document.getElementById('joinRoomBtn');
  var testCamBtn = document.getElementById('testCamBtn');
  var testMicBtn = document.getElementById('testMicBtn');

  // Controls
  var muteBtn = document.getElementById('muteBtn');
  var cameraBtn = document.getElementById('cameraBtn');
  var screenBtn = document.getElementById('screenBtn');
  var endBtn = document.getElementById('endBtn');

  // Consent modal
  var consentModal = document.getElementById('consentModal');
  var consentAccept = document.getElementById('consentAccept');
  var consentDecline = document.getElementById('consentDecline');

  // Timer
  var timerEl = document.getElementById('callTimer');

  // Sidebar
  var sidebarBtns = document.querySelectorAll('.sidebar-tab-btn');
  var sidebarPanels = document.querySelectorAll('.sidebar-panel');
  var sessionChat = document.getElementById('sessionChat');
  var sessionChatInput = document.getElementById('sessionChatInput');
  var sessionChatSend = document.getElementById('sessionChatSend');
  var sessionNotes = document.getElementById('sessionNotes');

  /* ------ STATE ------ */
  var localStream = null;
  var isMuted = false;
  var isCameraOff = false;
  var callStartTime = null;
  var timerInterval = null;
  var recordingConsented = false;

  /* ------ CAMERA / MIC TESTING ------ */
  if (testCamBtn) {
    testCamBtn.addEventListener('click', function () {
      startPreview(true, false);
    });
  }

  if (testMicBtn) {
    testMicBtn.addEventListener('click', function () {
      startPreview(false, true);
    });
  }

  function startPreview(video, audio) {
    if (localStream) {
      localStream.getTracks().forEach(function (t) { t.stop(); });
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support camera/microphone access. Please use a modern browser.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
      .then(function (stream) {
        localStream = stream;
        if (localPreview && video) {
          localPreview.srcObject = stream;
          localPreview.play();
        }
        if (audio && !video) {
          // Show mic level indicator
          var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          var analyser = audioCtx.createAnalyser();
          var mic = audioCtx.createMediaStreamSource(stream);
          mic.connect(analyser);
          analyser.fftSize = 256;
          var data = new Uint8Array(analyser.frequencyBinCount);

          var indicator = document.getElementById('micLevel');
          if (indicator) {
            function checkLevel() {
              analyser.getByteFrequencyData(data);
              var avg = data.reduce(function (a, b) { return a + b; }, 0) / data.length;
              indicator.style.width = Math.min(100, avg * 2) + '%';
              if (localStream) requestAnimationFrame(checkLevel);
            }
            checkLevel();
          }
        }

        var statusEl = video ? document.getElementById('camStatus') : document.getElementById('micStatus');
        if (statusEl) {
          statusEl.textContent = '✓ Working';
          statusEl.style.color = '#4a7c59';
        }
      })
      .catch(function (err) {
        var statusEl = video ? document.getElementById('camStatus') : document.getElementById('micStatus');
        if (statusEl) {
          statusEl.textContent = '✗ ' + (err.name === 'NotAllowedError' ? 'Permission denied' : 'Not available');
          statusEl.style.color = '#c0392b';
        }
      });
  }

  /* ------ JOIN ROOM ------ */
  if (joinBtn) {
    joinBtn.addEventListener('click', function () {
      var code = roomCodeInput ? roomCodeInput.value.trim() : '';
      if (code.length < 3) {
        alert('Please enter a valid room code (at least 3 characters).');
        return;
      }

      // Show consent modal first
      if (consentModal) {
        consentModal.classList.add('open');
      } else {
        enterRoom();
      }
    });
  }

  if (consentAccept) {
    consentAccept.addEventListener('click', function () {
      recordingConsented = true;
      if (consentModal) consentModal.classList.remove('open');
      enterRoom();
    });
  }

  if (consentDecline) {
    consentDecline.addEventListener('click', function () {
      recordingConsented = false;
      if (consentModal) consentModal.classList.remove('open');
      enterRoom();
    });
  }

  function enterRoom() {
    // Start camera + mic
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support video consultation. Please use a modern browser.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(function (stream) {
        localStream = stream;

        // Set self view
        if (selfView) {
          selfView.srcObject = stream;
          selfView.play();
        }

        // Hide pre-join, show active room
        if (preJoin) preJoin.style.display = 'none';
        if (activeRoom) activeRoom.style.display = 'flex';

        // Start timer
        startTimer();

        // In production, connect to signaling server here
        // For demo, show a placeholder message
        if (remoteVideo) {
          remoteVideo.poster = '';
          remoteVideo.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
        }
      })
      .catch(function (err) {
        alert('Could not access camera/microphone: ' + err.message);
      });
  }

  /* ------ CALL CONTROLS ------ */
  if (muteBtn) {
    muteBtn.addEventListener('click', function () {
      if (!localStream) return;
      isMuted = !isMuted;
      localStream.getAudioTracks().forEach(function (t) { t.enabled = !isMuted; });
      muteBtn.textContent = isMuted ? '🔇' : '🎤';
      muteBtn.classList.toggle('muted', isMuted);
    });
  }

  if (cameraBtn) {
    cameraBtn.addEventListener('click', function () {
      if (!localStream) return;
      isCameraOff = !isCameraOff;
      localStream.getVideoTracks().forEach(function (t) { t.enabled = !isCameraOff; });
      cameraBtn.textContent = isCameraOff ? '📷' : '📹';
      cameraBtn.classList.toggle('off', isCameraOff);
    });
  }

  if (screenBtn) {
    screenBtn.addEventListener('click', function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen sharing is not supported in your browser.');
        return;
      }

      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(function (screenStream) {
          // In production, replace video track in peer connection
          if (remoteVideo) {
            remoteVideo.srcObject = screenStream;
            remoteVideo.play();
          }

          screenStream.getVideoTracks()[0].addEventListener('ended', function () {
            if (remoteVideo) {
              remoteVideo.srcObject = null;
              remoteVideo.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
            }
          });
        })
        .catch(function () {
          // User cancelled
        });
    });
  }

  if (endBtn) {
    endBtn.addEventListener('click', function () {
      endCall();
    });
  }

  function endCall() {
    if (localStream) {
      localStream.getTracks().forEach(function (t) { t.stop(); });
      localStream = null;
    }
    stopTimer();

    // Reset UI
    if (activeRoom) activeRoom.style.display = 'none';
    if (preJoin) preJoin.style.display = '';
    if (selfView) selfView.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;
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

        // 5-minute warning (free consult)
        if (mins === 4 && secs === 50) {
          timerEl.style.color = '#e74c3c';
        }
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

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /* ------ SIDEBAR TABS ------ */
  sidebarBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = this.getAttribute('data-panel');
      sidebarBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      sidebarPanels.forEach(function (p) {
        p.classList.toggle('active', p.id === 'panel-' + panel);
      });
    });
  });

  /* ------ SESSION CHAT ------ */
  if (sessionChatSend && sessionChatInput && sessionChat) {
    function sendSessionMsg() {
      var msg = sessionChatInput.value.trim();
      if (!msg) return;

      var div = document.createElement('div');
      div.textContent = msg;
      var safeMsg = div.innerHTML;

      var bubble = document.createElement('div');
      bubble.className = 'session-msg self';
      bubble.innerHTML = '<strong>You</strong><p>' + safeMsg + '</p>';
      sessionChat.appendChild(bubble);
      sessionChatInput.value = '';
      sessionChat.scrollTop = sessionChat.scrollHeight;
    }

    sessionChatSend.addEventListener('click', sendSessionMsg);
    sessionChatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendSessionMsg();
    });
  }

})();
