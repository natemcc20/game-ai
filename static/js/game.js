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
  console.log("Transcript:", transcript);

  //Send to /get_transcript to store in Flask session
  fetch(`/get_transcript?msg=${encodeURIComponent(transcript)}`)
    .then(res => res.json())
    .then(data => {
      console.log("Stored:", data.response);

      //POST to Flask to get AI response
      return fetch('/post_transcript', {
        method: 'POST',       
        headers: {
          'Content-Type': 'application/json'  //flask is receiving..so bug not here 
        },
        body: JSON.stringify({
          value1: "Voice input received:" 
        })
      });
    })
    .then(res => res.json())
    .then(data => {
      const content = data.external_ai.response?.choices?.[0]?.message?.content;  //maybe this should be data.external_ai?.choices?.[0]?.message?.content;
      console.log("AI Response:", content); //undefined received 
      console.log(JSON.stringify(data, null, 2));

      
})    
    .catch(err => console.error("Error:", err));
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