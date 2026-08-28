(function () {
  'use strict';

  // --- 세션 & 유입 정보 ------------------------------------------------------
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  var session = (function () {
    try {
      var s = sessionStorage.getItem('hango_sid');
      if (!s) { s = uuid(); sessionStorage.setItem('hango_sid', s); }
      return s;
    } catch (e) { return uuid(); }
  })();

  var params = new URLSearchParams(location.search);
  var utm = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    referrer: document.referrer || null,
  };

  function track(eventType, meta) {
    var body = Object.assign(
      { event_type: eventType, session_id: session, lang: window.I18N ? window.I18N.lang : 'en', quiz_set: state.setId },
      utm,
      { meta: meta || null }
    );
    navigator.sendBeacon
      ? navigator.sendBeacon('/api/events', new Blob([JSON.stringify(body)], { type: 'application/json' }))
      : fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true });
  }

  // --- 상태 ----------------------------------------------------------------
  var state = { setId: 'eps-01', questions: [], answers: [], idx: 0, result: null };

  var screens = {
    intro: document.getElementById('screen-intro'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result'),
  };
  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].classList.toggle('is-active', k === name); });
    window.scrollTo(0, 0);
  }

  // --- 퀴즈 로딩/렌더 -----------------------------------------------------
  function loadSet(id) {
    return fetch('/api/sets/' + id).then(function (r) { return r.json(); }).then(function (set) {
      state.setId = set.id;
      state.questions = set.questions;
      state.answers = new Array(set.questions.length).fill(null);
      state.idx = 0;
      document.getElementById('qTotal').textContent = set.questions.length;
    });
  }

  function renderQuestion() {
    var q = state.questions[state.idx];
    var box = document.getElementById('questionBox');
    box.innerHTML = '';
    if (q.passage) {
      var p = document.createElement('div');
      p.className = 'passage';
      p.textContent = q.passage;
      box.appendChild(p);
    }
    var prompt = document.createElement('p');
    prompt.className = 'q-prompt';
    prompt.textContent = (state.idx + 1) + '. ' + q.prompt;
    box.appendChild(prompt);

    q.choices.forEach(function (choice, ci) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice' + (state.answers[state.idx] === ci ? ' selected' : '');
      b.innerHTML = '<span class="mark">' + (ci + 1) + '</span><span>' + escapeHtml(choice) + '</span>';
      b.addEventListener('click', function () {
        state.answers[state.idx] = ci;
        renderQuestion();
      });
      box.appendChild(b);
    });

    document.getElementById('qNow').textContent = state.idx + 1;
    document.getElementById('progressBar').style.width = ((state.idx) / state.questions.length * 100) + '%';
    document.getElementById('prevBtn').disabled = state.idx === 0;
    var isLast = state.idx === state.questions.length - 1;
    document.getElementById('nextBtn').textContent = isLast ? window.I18N.t('submit_button') : window.I18N.t('next_button');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // --- 제출 & 결과 -------------------------------------------------------
  function submit() {
    var btn = document.getElementById('nextBtn');
    btn.disabled = true;
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session, quiz_set: state.setId, lang: window.I18N.lang, answers: state.answers }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || res.error || typeof res.projected_total !== 'number') throw new Error('bad_response');
        state.result = res;
        document.getElementById('progressBar').style.width = '100%';
        renderResult(res);
        track('quiz_complete', { raw: res.raw_score, band: res.band, projected: res.projected_total });
        show('result');
        track('result_view');
      })
      .catch(function () {
        btn.disabled = false;
        var box = document.getElementById('questionBox');
        var m = document.getElementById('submitError') || document.createElement('p');
        m.id = 'submitError';
        m.className = 'submit-error';
        m.textContent = window.I18N.t('submit_error');
        if (!m.parentNode) box.appendChild(m);
      });
  }

  function renderResult(res) {
    document.getElementById('scoreProjected').textContent = res.projected_total;
    var bandEl = document.getElementById('scoreBand');
    bandEl.className = 'score-band ' + res.band;
    bandEl.textContent = window.I18N.t('result_band_' + res.band);
    var gapEl = document.getElementById('scoreGap');
    gapEl.textContent = res.band === 'level2'
      ? window.I18N.t('result_gap_pass')
      : window.I18N.t('result_gap', { gap: res.gap_to_level2 });
    state.nextSet = res.next_set;
  }

  // --- 리드 수집 -------------------------------------------------------
  function submitLead() {
    var type = document.getElementById('contactType').value;
    var value = document.getElementById('contactValue').value.trim();
    var consent = document.getElementById('consentChk').checked;
    if (!value) { document.getElementById('contactValue').focus(); return; }
    if (!consent) { document.getElementById('consentChk').focus(); return; }
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session, contact_type: type, contact_value: value, consent: true,
        lang: window.I18N.lang,
        projected_total: state.result ? state.result.projected_total : null,
        band: state.result ? state.result.band : null,
      }),
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res.ok) {
        document.getElementById('leadThanks').hidden = false;
        document.getElementById('leadBtn').disabled = true;
        track('lead_submit', { contact_type: type });
      }
    });
  }

  // --- 공유 ----------------------------------------------------------
  function share(kind) {
    var url = location.origin + '/?utm_source=share&utm_medium=' + kind + '&utm_campaign=quiz_referral';
    var text = window.I18N.t('share_text');
    track('share_click', { kind: kind });
    if (kind === 'copy') {
      navigator.clipboard.writeText(url).then(function () {
        var b = document.querySelector('[data-share="copy"]');
        b.textContent = window.I18N.t('share_copied');
        setTimeout(function () { b.textContent = window.I18N.t('share_copy'); }, 2000);
      });
    } else if (kind === 'facebook') {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'noopener');
    } else if (kind === 'kakao') {
      // Kakao SDK 미도입 상태: 우선 링크 복사로 폴백
      navigator.clipboard.writeText(text + ' ' + url).then(function () {
        var b = document.querySelector('[data-share="kakao"]');
        b.textContent = window.I18N.t('share_copied');
        setTimeout(function () { b.textContent = window.I18N.t('share_kakao'); }, 2000);
      });
    }
  }

  // --- 결과 이미지 공유 (자연 확산 장치) ------------------------------
  function wrapText(x, text, cx, y, maxW, lh) {
    var words = String(text).split(' '), line = '', lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (x.measureText(test).width > maxW && line) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    var startY = y - ((lines.length - 1) * lh) / 2;
    for (var j = 0; j < lines.length; j++) x.fillText(lines[j], cx, startY + j * lh);
  }

  function drawShareCard(cv) {
    var W = 1080, H = 1080, x = cv.getContext('2d');
    var r = state.result || { projected_total: 0, band: 'below1', gap_to_level2: 140 };
    var bandColor = { level2: '#1f9d55', level1: '#c47f17', below1: '#c8442b' }[r.band] || '#5b6472';
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#0f8a86'; x.fillRect(0, 0, W, 220);
    x.textBaseline = 'middle';
    x.fillStyle = '#ffffff'; x.font = '700 64px Pretendard, sans-serif'; x.textAlign = 'left';
    x.fillText('hango', 72, 114);
    x.font = '400 32px Pretendard, sans-serif'; x.fillStyle = 'rgba(255,255,255,.9)'; x.textAlign = 'right';
    x.fillText('TOPIK · hango.kr', W - 72, 116);
    x.textAlign = 'center';
    x.fillStyle = '#5b6472'; x.font = '500 40px Pretendard, sans-serif';
    x.fillText(window.I18N.t('card_score_label'), W / 2, 360);
    x.fillStyle = '#0f8a86'; x.font = '800 200px Pretendard, sans-serif';
    x.fillText(String(r.projected_total), W / 2, 520);
    x.fillStyle = '#9aa5b1'; x.font = '600 56px Pretendard, sans-serif';
    x.fillText('/ 200', W / 2, 655);
    x.fillStyle = bandColor; x.font = '700 52px Pretendard, sans-serif';
    wrapText(x, window.I18N.t('result_band_' + r.band), W / 2, 760, W - 160, 60);
    x.fillStyle = '#1a1f2b'; x.font = '500 40px Pretendard, sans-serif';
    var gapText = r.band === 'level2' ? window.I18N.t('result_gap_pass') : window.I18N.t('result_gap', { gap: r.gap_to_level2 });
    wrapText(x, gapText, W / 2, 880, W - 160, 50);
    x.fillStyle = '#eef4f3'; x.fillRect(0, H - 128, W, 128);
    x.fillStyle = '#0b6f6c'; x.font = '600 38px Pretendard, sans-serif';
    x.fillText(window.I18N.t('card_footer'), W / 2, H - 64);
  }

  function shareResultImage() {
    var cv = document.getElementById('shareCanvas');
    var go = function () {
      drawShareCard(cv);
      cv.toBlob(function (blob) {
        if (!blob) return;
        var shareUrl = location.origin + '/?utm_source=share&utm_medium=image&utm_campaign=quiz_referral';
        var file = new File([blob], 'hango-topik-result.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], text: window.I18N.t('share_text') + ' ' + shareUrl })
            .then(function () { track('share_click', { kind: 'image_native' }); })
            .catch(function () {});
        } else {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'hango-topik-result.png';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          track('share_click', { kind: 'image_download' });
        }
      }, 'image/png');
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  }

  // --- 이벤트 바인딩 ---------------------------------------------------
  document.getElementById('shareImageBtn').addEventListener('click', shareResultImage);
  document.getElementById('startBtn').addEventListener('click', function () {
    track('quiz_start');
    renderQuestion();
    show('quiz');
  });
  document.getElementById('prevBtn').addEventListener('click', function () {
    if (state.idx > 0) { state.idx--; renderQuestion(); }
  });
  document.getElementById('nextBtn').addEventListener('click', function () {
    if (state.answers[state.idx] === null) return;
    if (state.idx < state.questions.length - 1) { state.idx++; renderQuestion(); }
    else submit();
  });
  document.getElementById('leadBtn').addEventListener('click', submitLead);
  document.getElementById('retryBtn').addEventListener('click', function () {
    loadSet(state.nextSet || 'eps-01').then(function () {
      document.getElementById('leadThanks').hidden = true;
      document.getElementById('leadBtn').disabled = false;
      renderQuestion();
      show('quiz');
      track('quiz_start', { retry: true });
    });
  });
  document.querySelectorAll('[data-share]').forEach(function (b) {
    b.addEventListener('click', function () { share(b.getAttribute('data-share')); });
  });
  document.getElementById('contactType').addEventListener('change', function () {
    var map = { email: 'lead_email_label', kakao: 'lead_kakao_label', phone: 'lead_phone_label' };
    document.getElementById('contactLabel').textContent = window.I18N.t(map[this.value]);
  });
  window.addEventListener('i18n:changed', function () {
    if (screens.quiz.classList.contains('is-active')) renderQuestion();
    if (screens.result.classList.contains('is-active') && state.result) renderResult(state.result);
  });

  // --- 부팅 ---------------------------------------------------------
  window.I18N.init().then(function () {
    return loadSet('eps-01');
  }).then(function () {
    track('page_view');
  });
})();
