(function(){
  function getStoredLang(){
    try { return localStorage.getItem('vnr_lang'); } catch(e){ return null; }
  }
  function storeLang(lang){
    try { localStorage.setItem('vnr_lang', lang); } catch(e){ /* ignore */ }
  }

  let currentLang = getStoredLang() || 'es';
  if(!translations[currentLang]) currentLang = 'es';

  function applyLanguage(lang){
    if(!translations[lang]) return;
    currentLang = lang;
    storeLang(lang);
    document.documentElement.lang = lang;
    const dict = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      const key = el.getAttribute('data-i18n');
      if(dict[key] !== undefined){
        el.innerHTML = dict[key];
      }
    });
    document.querySelectorAll('#langSwitch button').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    applyLanguage(currentLang);

    const langSwitch = document.getElementById('langSwitch');
    if(langSwitch){
      langSwitch.addEventListener('click', function(e){
        const btn = e.target.closest('button[data-lang]');
        if(!btn) return;
        applyLanguage(btn.getAttribute('data-lang'));
      });
    }

    // Mobile nav
    const burger = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');
    if(burger && navLinks){
      burger.addEventListener('click', function(){ navLinks.classList.toggle('open'); });
    }

    // Mark active nav link based on current page
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[href]').forEach(function(a){
      const href = a.getAttribute('href');
      if(href === path || (path === '' && href === 'index.html')){
        a.classList.add('active');
      }
    });

    // FAQ accordion
    document.querySelectorAll('.faq-item').forEach(function(item){
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      if(!q || !a) return;
      q.addEventListener('click', function(){
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function(other){
          if(other !== item){
            other.classList.remove('open');
            other.querySelector('.faq-a').style.maxHeight = null;
          }
        });
        if(isOpen){
          item.classList.remove('open');
          a.style.maxHeight = null;
        } else {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });

    // Year in footer
    document.querySelectorAll('.year').forEach(function(el){ el.textContent = new Date().getFullYear(); });

    // ===== Contact form: Web3Forms (static-site friendly email delivery) =====
    // 1. Go to https://web3forms.com/  2. Enter hola@vivirnorural.com and get a free Access Key
    // 3. Paste it below, replacing REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY
    const WEB3FORMS_ACCESS_KEY = "REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY";

    const form = document.getElementById('contactForm');
    if(form){
      const formMsg = document.getElementById('formMsg');
      const submitBtn = document.getElementById('submitBtn');

      form.addEventListener('submit', async function(e){
        e.preventDefault();
        if(form.botcheck.checked){ return; }

        const dict = translations[currentLang];
        formMsg.className = '';
        formMsg.style.display = 'none';

        const payload = {
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "Nueva consulta desde vivirnorural.com",
          from_name: "Vivir no Rural — Formulario web",
          name: form.name.value,
          email: form.email.value,
          phone: form.phone.value,
          budget: form.budget.value,
          message: form.message.value,
          language: currentLang
        };

        if(WEB3FORMS_ACCESS_KEY === "REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY"){
          formMsg.textContent = "⚠️ Configura tu clave de Web3Forms en assets/main.js (busca WEB3FORMS_ACCESS_KEY) para activar el envío de emails reales. Mientras tanto, escribe a hola@vivirnorural.com.";
          formMsg.className = 'err';
          formMsg.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = dict.form_sending || 'Enviando…';

        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await res.json();
          if(result.success){
            formMsg.textContent = dict.form_ok;
            formMsg.className = 'ok';
            form.reset();
          } else {
            throw new Error(result.message || 'Error');
          }
        } catch(err){
          formMsg.textContent = dict.form_err;
          formMsg.className = 'err';
        } finally {
          formMsg.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    }
  });
})();
