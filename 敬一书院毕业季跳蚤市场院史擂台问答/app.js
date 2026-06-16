const $ = (sel) => document.querySelector(sel);
const quizForm = $('#quizForm');
const introCard = $('#introCard');
const statusBar = $('#statusBar');
const actions = $('#actions');
const resultCard = $('#resultCard');
let currentQuestions = [];
let round = 0;
let submitted = false;

function sampleQuestions(count = 10) {
  const bank = [...window.QUESTION_BANK];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank.slice(0, count);
}

function normalize(arr) {
  return [...arr].sort().join('');
}

function getUserAnswer(qid) {
  return [...document.querySelectorAll(`[name="q-${qid}"]:checked`)].map(el => el.value);
}

function renderQuiz() {
  quizForm.innerHTML = currentQuestions.map((q, idx) => {
    const isMultiple = q.answer.length > 1;
    const inputType = isMultiple ? 'checkbox' : 'radio';
    const optionHtml = Object.entries(q.options).map(([letter, text]) => `
      <label class="option">
        <input type="${inputType}" name="q-${q.id}" value="${letter}" />
        <span class="letter">${letter}</span>
        <span>${text}</span>
      </label>
    `).join('');
    return `
      <article class="question-card">
        <div class="q-head">
          <div class="q-index">${idx + 1}</div>
          <div class="q-title">${q.question}<span class="q-type">${isMultiple ? '多选 · 可多选' : '单选'}</span></div>
        </div>
        <div class="options">${optionHtml}</div>
      </article>
    `;
  }).join('');
}

function startRound() {
  round += 1;
  submitted = false;
  currentQuestions = sampleQuestions(10);
  $('#roundInfo').textContent = `第 ${round} 轮`;
  $('#progressText').textContent = `已从 ${window.QUESTION_BANK.length} 道题中随机抽取 10 题`;
  introCard.classList.add('hidden');
  statusBar.classList.remove('hidden');
  quizForm.classList.remove('hidden');
  actions.classList.remove('hidden');
  resultCard.classList.add('hidden');
  resultCard.innerHTML = '';
  renderQuiz();
  window.scrollTo({top:0, behavior:'smooth'});
}

function submitQuiz() {
  if (submitted) return;
  const unanswered = currentQuestions.filter(q => getUserAnswer(q.id).length === 0);
  if (unanswered.length) {
    alert(`还有 ${unanswered.length} 道题未作答，请完成后再提交。`);
    return;
  }
  submitted = true;
  let correct = 0;
  const details = currentQuestions.map((q, idx) => {
    const user = getUserAnswer(q.id);
    const ok = normalize(user) === normalize(q.answer);
    if (ok) correct += 1;
    return {q, idx, user, ok};
  });
  const percent = Math.round((correct / currentQuestions.length) * 100);
  const passed = percent >= 80;
  document.querySelectorAll('input').forEach(el => el.disabled = true);
  actions.classList.add('hidden');
  resultCard.classList.remove('hidden');
  resultCard.innerHTML = `
    <h2>${passed ? '挑战成功！' : '还差一点点！'}</h2>
    <div class="score">${correct}/10 · ${percent}%</div>
    ${passed ? '<div class="stamp">可兑换一个印章<br/>盖至集章卡上</div>' : '<p class="fail">再接再励，可以查看正确答案后再来一次。</p>'}
    <div class="result-actions">
      <button class="secondary" type="button" id="showAnswersBtn">查看正确答案</button>
      <button class="primary" type="button" id="againBtn">再来一次作答</button>
    </div>
    <div class="answer-list hidden" id="answerList">${renderAnswers(details)}</div>
  `;
  $('#showAnswersBtn').addEventListener('click', () => $('#answerList').classList.toggle('hidden'));
  $('#againBtn').addEventListener('click', startRound);
  resultCard.scrollIntoView({behavior:'smooth', block:'start'});
}

function renderAnswers(details) {
  return details.map(({q, idx, user, ok}) => {
    const userText = user.length ? user.map(k => `${k}. ${q.options[k]}`).join('；') : '未作答';
    const rightText = q.answer.map(k => `${k}. ${q.options[k]}`).join('；');
    return `
      <div class="answer-item ${ok ? 'correct' : 'wrong'}">
        <strong>第 ${idx + 1} 题：${ok ? '答对' : '答错'}</strong>
        <div>${q.question}</div>
        <div>你的答案：${userText}</div>
        <div>正确答案：${rightText}</div>
        <div class="source">来源：${q.source}</div>
      </div>
    `;
  }).join('');
}

$('#startBtn').addEventListener('click', startRound);
$('#reshuffleBtn').addEventListener('click', startRound);
$('#submitBtn').addEventListener('click', submitQuiz);
