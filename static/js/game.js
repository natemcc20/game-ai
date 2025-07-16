const mic = document.getElementById('mic');
const glow = mic.querySelector('.glow');

const LANG = 'en-US';

const showGlow = () => glow.classList.add('active');
const hideGlow = () => glow.classList.remove('active'); 

const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  window.mozSpeechRecognition ||
  window.msSpeechRecognition)();

recognition.lang = LANG;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log(transcript);
  fetch(`/get_transcript?msg=${encodeURIComponent(transcript)}`)
  .then(res => res.json())
  .then(data => console.log(data.response));
};


function onHold () {
  mic.addEventListener('mousedown', () => {
    showGlow();
    recognition.start();
  });

  mic.addEventListener('mouseup', () => {
    hideGlow();
    recognition.stop();
  });

  mic.addEventListener('mouseleave', () => {
    hideGlow();
    recognition.stop();
  });
}


mic.addEventListener('touchstart', () => {
  showGlow();
  recognition.start();
});

mic.addEventListener('touchend', () => {
  hideGlow();
  recognition.stop();
});

onHold();