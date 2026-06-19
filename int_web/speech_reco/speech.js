const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch(`http://localhost:3000/update-text/${id}`)
    .then(res => res.json())
    .then(data => {
        console.log("取得したデータ：", data);
        document.getElementById("text-box").innerText = `Q：${data.text}`;
    });

document.getElementById("send-answer").addEventListener("click", () => {
    const question = document.getElementById("text-box").innerText;
    const answer = document.getElementById("answer-input").value;

    fetch("http://localhost:5000/review-answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ question, answer })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("review-box").innerText = data.review;
    });
});

const modal = document.getElementById("recordModal");
const openBtn = document.getElementById("openRecordPopup");
const closeBtn = document.getElementById("closePopup");

const screenRecord = document.getElementById("screen-record");
const screenResult = document.getElementById("screen-result");

const micBtn = document.getElementById("micBtn");
const recordMessage = document.getElementById("recordMessage");
const timerEl = document.getElementById("timer");

const resultText = document.getElementById("resultText");
const decideBtn = document.getElementById("decideBtn");
const redoBtn = document.getElementById("reboBtn");

let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let timerInterval;
let remainingSeconds = 15;
let startRecordinggnizedText = "";

// モーダル開閉
openBtn.onclick = () => {
  modal.classList.remove("hidden");
  showRecordScreen();
};
closeBtn.onclick = () => modal.classList.add("hidden");

// 録音画面
function showRecordScreen() {
  screenRecord.classList.remove("hidden");
  screenResult.classList.add("hidden");

  micBtn.classList.remove("mic-red");
  micBtn.classList.add("mic-gray");

  recordMessage.textContent = "マイクを押して録音を開始してください";
  timerEl.classList.add("hidden");
  resetTimer();
}

// 結果画面
function showResultScreen() {
  screenRecord.classList.add("hidden");
  screenResult.classList.remove("hidden");
}

// タイマー
function resetTimer() {
  clearInterval(timerInterval);
  remainingSeconds = 15;
  timerEl.textContent = `残り 00:${String(remainingSeconds).padStart(2,"0")}`;
}

function startTimer() {
  timerEl.classList.remove("hidden");
  timerInterval = setInterval(() => {
    remainingSeconds--;
    timerEl.textContent = `残り 00:${String(remainingSeconds).padStart(2,"0")}`;

    if (remainingSeconds <= 0) {
      stopRecording();
    }
  }, 1000);
}

// 録音開始
async function startRecording() {
  isRecording = true;

  micBtn.classList.remove("mic-gray");
  micBtn.classList.add("mic-red");

  recordMessage.textContent = "録音中…";
  audioChunks = [];

  startTimer();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  mediaRecorder.start();
}

// 録音停止
function stopRecording() {
  if (!isRecording) return;
  isRecording = false;

  micBtn.classList.remove("mic-red");
  micBtn.classList.add("mic-gray");

  recordMessage.textContent = "音声認識中…";
  clearInterval(timerInterval);
  timerEl.classList.add("hidden");

  mediaRecorder.stop();
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    sendToWhisper(blob);
  };
}

micBtn.onclick = () => {
  if (!isRecording) startRecording();
  else stopRecording();
};

// Whisperにデータ送信
async function sendToWhisper(blob){
  recordMessage.textContent = "音声認識中…";

  const formData = new FormData();
  formData.append("audio", blob, "voice.webm");

  try {
    const res = await fetch("http://localhost:5000/transcribe", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    resultText.value = data.text || "（認識できませんでした）";
    showResultScreen();
  } catch (err) {
    console.error("音声送信エラー：", err);
    resultText.value = "エラーが発生しました";
    showResultScreen();
  }
}

redoBtn.onclick = () => {
  showRecordScreen();
};

decideBtn.onclick = () => {
  modal.classList.add("hidden");

  const answerInput = document.getElementById("answer-input");
  if (answerInput) answerInput.value = resultText.value;
};

