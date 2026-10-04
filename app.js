/**
 * VoiceText – Speech to Text Analyzer
 * Text and Speech Analysis Lab — Experiment 06
 * Browser Web Speech API & Real-Time Acoustic Visualizer Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // DOM Elements
  // =========================================================================
  const unsupportedBanner = document.getElementById('unsupportedBanner');
  const closeBannerBtn = document.getElementById('closeBannerBtn');
  const apiStatusBadge = document.getElementById('apiStatusBadge');
  const languageSelect = document.getElementById('languageSelect');
  
  // Controller elements
  const mainMicBtn = document.getElementById('mainMicBtn');
  const mainMicLabel = document.getElementById('mainMicLabel');
  const listeningStatusPill = document.getElementById('listeningStatusPill');
  const listeningStatusText = document.getElementById('listeningStatusText');
  const controllerCard = document.querySelector('.controller-card');
  const audioInputLabel = document.getElementById('audioInputLabel');
  const eqBars = document.querySelectorAll('.eq-bar');
  
  // Action buttons
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  
  // Secondary controls
  const continuousToggle = document.getElementById('continuousToggle');
  const interimToggle = document.getElementById('interimToggle');
  const speakTextBtn = document.getElementById('speakTextBtn');
  const downloadTxtBtn = document.getElementById('downloadTxtBtn');
  const editToggleBtn = document.getElementById('editToggleBtn');
  
  // Transcript displays
  const transcriptDisplay = document.getElementById('transcriptDisplay');
  const interimDisplay = document.getElementById('interimDisplay');
  const liveStreamingIndicator = document.getElementById('liveStreamingIndicator');
  const toastMessage = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');
  
  // Statistics
  const statWordCount = document.getElementById('statWordCount');
  const statCharCount = document.getElementById('statCharCount');
  const statCharNoSpaces = document.getElementById('statCharNoSpaces');
  const statSentenceCount = document.getElementById('statSentenceCount');
  const statDuration = document.getElementById('statDuration');
  const statWpm = document.getElementById('statWpm');
  
  // Examples & Prompts
  const simulateExampleBtn = document.getElementById('simulateExampleBtn');
  const speakExamplePromptBtn = document.getElementById('speakExamplePromptBtn');
  const promptChips = document.querySelectorAll('.prompt-chip');
  
  // Help Modal
  const helpModalBtn = document.getElementById('helpModalBtn');
  const helpModal = document.getElementById('helpModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalGotItBtn = document.getElementById('modalGotItBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');

  // =========================================================================
  // State Variables
  // =========================================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let userManuallyStopped = false;
  let finalTranscript = '';
  
  // Speaking Duration Timer
  let timerInterval = null;
  let elapsedSeconds = 0;
  
  // Web Audio API Visualizer State
  let audioContext = null;
  let analyser = null;
  let microphoneStream = null;
  let animFrameId = null;

  // =========================================================================
  // Browser Speech Recognition Check
  // =========================================================================
  const isSpeechSupported = !!SpeechRecognition;

  if (!isSpeechSupported) {
    if (unsupportedBanner) unsupportedBanner.style.display = 'block';
    if (apiStatusBadge) {
      apiStatusBadge.classList.add('api-offline');
      apiStatusBadge.innerHTML = '<span class="status-indicator-dot offline"></span> Web Speech Unavailable';
    }
    showToast('Web Speech API is not supported in this browser. Try Chrome or Edge.', 6000);
  } else {
    initSpeechRecognition();
  }

  if (closeBannerBtn) {
    closeBannerBtn.addEventListener('click', () => {
      unsupportedBanner.style.display = 'none';
    });
  }

  // =========================================================================
  // Initialize Speech Recognition
  // =========================================================================
  function initSpeechRecognition() {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = continuousToggle ? continuousToggle.checked : true;
      recognition.interimResults = interimToggle ? interimToggle.checked : true;
      recognition.lang = languageSelect ? languageSelect.value : 'en-US';
      recognition.maxAlternatives = 1;

      // Event: Recognition starts
      recognition.onstart = () => {
        isListening = true;
        userManuallyStopped = false;
        updateListeningUI('Listening');
        startTimer();
        startAudioVisualizer();
      };

      // Event: Audio stream captured
      recognition.onaudiostart = () => {
        if (audioInputLabel) audioInputLabel.textContent = 'Audio Stream Captured';
      };

      // Event: Sound detected
      recognition.onsoundstart = () => {
        if (audioInputLabel) audioInputLabel.textContent = 'Voice Detected';
      };

      // Event: Speech results received
      recognition.onresult = (event) => {
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Capitalize first letter of new sentence if needed
            let cleanPart = transcriptPart.trim();
            if (cleanPart) {
              if (finalTranscript.length > 0 && !finalTranscript.endsWith(' ') && !finalTranscript.endsWith('\n')) {
                finalTranscript += ' ';
              }
              finalTranscript += cleanPart;
            }
          } else {
            interimText += transcriptPart;
          }
        }

        renderTranscript(finalTranscript, interimText);
        updateStatistics(finalTranscript + (interimText ? ' ' + interimText : ''));
      };

      // Event: Recognition encounters an error
      recognition.onerror = (event) => {
        console.warn('Speech Recognition Error:', event.error);
        
        let message = 'Speech recognition error occurred.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          message = 'Microphone permission denied. Please allow microphone access.';
          updateListeningUI('Stopped');
          stopAudioVisualizer();
          stopTimer();
          isListening = false;
        } else if (event.error === 'no-speech') {
          // Normal when silent, don't stop continuous mode
          if (audioInputLabel) audioInputLabel.textContent = 'Awaiting Speech...';
          return;
        } else if (event.error === 'network') {
          message = 'Network error: speech service temporarily unavailable.';
        }
        
        showToast(message, 4000);
      };

      // Event: Recognition ends
      recognition.onend = () => {
        // If continuous listening is enabled and the user did not manually stop, automatically restart
        if (continuousToggle && continuousToggle.checked && !userManuallyStopped) {
          try {
            recognition.start();
            return;
          } catch (e) {
            console.log('Continuous restart delayed:', e);
          }
        }

        isListening = false;
        updateListeningUI('Stopped');
        stopTimer();
        stopAudioVisualizer();
      };

    } catch (err) {
      console.error('Speech Recognition initialization failed:', err);
    }
  }

  // =========================================================================
  // Control Functions (Start, Stop, Clear, Copy)
  // =========================================================================
  function startListening() {
    if (!isSpeechSupported) {
      showToast('Speech recognition not supported in this browser. Use Chrome/Edge.', 4500);
      return;
    }

    if (isListening) return;

    userManuallyStopped = false;
    
    // Update recognition config in case user changed language or toggles
    if (recognition) {
      recognition.lang = languageSelect.value;
      recognition.continuous = continuousToggle.checked;
      recognition.interimResults = interimToggle.checked;
    }

    try {
      recognition.start();
    } catch (err) {
      // In case it was already running or in transition
      console.log('Recognition start note:', err);
      try {
        recognition.stop();
        setTimeout(() => recognition.start(), 200);
      } catch (e) {
        console.error('Failed to restart recognition:', e);
      }
    }
  }

  function stopListening() {
    userManuallyStopped = true;
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Recognition stop error:', err);
      }
    }
    isListening = false;
    updateListeningUI('Stopped');
    stopTimer();
    stopAudioVisualizer();
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function clearTranscript() {
    finalTranscript = '';
    renderTranscript('', '');
    updateStatistics('');
    resetTimer();
    updateListeningUI('Waiting');
    if (isListening) {
      stopListening();
    }
    showToast('Transcript cleared.', 2500);
  }

  function copyTranscript() {
    const rawText = getCleanTranscriptText();

    if (!rawText) {
      showToast('No transcript text to copy!', 2500);
      return;
    }

    navigator.clipboard.writeText(rawText).then(() => {
      showToast('Transcript copied to clipboard!');
      if (copyBtnText) {
        const originalText = copyBtnText.textContent;
        copyBtnText.textContent = 'Copied!';
        setTimeout(() => {
          copyBtnText.textContent = originalText;
        }, 2000);
      }
    }).catch(err => {
      console.error('Copy to clipboard failed:', err);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = rawText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Transcript copied to clipboard!');
    });
  }

  function downloadTranscript() {
    const text = getCleanTranscriptText();
    if (!text) {
      showToast('Transcript is empty. Nothing to export.', 2500);
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const header = `VOICETEXT - SPEECH TO TEXT ANALYZER\nExperiment 06: Speech-to-Text\nDate: ${new Date().toLocaleString()}\nDuration: ${formatDuration(elapsedSeconds)}\nLanguage: ${languageSelect.value}\nWord Count: ${statWordCount.textContent}\n----------------------------------------\n\n`;
    const fullContent = header + text;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VoiceText_Transcript_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Transcript downloaded as .TXT file.');
  }

  function speakTranscript() {
    const text = getCleanTranscriptText();
    if (!text) {
      showToast('No text available to read aloud.', 2500);
      return;
    }

    if (!window.speechSynthesis) {
      showToast('Speech Synthesis is not supported in this browser.', 3000);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageSelect.value;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => showToast('Reading transcript aloud...');
    utterance.onerror = () => showToast('Speech synthesis interrupted.');

    window.speechSynthesis.speak(utterance);
  }

  // =========================================================================
  // Transcript Rendering & Editing
  // =========================================================================
  function renderTranscript(finalText, interimText) {
    if (!transcriptDisplay) return;

    if (!finalText && !interimText) {
      transcriptDisplay.innerHTML = '<span class="transcript-placeholder">Your spoken words will appear here in real time. Click "Start Listening" and speak into your microphone...</span>';
      if (interimDisplay) interimDisplay.style.display = 'none';
      return;
    }

    // Display final text
    transcriptDisplay.textContent = finalText;

    // Display interim provisional text
    if (interimDisplay) {
      if (interimText && interimToggle.checked) {
        interimDisplay.textContent = ' ' + interimText;
        interimDisplay.style.display = 'inline';
      } else {
        interimDisplay.style.display = 'none';
        interimDisplay.textContent = '';
      }
    }

    // Auto-scroll transcript container to bottom so latest words stay visible
    const wrapper = transcriptDisplay.closest('.transcript-box-wrapper');
    if (wrapper) {
      wrapper.scrollTop = wrapper.scrollHeight;
    }
  }

  function getCleanTranscriptText() {
    if (!transcriptDisplay) return '';
    const placeholder = transcriptDisplay.querySelector('.transcript-placeholder');
    if (placeholder) return '';
    return transcriptDisplay.innerText.trim();
  }

  if (editToggleBtn) {
    editToggleBtn.addEventListener('click', () => {
      const isEditable = transcriptDisplay.getAttribute('contenteditable') === 'true';
      if (!isEditable) {
        transcriptDisplay.setAttribute('contenteditable', 'true');
        transcriptDisplay.focus();
        editToggleBtn.textContent = '💾 Save Edit';
        editToggleBtn.style.color = '#38bdf8';
        editToggleBtn.style.borderColor = '#38bdf8';
        showToast('Transcript is now editable.');
      } else {
        transcriptDisplay.setAttribute('contenteditable', 'false');
        finalTranscript = getCleanTranscriptText();
        updateStatistics(finalTranscript);
        editToggleBtn.textContent = '✏️ Edit Text';
        editToggleBtn.style.color = '';
        editToggleBtn.style.borderColor = '';
        showToast('Edits saved.');
      }
    });

    transcriptDisplay.addEventListener('input', () => {
      if (transcriptDisplay.getAttribute('contenteditable') === 'true') {
        const text = getCleanTranscriptText();
        finalTranscript = text;
        updateStatistics(text);
      }
    });
  }

  // =========================================================================
  // UI State Updater
  // =========================================================================
  function updateListeningUI(status) {
    // Status text & pill styles
    if (listeningStatusText) listeningStatusText.textContent = status;

    if (listeningStatusPill) {
      listeningStatusPill.className = 'status-pill';
      if (status === 'Listening') {
        listeningStatusPill.classList.add('status-listening');
      } else if (status === 'Stopped') {
        listeningStatusPill.classList.add('status-stopped');
      } else {
        listeningStatusPill.classList.add('status-waiting');
      }
    }

    // Controller card & mic button styles
    if (status === 'Listening') {
      if (controllerCard) controllerCard.classList.add('listening-active');
      if (mainMicLabel) mainMicLabel.textContent = 'Listening...';
      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;
      if (audioInputLabel) audioInputLabel.textContent = 'Microphone Active (Streaming)';
      if (liveStreamingIndicator) liveStreamingIndicator.style.display = 'inline-flex';
    } else {
      if (controllerCard) controllerCard.classList.remove('listening-active');
      if (mainMicLabel) mainMicLabel.textContent = status === 'Stopped' ? 'Resume Listening' : 'Start Listening';
      if (startBtn) startBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
      if (audioInputLabel) audioInputLabel.textContent = status === 'Stopped' ? 'Recording Paused' : 'Microphone Idle';
      if (liveStreamingIndicator) liveStreamingIndicator.style.display = 'none';
    }
  }

  // =========================================================================
  // Speaking Duration Timer
  // =========================================================================
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      if (statDuration) statDuration.textContent = formatDuration(elapsedSeconds);
      calculateWpm();
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    calculateWpm();
  }

  function resetTimer() {
    stopTimer();
    elapsedSeconds = 0;
    if (statDuration) statDuration.textContent = '00:00';
    if (statWpm) statWpm.textContent = '0 words/min';
  }

  function formatDuration(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function calculateWpm() {
    if (!statWpm || elapsedSeconds === 0) return;
    const words = parseInt(statWordCount.textContent, 10) || 0;
    const minutes = elapsedSeconds / 60;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    statWpm.textContent = `${wpm} words/min`;
  }

  // =========================================================================
  // Real-Time Statistics Calculation
  // =========================================================================
  function updateStatistics(text) {
    const cleanText = text.trim();

    // 1. Word Count
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    if (statWordCount) statWordCount.textContent = words.toLocaleString();

    // 2. Character Count (Total & without spaces)
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s+/g, '').length;
    if (statCharCount) statCharCount.textContent = charCount.toLocaleString();
    if (statCharNoSpaces) statCharNoSpaces.textContent = `${charNoSpaces.toLocaleString()} without spaces`;

    // 3. Sentence Count (Delimited by ., !, ?, or newlines)
    let sentenceCount = 0;
    if (cleanText) {
      const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
      sentenceCount = sentences.length > 0 ? sentences.length : (cleanText ? 1 : 0);
    }
    if (statSentenceCount) statSentenceCount.textContent = sentenceCount.toLocaleString();

    // 4. Update WPM
    calculateWpm();
  }

  // =========================================================================
  // Audio Visualizer (Live Microphone Stream & Web Audio API)
  // =========================================================================
  async function startAudioVisualizer() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return; // Fallback to CSS animation in style.css
    }

    try {
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (!microphoneStream) {
        microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = audioContext.createMediaStreamSource(microphoneStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateBars() {
        if (!isListening) return;

        analyser.getByteFrequencyData(dataArray);

        eqBars.forEach((bar, index) => {
          // Sample frequencies across available bins
          const binIndex = Math.floor((index / eqBars.length) * (bufferLength / 2));
          const value = dataArray[binIndex] || 0;
          const heightPercent = Math.max(8, Math.min(100, (value / 255) * 100));
          bar.style.height = `${heightPercent}%`;
        });

        animFrameId = requestAnimationFrame(updateBars);
      }

      updateBars();

    } catch (err) {
      // Permission denied or getUserMedia not supported in iframe/environment
      console.log('Real audio stream visualizer fallback to CSS keyframes:', err);
    }
  }

  function stopAudioVisualizer() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    // Reset bar heights to idle state
    eqBars.forEach((bar) => {
      bar.style.height = '';
    });
  }

  // =========================================================================
  // Toast Notification
  // =========================================================================
  let toastTimer = null;
  function showToast(message, duration = 3000) {
    if (!toastMessage) return;
    if (toastText) toastText.textContent = message;
    toastMessage.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage.classList.remove('show');
    }, duration);
  }

  // =========================================================================
  // Benchmark Example & Quick Test Simulation
  // =========================================================================
  const BENCHMARK_SENTENCE = "Artificial intelligence is transforming healthcare.";

  function simulateBenchmarkExample(sentenceToSimulate = BENCHMARK_SENTENCE) {
    // If active listening, stop first
    if (isListening) stopListening();

    clearTranscript();
    updateListeningUI('Listening');
    startTimer();

    let currentIndex = 0;
    const words = sentenceToSimulate.split(' ');

    const simulationInterval = setInterval(() => {
      if (currentIndex < words.length) {
        const partialWords = words.slice(0, currentIndex + 1).join(' ');
        finalTranscript = partialWords;
        renderTranscript(finalTranscript, '');
        updateStatistics(finalTranscript);
        currentIndex++;
      } else {
        clearInterval(simulationInterval);
        setTimeout(() => {
          updateListeningUI('Stopped');
          stopTimer();
          showToast('Benchmark example transcribed successfully!');
        }, 400);
      }
    }, 280);
  }

  if (simulateExampleBtn) {
    simulateExampleBtn.addEventListener('click', () => {
      simulateBenchmarkExample(BENCHMARK_SENTENCE);
    });
  }

  if (speakExamplePromptBtn) {
    speakExamplePromptBtn.addEventListener('click', () => {
      if (!window.speechSynthesis) {
        showToast('Speech synthesis not available.', 2000);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(BENCHMARK_SENTENCE);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
      showToast('Playing benchmark audio prompt...');
    });
  }

  // Quick Test Prompt Chips
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-text');
      if (promptText) {
        simulateBenchmarkExample(promptText);
      }
    });
  });

  // =========================================================================
  // Event Listeners for Controls
  // =========================================================================
  if (mainMicBtn) mainMicBtn.addEventListener('click', toggleListening);
  if (startBtn) startBtn.addEventListener('click', startListening);
  if (stopBtn) stopBtn.addEventListener('click', stopListening);
  if (clearBtn) clearBtn.addEventListener('click', clearTranscript);
  if (copyBtn) copyBtn.addEventListener('click', copyTranscript);
  if (downloadTxtBtn) downloadTxtBtn.addEventListener('click', downloadTranscript);
  if (speakTextBtn) speakTextBtn.addEventListener('click', speakTranscript);

  // Language Change Listener
  if (languageSelect) {
    languageSelect.addEventListener('change', () => {
      if (recognition) {
        recognition.lang = languageSelect.value;
        showToast(`Language set to ${languageSelect.options[languageSelect.selectedIndex].text}`);
        if (isListening) {
          // Restart recognition with new language
          recognition.stop();
        }
      }
    });
  }

  // Continuous Mode Toggle
  if (continuousToggle) {
    continuousToggle.addEventListener('change', () => {
      if (recognition) {
        recognition.continuous = continuousToggle.checked;
        showToast(`Continuous listening ${continuousToggle.checked ? 'enabled' : 'disabled'}`);
      }
    });
  }

  // Interim Results Toggle
  if (interimToggle) {
    interimToggle.addEventListener('change', () => {
      if (recognition) {
        recognition.interimResults = interimToggle.checked;
        if (!interimToggle.checked && interimDisplay) {
          interimDisplay.style.display = 'none';
        }
      }
    });
  }

  // =========================================================================
  // Help Modal Handlers
  // =========================================================================
  function openHelpModal() {
    if (helpModal) helpModal.style.display = 'flex';
  }

  function closeHelpModal() {
    if (helpModal) helpModal.style.display = 'none';
  }

  if (helpModalBtn) helpModalBtn.addEventListener('click', openHelpModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeHelpModal);
  if (modalGotItBtn) modalGotItBtn.addEventListener('click', closeHelpModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeHelpModal);

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal && helpModal.style.display === 'flex') {
      closeHelpModal();
    }
  });

  // Keyboard shortcut: Spacebar or Ctrl+M to toggle mic when not editing text
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.getAttribute('contenteditable') === 'true') {
      return;
    }
    if ((e.ctrlKey && e.key.toLowerCase() === 'm') || (e.code === 'Space' && e.target === document.body)) {
      e.preventDefault();
      toggleListening();
    }
  });
});
