
const API_BASE_URL = 'https://r2niha2lli.execute-api.ap-south-1.amazonaws.com/Prod';

let currentQuestion = null;
let questionStartTime = 0;
let selectedOption = null;
let currentScore = 0;
let lastLatency = 'N/A';
let username = '';
let timer;
let timeLeft ;

function startGame() {
  username = document.getElementById('username').value.trim();
  if (!username) {
    alert('Please enter your name to start!');
    return;
  }

  localStorage.setItem('bidResponseBlitzUsername', username);
  document.getElementById('username-input').style.display = 'none';
  document.getElementById('game').style.display = 'block';

  loadNextQuestion();
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById('message').textContent = `Time left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('message').textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (!selectedOption) {
        document.getElementById('message').textContent = 'Too late! No bid submitted.';
        setTimeout(loadNextQuestion, 2000);
      }
    }
  }, 1000);
}

async function loadNextQuestion() {
  document.getElementById('submit-btn').disabled = true;
  document.getElementById('options').innerHTML = '';
  document.getElementById('question-text').textContent = 'Loading question...';
  document.getElementById('message').textContent = '';
  selectedOption = null;

  try {
    const response = await fetch(`${API_BASE_URL}/question`);
    const data = await response.json();

    if (response.status !== 200) {
      document.getElementById('question-text').textContent = 'Failed to load question.';
      return;
    }

    currentQuestion = data;
    questionStartTime = currentQuestion.server_start_timestamp;

    document.getElementById('question-text').textContent = currentQuestion.question_text;
    const optionsDiv = document.getElementById('options');
    currentQuestion.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = option.text;
      button.dataset.id = option.id;
      button.onclick = () => selectOption(button, option.id);
      optionsDiv.appendChild(button);
    });

    document.getElementById('submit-btn').disabled = false;
    startTimer();
  } catch (err) {
    console.error(err);
    document.getElementById('question-text').textContent = 'Error loading question.';
  }
}

function selectOption(button, id) {
  const currentlySelected = document.querySelector('.option-btn.selected');
  if (currentlySelected) currentlySelected.classList.remove('selected');
  button.classList.add('selected');
  selectedOption = id;
}

async function submitAnswer() {
  if (!selectedOption) {
    document.getElementById('message').textContent = 'Please select an answer!';
    return;
  }

  document.getElementById('submit-btn').disabled = true;
  clearInterval(timer);

  const payload = {
    question_id: currentQuestion.question_id,
    user_answer_id: selectedOption,
    server_start_timestamp: questionStartTime,
    username: username
  };

  try {
    const response = await fetch(`${API_BASE_URL}/bid-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.status !== 200) {
      document.getElementById('message').textContent = 'Submission failed.';
      return;
    }

    currentScore = result.leaderboard.find(entry => entry.username === username)?.score || currentScore;
    lastLatency = result.latency_ms;

    document.getElementById('current-score').textContent = currentScore;
    document.getElementById('last-latency').textContent = lastLatency;
    document.getElementById('message').textContent =
      `${result.points_earned.toFixed(0)} points! Latency: ${lastLatency}ms`;

    updateLeaderboard(result.leaderboard);

    setTimeout(loadNextQuestion, 2000);
  } catch (err) {
    console.error(err);
    document.getElementById('message').textContent = 'Error submitting answer.';
  }
}

function updateLeaderboard(entries) {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  entries.forEach((entry, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${index + 1}. ${entry.username}</span><span>Score: ${entry.score.toFixed(0)} | Latency: ${entry.latency.toFixed(0)}ms</span>`;
    list.appendChild(li);
  });
}

