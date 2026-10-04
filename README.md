# VoiceText – Speech to Text Analyzer

> **College Text and Speech Analysis Lab**  
> **Course:** Text and Speech Analysis  
> **Experiment 06:** Speech-to-Text (Automatic Speech Recognition)

![VoiceText Banner](https://img.shields.io/badge/Experiment-06%20Speech%20to%20Text-6366f1?style=for-the-badge)
![Web Speech API](https://img.shields.io/badge/Engine-Web%20Speech%20API-06b6d4?style=for-the-badge)
![Zero Backend](https://img.shields.io/badge/Architecture-100%25%20Client--Side-10b981?style=for-the-badge)

---

## 📌 Objective

To convert human speech into written text in real time using the browser's native **Web Speech API (`SpeechRecognition`)**, evaluate acoustic-to-text transcription performance, and display live speech metrics and visual waveforms without any external backend server or paid API keys.

---

## 🛠️ Technology Stack

- **HTML5:** Semantic architecture, accessible ARIA attributes, responsive layout.
- **Vanilla CSS3:** Modern dark laboratory theme, glassmorphism, responsive grid, dynamic audio equalizer animation, and glowing concentric pulse ripples.
- **Vanilla JavaScript (ES6+):** Complete lifecycle event handling for the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), Web Audio API (`AudioContext` / `AnalyserNode`), and real-time statistical analytics.
- **Browser Web Speech API:** Client-side speech recognition pipeline connecting directly to native speech synthesis and acoustic decoders.
- **Zero External Dependencies / No Backend:** Runs entirely in the client browser with 100% privacy and zero setup overhead.

---

## 🚀 Key Features

### 1. Interactive Microphone Interface
- **Large Microphone Button:** Prominent centerpiece with interactive glowing states, breathing animations, and multi-layered concentric sound wave rings.
- **Listening Status Badges:** Visual indicators displaying real-time states:
  - `Waiting` (Idle / Ready)
  - `Listening` (Active recording with live animated dot and pulse)
  - `Stopped` (Paused or completed)
- **Audio-Style Animated Equalizer:** 20-channel frequency monitor that dynamically animates to simulate voice waveforms (utilizes browser `AudioContext` and `AnalyserNode` with smooth CSS fallback).

### 2. Live Transcript Engine
- **Real-Time Word Streaming:** Displays spoken words instantly as the user talks.
- **Interim Hypotheses:** Supports provisional words (styled with subtle cyan highlighting) before committing to final punctuated sentences.
- **Editable Transcript Mode:** Toggle between automated transcription and manual text correction.

### 3. Action Controls & Utilities
- 🎤 **Start / Large Mic Button:** Begins speech capture and asks for microphone permissions naturally.
- ⏹️ **Stop:** Safely halts recognition and records total elapsed speaking duration.
- 🗑️ **Clear:** Clears transcript text and resets all analytical statistics.
- 📋 **Copy Transcript:** Copies transcript to clipboard with visual toast feedback.
- 💾 **Export .TXT:** Generates a timestamped report file containing recognized text and analytical metrics.
- 🔊 **Read Aloud (TTS):** Uses browser Speech Synthesis to read the transcript back to the user.
- 🌐 **Multi-Language Selector:** Supports English (US, UK, India), Spanish, French, German, Hindi, Mandarin, Japanese, and Arabic.

### 4. Real-Time Laboratory Statistics
- **Word Count:** Total number of recognized spoken words.
- **Character Count:** Total characters and characters without whitespace.
- **Sentence Count:** Punctuation-based sentence segmentation.
- **Speaking Duration & WPM:** Live timer tracking active speech duration and calculating Words Per Minute.

### 5. Benchmark Experiment Verification

| Parameter | Laboratory Specification |
| :--- | :--- |
| **Input (Spoken by User)** | `“Artificial intelligence is transforming healthcare.”` |
| **Output (Website Displays)** | **Artificial intelligence is transforming healthcare.** |
| **Status** | ✅ Benchmark Verification Simulation & Audio Prompt Included |

---

## 📚 Theoretical Foundation: Automatic Speech Recognition (ASR)

> *“Speech-to-text converts spoken language into written text using automatic speech recognition.”*

### The ASR Processing Pipeline

```
[ Human Voice ]
       │
       ▼
1. Audio Digitization (Microphone sampling: 16 kHz PCM)
       │
       ▼
2. Acoustic Feature Extraction (FFT ➔ Mel-Frequency Cepstral Coefficients / MFCCs)
       │
       ▼
3. Acoustic Model (Neural Networks / Deep Conformer: Audio Frames ➔ Phonemes)
       │
       ▼
4. Language Model (N-grams / Transformers: Contextual Probability Scoring)
       │
       ▼
5. Beam Search Decoding (Phonemes ➔ Optimal Word Sequence)
       │
       ▼
[ Written Text Transcript ]
```

### Mathematical Formulation
An ASR system seeks the most likely sequence of words $\hat{W} = (w_1, w_2, \dots, w_n)$ given an acoustic observation sequence $X = (x_1, x_2, \dots, x_t)$:

$$\hat{W} = \arg\max_W P(W \mid X) = \arg\max_W \frac{P(X \mid W) \cdot P(W)}{P(X)}$$

Where:
- $P(X \mid W)$ represents the **Acoustic Model** (likelihood of acoustic features given word sequence $W$).
- $P(W)$ represents the **Language Model** (prior probability of word sequence $W$ occurring in natural language).
- $P(X)$ is constant across words and acts as a normalization factor.

---

## 🌐 Browser Compatibility

| Browser | SpeechRecognition Support | Notes |
| :--- | :---: | :--- |
| **Google Chrome** | ✅ Full Support | Native `webkitSpeechRecognition` implementation with high accuracy. |
| **Microsoft Edge** | ✅ Full Support | Built-in Chromium engine support for continuous & interim streaming. |
| **Safari (iOS & macOS)** | ✅ Full Support | Supported in Safari 14.1+ (`webkitSpeechRecognition`). |
| **Opera** | ✅ Full Support | Supported via Chromium base. |
| **Mozilla Firefox** | ⚠️ Limited / Flag-dependent | Speech API flag is disabled by default; banner informs the user. |

---

## 💻 How to Run Locally

Because VoiceText is built with standard web technologies, you can run it directly:

### Option 1: Direct File Opening
Simply double click `index.html` or open it in Google Chrome, Microsoft Edge, or Safari:
```bash
# In Windows PowerShell:
Start-Process "index.html"
```

### Option 2: Local HTTP Server (Recommended for Microphone Permissions)
Browsers handle microphone permissions with strict security policies on origins. Running a lightweight local server is recommended:

```bash
# Using Python 3:
python -m http.server 8000

# Open in browser:
http://localhost:8000
```

---

## 📁 Repository Structure

```
TSA6/
├── index.html        # Main HTML structure, layout, semantic tags & modal
├── style.css         # Modern dark-mode styling, glowing animations & equalizer
├── app.js            # Web Speech API engine, visualizer & statistics calculation
├── README.md         # Comprehensive laboratory documentation and theory
└── .gitignore        # Clean git exclusions
```

---

## 🎓 Laboratory Submission Details

- **Course:** Text and Speech Analysis (TSA)
- **Experiment No:** 06
- **Topic:** Speech-to-Text Analysis
- **Author:** Kamesh M. (`kameshpa7-hash`)
- **Institution:** Department of Computer Science & Engineering / AI & DS
