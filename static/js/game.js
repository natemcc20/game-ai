const mic = document.getElementById('mic');
const glow = mic.querySelector('.glow');

    

mic.addEventListener('mousedown', showGlow);
mic.addEventListener('mouseup', hideGlow);
mic.addEventListener('mouseleave', hideGlow);

mic.addEventListener('touchstart', showGlow);
mic.addEventListener('touchend', hideGlow);