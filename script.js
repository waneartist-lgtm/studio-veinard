(function () {
  var screens = document.querySelectorAll('.screen');
  var navLinks = document.querySelectorAll('.nav-link');
  var mobileMenu = document.getElementById('mobileMenu');
  var hamburger = document.getElementById('hamburger');
  var wipe = document.getElementById('wipe');
  var wipeTimer = null;

  var screenTitles = {
    home: 'Studio Veinard — Création visuelle & motion design',
    studio: 'Le studio — Studio Veinard',
    services: 'Services — Studio Veinard',
    contact: 'Contact — Studio Veinard'
  };

  function showScreen(tab) {
    screens.forEach(function (s) {
      s.classList.toggle('active', s.dataset.screen === tab);
    });
    navLinks.forEach(function (l) {
      l.classList.toggle('active', l.dataset.tab === tab);
    });
    document.title = screenTitles[tab] || screenTitles.home;
    mobileMenu.hidden = true;
    turnSoundOff();
    playWipe();
    window.scrollTo(0, 0);
  }

  var soundBtn = document.getElementById('soundBtn');
  var reel = document.getElementById('vnd-reel');
  var soundOn = false;
  function turnSoundOff() {
    if (!soundOn) return;
    soundOn = false;
    soundBtn.textContent = '✕ Son off';
    if (reel && reel.contentWindow) {
      reel.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: true }), '*');
      reel.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 0 }), '*');
    }
  }

  function playWipe() {
    if (wipeTimer) clearTimeout(wipeTimer);
    wipe.hidden = false;
    wipe.style.animation = 'none';
    void wipe.offsetWidth;
    wipe.style.animation = '';
    wipeTimer = setTimeout(function () { wipe.hidden = true; }, 520);
  }

  document.querySelectorAll('[data-go]').forEach(function (btn) {
    btn.addEventListener('click', function () { showScreen(btn.dataset.go); });
  });

  hamburger.addEventListener('click', function () {
    mobileMenu.hidden = !mobileMenu.hidden;
  });

  showScreen('home');
  wipe.hidden = true;

  soundBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? '♪ Son on' : '✕ Son off';
    if (reel && reel.contentWindow) {
      reel.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: !soundOn }), '*');
      reel.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: soundOn ? 1 : 0 }), '*');
    }
  });

  var recEl = document.getElementById('vnd-rec');
  var recT0 = performance.now();
  setInterval(function () {
    var base = (performance.now() - recT0) / 1000;
    var t = base % 6000;
    var mm = String(Math.floor(t / 60) % 100).padStart(2, '0');
    var ss = String(Math.floor(t) % 60).padStart(2, '0');
    var ff = String(Math.floor((t % 1) * 25)).padStart(2, '0');
    recEl.textContent = mm + ':' + ss + ':' + ff;
  }, 80);

  var contactForm = document.getElementById('contactForm');
  var sentPanel = document.getElementById('sentPanel');
  var resetBtn = document.getElementById('resetBtn');
  var formError = document.getElementById('formError');
  var submitBtn = contactForm.querySelector('.form-submit');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    formError.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi...';
    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (res.ok) {
        contactForm.hidden = true;
        sentPanel.hidden = false;
      } else {
        formError.hidden = false;
      }
    }).catch(function () {
      formError.hidden = false;
    }).finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer →';
    });
  });

  resetBtn.addEventListener('click', function () {
    contactForm.reset();
    contactForm.hidden = false;
    sentPanel.hidden = true;
  });

  // email assemblé côté client pour ne pas exposer l'adresse aux scrapers dans le HTML
  var eUser = 'contact', eDomain = 'veinard' + '.pro';
  var eAddr = eUser + '@' + eDomain;
  var emailLink = document.getElementById('emailLink');
  var emailValue = document.getElementById('emailValue');
  emailLink.href = 'mailto:' + eAddr;
  emailValue.textContent = eAddr;

  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Studio Veinard',
    description: 'Studio de création visuelle — habillage TV, montage, identités animées, contenu social. Du concept à la livraison.',
    url: 'https://studioveinard.fr/',
    logo: 'https://studioveinard.fr/uploads/og-image.png',
    image: 'https://studioveinard.fr/uploads/og-image.png',
    email: eAddr,
    founder: { '@type': 'Person', name: 'Marwane Barika' },
    address: { '@type': 'PostalAddress', addressCountry: 'FR' }
  });
  document.head.appendChild(ld);
})();
