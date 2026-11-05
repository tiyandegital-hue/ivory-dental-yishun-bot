// Ivory Dental — interactive WhatsApp demo (client-side only, sample data).
// Flow, verbatim from STITCH-EXPORT.md: greeting -> treatment -> clinic -> sample slots
// -> confirmation -> optional 24h reminder test -> reset. No data is sent anywhere.
(function () {
  'use strict';
  var TREATMENTS = ['Check-up & Cleaning', 'Teeth Whitening', 'Wisdom Tooth', 'Braces / Aligners'];
  var CLINICS = ['Yishun (St 42)', 'Tampines [TO CONFIRM]'];
  var SLOTS = ['Tomorrow \u2022 10:30 AM', 'Tomorrow \u2022 2:15 PM', 'Thu \u2022 9:00 AM'];

  function initChat(root) {
    if (!root) return;
    var log = root.querySelector('[data-chat-log]');
    var chips = root.querySelector('[data-chat-chips]');
    var reminderBtn = root.querySelector('[data-reminder-btn]');
    var resetBtn = root.querySelector('[data-reset-btn]');
    var state = { step: 'treatment', treatment: null, clinic: null, time: null, reminded: false };

    function el(tag, cls, html) {
      var d = document.createElement(tag);
      if (cls) d.className = cls;
      if (html !== undefined) d.innerHTML = html;
      return d;
    }
    function timeNow() { return '09:41 AM'; }
    function botBubble(html) {
      var b = el('div', 'bubble bot');
      b.innerHTML = '<span class="who">Ivory Concierge</span>' + html + '<span class="time">' + timeNow() + '</span>';
      log.appendChild(b); log.scrollTop = log.scrollHeight;
    }
    function userBubble(text) {
      var b = el('div', 'bubble user');
      b.textContent = text;
      var t = el('span', 'time'); t.innerHTML = '10:05 AM <span class="ticks">\u2713\u2713</span>';
      b.appendChild(t); log.appendChild(b); log.scrollTop = log.scrollHeight;
    }
    function setChips(items, handler) {
      chips.innerHTML = '';
      items.forEach(function (label) {
        var c = el('button', 'chip', label);
        c.type = 'button';
        c.addEventListener('click', function () { handler(label); });
        chips.appendChild(c);
      });
    }
    function clearChips() { chips.innerHTML = ''; }
    function withTyping(fn) {
      var t = el('div', 'typing', '<i></i><i></i><i></i> Ivory Concierge is typing');
      log.appendChild(t); log.scrollTop = log.scrollHeight;
      setTimeout(function () { t.remove(); fn(); }, 650);
    }
    function divider(text) {
      var d = el('div', 'date-divider', text); log.appendChild(d);
    }
    function greeting() {
      log.innerHTML = ''; chips.innerHTML = '';
      reminderBtn.style.display = 'none';
      divider('TODAY');
      botBubble('Hi there! Welcome to Ivory Dental. I can help you book an appointment. What would you like to do today?');
      state = { step: 'treatment', treatment: null, clinic: null, time: null, reminded: false };
      setChips(TREATMENTS, onTreatment);
    }
    function onTreatment(label) {
      state.treatment = label; userBubble(label); clearChips();
      withTyping(function () {
        botBubble('Perfect! ' + label + ' is a great choice. Which clinic would you prefer?');
        setChips(CLINICS, onClinic);
      });
    }
    function onClinic(label) {
      state.clinic = label; userBubble(label); clearChips();
      withTyping(function () {
        botBubble('Great! Here are the sample available slots for ' + state.treatment + ' at ' + label + ':');
        var s = el('div', 'slot-label', 'SAMPLE AVAILABLE SLOTS'); log.appendChild(s);
        setChips(SLOTS.map(function (x, i) { return x + ' [Sample]' + (i === 0 ? ' \u2605 Fastest' : ''); }), onSlot);
      });
    }
    function onSlot(label) {
      state.time = label.replace(' [Sample]', '').replace(' \u2605 Fastest', '');
      userBubble(label); clearChips();
      withTyping(function () {
        botBubble('<strong>Booking Request Received!</strong><br>Clinic: ' + state.clinic +
          '<br>Treatment: ' + state.treatment + '<br>Time: ' + state.time + ' [Sample]' +
          '<br><br>Our clinic receptionist will confirm during working hours via WhatsApp or SMS.');
        reminderBtn.style.display = 'inline-block';
      });
    }
    function onReminder() {
      if (state.reminded) return;
      state.reminded = true; reminderBtn.style.display = 'none';
      divider('24 Hours Before Appointment');
      withTyping(function () {
        botBubble('Hi! Friendly reminder for your ' + state.treatment + ' at ' + state.time + ' at Ivory Dental ' + (state.clinic.indexOf('Yishun') !== -1 ? 'Yishun' : 'Tampines') + '. Reply 1 to Confirm, or tap an option below:');
        setChips(['Confirm Appointment', 'Request Reschedule', 'Ask a Question'], function (label) {
          userBubble(label); clearChips();
          withTyping(function () {
            if (label === 'Confirm Appointment') {
              botBubble('Thank you! Your confirmation is noted. Our clinic receptionist will confirm during working hours via WhatsApp or SMS.');
            } else if (label === 'Request Reschedule') {
              botBubble('No problem. Tap Reset below to choose a new sample time, or call 6677 6080 for help during working hours.');
            } else {
              botBubble('Happy to help. Please call 6677 6080 or email contact@ivorydental.sg and our team will assist during working hours.');
            }
          });
        });
      });
    }
    reminderBtn.addEventListener('click', onReminder);
    resetBtn.addEventListener('click', greeting);
    greeting();
  }

  document.querySelectorAll('[data-chat]').forEach(initChat);

  // Booking form: demo only — shows a confirmation note, sends nothing.
  var form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('f-name').value.trim();
      var note = document.getElementById('booking-confirm');
      note.hidden = false;
      note.innerHTML = '<strong>Thank you' + (name ? ', ' + name.replace(/</g, '&lt;') : '') +
        '.</strong> This is a demo request only — no real appointment has been booked. ' +
        'Our clinic receptionist will confirm during working hours via WhatsApp or SMS.';
      note.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();
