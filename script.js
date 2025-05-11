(() => {
  /* ---------- data ---------- */
  const items = [
    {id:'shoes',jp:'トレイル／ランニングシューズ',en:'Trail / Running Shoes',req:true},
    {id:'apparel',jp:'速乾ウェア',en:'Quick-dry Apparel',req:true},
    {id:'waiver',jp:'参加同意書（署名済）',en:'Signed Waiver',req:true},
    {id:'confirmation',jp:'参加確認（QRコード）',en:'Race Confirmation (QR)',req:true},
    {id:'id',jp:'写真付き身分証',en:'Photo ID',req:true},
    {id:'gloves',jp:'グリップグローブ',en:'Grip Gloves'},
    {id:'headband',jp:'ヘッドバンド／バフ',en:'Headband / Buff'},
    {id:'sunglasses',jp:'サングラス',en:'Sunglasses'},
    {id:'hydration',jp:'ハイドレーションボトル',en:'Hydration Flask'},
    {id:'gel',jp:'エナジージェル',en:'Energy Gel'},
    {id:'salt',jp:'塩タブレット',en:'Salt Tabs'},
    {id:'towel',jp:'ハンドタオル',en:'Hand Towel'},
    {id:'change',jp:'着替え',en:'Change of Clothes'},
    {id:'sandal',jp:'サンダル',en:'Sandals'},
    {id:'ice',jp:'アイシングスプレー／テープ',en:'Ice Spray / Tape'},
    {id:'sunblock',jp:'日焼け止め',en:'Sunblock'},
    {id:'ticket',jp:'駐車券／交通ICカード',en:'Parking Pass / IC Card'},
    {id:'phonecase',jp:'防水スマホケース',en:'Waterproof Phone Case'}
  ];

  /* ---------- state ---------- */
  const STORE = 'spartan-check-v1';
  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || {};
    } catch {
      return {};
    }
  };
  let state = load();
  if (!Array.isArray(state.checked)) state.checked = [];
  let lang = state.lang || 'jp';

  const TXT = {
    jp: {
      req: '必須アイテム',
      opt: '任意アイテム',
      reqLbl: '必須',
      hide: '完了を隠す',
      notify: '忘れ物を確認',
      popup: '忘れ物チェック',
      completeBig: 'MISSION COMPLETE',
      completeSmall: 'SPATENA2025 始動',
      switch: 'EN',
      title: 'Spartan Race Gear Checklist'
    },
    en: {
      req: 'Required Items',
      opt: 'Optional Items',
      reqLbl: 'REQ',
      hide: 'Hide checked',
      notify: 'Check Missing',
      popup: 'Checklist',
      completeBig: 'MISSION COMPLETE',
      completeSmall: 'SPATENA LAUNCH',
      completeSmall: 'SPATENA2025 始動',
      switch: 'JP',
      title: 'Spartan Race Gear Checklist'
    }
  };

  /* ---------- elements ---------- */
  const qs = id => document.getElementById(id);
  const acc = qs('accordion');
  const titleEl = qs('page-title');
  const notifyBtn = qs('notify-btn');
  const langBtn = qs('lang-btn');
  const hideChk = qs('hide-done').querySelector('input');
  const hideText = qs('hide-text');
  const popup = qs('popup');
  const box = qs('popup-box');
  const popTitle = qs('popup-title');
  const popContent = qs('popup-content');

  /* ---------- functions ---------- */
  function buildAccordion() {
    acc.innerHTML = '';
    const t = TXT[lang];
    const secs = [
      { k: 'reqOpen', title: t.req,  items: items.filter(i => i.req) },
      { k: 'optOpen', title: t.opt,  items: items.filter(i => !i.req) }
    ];
    secs.forEach(sec => {
      const det = document.createElement('details');
      det.open = state[sec.k] ?? true;
      det.addEventListener('toggle', () => {
        state[sec.k] = det.open;
        save();
      });
      const sum = document.createElement('summary');
      sum.textContent = sec.title;
      det.append(sum);

      const ul = document.createElement('ul');
      ul.className = 'section-list';
      sec.items.forEach(it => {
        const li = document.createElement('li');
        li.className = 'item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = it.id;
        cb.checked = state.checked.includes(it.id);
        cb.addEventListener('change', () => {
          if (cb.checked) {
            state.checked.push(it.id);
          } else {
            state.checked = state.checked.filter(x => x !== it.id);
          }
          save();
          applyHide();
        });
        const lab = document.createElement('label');
        lab.htmlFor = it.id;
        lab.innerHTML = `${it[lang]}${it.req ? ` <span class='req-tag'>${t.reqLbl}</span>` : ''}`;
        li.append(cb, lab);
        ul.append(li);
      });
      det.append(ul);
      acc.append(det);
    });
  }

  function applyHide() {
    acc.querySelectorAll('.item').forEach(li => {
      li.style.display = (hideChk.checked && li.querySelector('input').checked) ? 'none' : 'flex';
    });
  }

  function save() {
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function renderText() {
    const t = TXT[lang];
    document.documentElement.lang = lang === 'jp' ? 'ja' : 'en';
    titleEl.textContent = t.title;
    notifyBtn.textContent = t.notify;
    langBtn.textContent = t.switch;
    hideText.textContent = t.hide;
    popTitle.textContent = t.popup;
  }

  function render() {
    renderText();
    buildAccordion();
    hideChk.checked = state.hideDone || false;
    applyHide();
  }

  /* ---------- events ---------- */
  langBtn.onclick = () => {
    lang = (lang === 'jp' ? 'en' : 'jp');
    state.lang = lang;
    save();
    render();
  };
  hideChk.onchange = e => {
    state.hideDone = e.target.checked;
    save();
    applyHide();
  };
  notifyBtn.onclick = () => {
    const miss = items.filter(i => i.req && !state.checked.includes(i.id));
    if (miss.length) {
      box.classList.remove('complete');
      popTitle.classList.remove('hidden');
      popContent.innerHTML = '<ul>' + miss.map(m => `<li>${m[lang]}</li>`).join('') + '</ul>';
    } else {
      box.classList.add('complete');
      popTitle.classList.add('hidden');
      popContent.innerHTML =
        `<div class='complete-msg'>
          <span class='big'>${TXT[lang].completeBig}</span><br>
          <span class='small'>${TXT[lang].completeSmall}</span>
        </div>`;
    }
    popup.classList.add('show');
  };
  qs('close-btn').onclick = () => popup.classList.remove('show');
  popup.onclick = e => { if (e.target.id === 'popup') popup.classList.remove('show'); };

  /* ---------- init ---------- */
  render();
})();
