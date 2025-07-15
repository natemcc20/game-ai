const mic = document.getElementById('mic');
const glow = mic.querySelector('.glow');

audioRecorder = new WebAudioRecorder(sourceNode, {
  workerDir: "/static/js/"     
});

const showGlow = () => glow.classList.add('active');
const hideGlow = () => glow.classList.remove('active'); 

const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  window.mozSpeechRecognition ||
  window.msSpeechRecognition)();

recognition.lang = LANG;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  outputDiv.textContent += ` ${transcript}`;
};



function onHold () {
    mic.addEventListener('mousedown', showGlow);
    mic.addEventListener('mouseup', hideGlow);
    mic.addEventListener('mouseleave', hideGlow);
    recognition.onstart = () => startButton.textContent = "Listening...";;
    recognition.onend = () => startButton.textContent = "Start Voice Input";;
    mic.addEventListener("mousedown", () => recognition.start());
    mic.addEventListener("mouseup", () => recognition.stop()); 
    console.log(transcript); 
}

mic.addEventListener('touchstart', showGlow);
mic.addEventListener('touchend', hideGlow);