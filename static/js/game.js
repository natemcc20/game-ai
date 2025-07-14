const mic = document.getElementById('mic');
const glow = mic.querySelector('.glow');

const showGlow = () => glow.classList.add('active');
const hideGlow = () => glow.classList.remove('active'); 

mic.addEventListener('mousedown', showGlow);
mic.addEventListener('mouseup', hideGlow);
mic.addEventListener('mouseleave', hideGlow);

mic.addEventListener('touchstart', showGlow);
mic.addEventListener('touchend', hideGlow);