(function(){
  'use strict';

  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = String(new Date().getFullYear());
  });

  /* Gallery filter */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var items = document.querySelectorAll('#gallery li');
  var empty = document.getElementById('empty-note');
  chips.forEach(function(chip){
    chip.addEventListener('click', function(){
      var f = chip.getAttribute('data-filter');
      chips.forEach(function(c){
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var shown = 0;
      items.forEach(function(li){
        var cats = (li.getAttribute('data-cat') || '').split(' ');
        var show = f === 'all' || cats.indexOf(f) !== -1;
        li.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });

  /* Lightbox */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var img = document.getElementById('lb-img');
    var title = document.getElementById('lb-title');
    var desc = document.getElementById('lb-desc');
    var count = document.getElementById('lb-count');
    var current = 0;
    var visible = function(){
      return Array.prototype.filter.call(document.querySelectorAll('#gallery li'), function(li){ return !li.hidden; })
        .map(function(li){ return li.querySelector('.g-item'); });
    };
    var show = function(i){
      var list = visible();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      var b = list[current];
      img.src = b.getAttribute('data-full');
      img.alt = b.querySelector('img').alt;
      title.textContent = b.getAttribute('data-title');
      desc.textContent = b.getAttribute('data-desc');
      count.textContent = (current + 1) + ' / ' + list.length;
    };
    document.querySelectorAll('.g-item').forEach(function(b){
      b.addEventListener('click', function(){
        show(visible().indexOf(b));
        if (typeof lb.showModal === 'function') { lb.showModal(); } else { lb.setAttribute('open', ''); }
      });
    });
    lb.addEventListener('click', function(e){
      var t = e.target.closest('[data-lb]');
      if (e.target === lb) { lb.close(); return; }
      if (!t) return;
      var a = t.getAttribute('data-lb');
      if (a === 'close') lb.close();
      if (a === 'prev') show(current - 1);
      if (a === 'next') show(current + 1);
    });
    lb.addEventListener('keydown', function(e){
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* Brief planner (local only, nothing is sent) */
  var form = document.getElementById('planner');
  var out = document.getElementById('brief-out');
  if (form && out) {
    var build = function(){
      var type = (form.querySelector('input[name="type"]:checked') || {}).value || 'a design';
      var occasion = form.elements.occasion.value.trim();
      var words = form.elements.words.value.trim();
      var notes = form.elements.notes.value.trim();
      var colours = Array.prototype.map.call(form.querySelectorAll('input[name="colour"]:checked'), function(c){ return c.value; });
      var lines = ['Hi Loz! I\'d love to commission ' + type + '.'];
      if (occasion) lines.push('It\'s for: ' + occasion + '.');
      if (words) lines.push('Words to include: ' + words + '.');
      if (colours.length) lines.push('Colours I love: ' + colours.join(', ') + '.');
      if (notes) lines.push(notes);
      out.textContent = lines.join('\n');
    };
    form.addEventListener('input', build);
    form.addEventListener('change', build);
    form.addEventListener('submit', function(e){ e.preventDefault(); });
    build();

    var copyBtn = document.getElementById('copy-brief');
    var status = document.getElementById('copy-status');
    copyBtn.addEventListener('click', function(){
      var text = out.textContent;
      var done = function(){ status.textContent = 'Copied. Paste it into a DM on Instagram.'; };
      var fail = function(){ status.textContent = 'Select the message above and copy it manually.'; };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy') ? done() : fail(); } catch (err) { fail(); }
        document.body.removeChild(ta);
      }
    });
  }
})();
