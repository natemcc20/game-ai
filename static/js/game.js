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
      console.log("stored", data.stored);

      //POST to Flask to get AI response
      return fetch('/post_transcript', {
        method: 'POST',       
        headers: {
          'Content-Type': 'application/json'  
        },
        body: JSON.stringify({
          value1: "Voice input received:" 
        })
      });
    })
    .then(res => res.json())
    .then(data => {
      const content = data.external_api_response?.choices?.[0]?.message?.content;
      console.log("AI Response:", content);
      console.logt("Full AI response:", data)
      
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