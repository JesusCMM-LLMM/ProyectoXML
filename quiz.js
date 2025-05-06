let currentQuestion = 0;
let xmlDoc = null;
let questions = [];
let score = 0;
let answers = [];
let startTime = null;
let timerInterval = null;

function loadXML() {
  const lang = document.getElementById("language").value;
  document.getElementById("score").textContent = "";
  const file = lang === "ING" ? "xml/PreguntasING.xml" : "xml/PreguntasESP.xml"; //para seleccionar el idioma según el select del html

  const xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    const parser = new DOMParser();
    xmlDoc = parser.parseFromString(this.responseText, "application/xml"); //el DOMparser corrige la imcompatibilidad del xml con Chrome
    questions = Array.from(xmlDoc.getElementsByTagName("question"));
    currentQuestion = 0;
    score = 0;
    answers = Array(questions.length).fill(null);
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    renderQuestion();
  };
  xhttp.open("GET", file);
  xhttp.send();
}

function updateTimer() { //las constantes ayudan a mostrarlo en minutos y segundos y no solo en segundos
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
  
    document.getElementById("timer").textContent = `TIEMPO: ${minutes}m ${seconds}s`;
  }

function renderQuestion() {
  const q = questions[currentQuestion];
  const wording = q.getElementsByTagName("wording")[0].textContent;
  const choices = q.getElementsByTagName("choice");
  const form = document.getElementById("choices");

  document.getElementById("question").textContent = wording;
  form.innerHTML = "";

  Array.from(choices).forEach((choice, i) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = i;
    if (answers[currentQuestion] == i) input.checked = true;

    const label = document.createElement("label");
    label.textContent = choice.textContent;
    label.prepend(input);

    const div = document.createElement("div");
    div.appendChild(label);
    form.appendChild(div);
  });
}

function saveAnswer() { // con esta función guardamos la respues marcada al pasar adelante o atrás
  const selected = document.querySelector('input[name="choice"]:checked');
  if (selected) answers[currentQuestion] = parseInt(selected.value);
}

function nextQuestion() {
  saveAnswer();
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function prevQuestion() {
  saveAnswer();
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function resetQuiz() {
    document.getElementById("score").textContent = ""; // Limpia el mensaje de resultado y Recarga el XML y reinicia todo
    loadXML(); 
  }

function submitQuiz() {
  saveAnswer();
  score = 0;

  questions.forEach((q, idx) => {
    const correctIdx = Array.from(q.getElementsByTagName("choice")).findIndex(
      (c) => c.getAttribute("correct") === "yes"
    );
    if (answers[idx] === correctIdx) score++;
  });

  clearInterval(timerInterval);


  const totalTime = Math.floor((Date.now() - startTime) / 1000); // tiempo en segundos

  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;

  document.getElementById("score").textContent = 
    `Puntuación: ${score}/${questions.length} — Tiempo empleado: ${minutes}m ${seconds}s`;
}

// Carga por defecto
window.onload = loadXML;
