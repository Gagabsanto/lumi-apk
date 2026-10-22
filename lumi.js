/* Lumi 1.7 - interface: abas (Fotos, Álbuns, Favoritos, Limpeza), lista rápida que só desenha
   o que aparece na tela e miniaturas leves feitas pelo Android.
   Lê fotos e vídeos pelo plugin nativo LumiGaleria, organiza por pasta e por nome
   de arquivo (fatos, sem IA), mostra o visualizador com zoom e exclui com a
   confirmação do Android. Novidades da 1.4: player de vídeo próprio, favoritos, compartilhar e
   puxar a tela para atualizar. Este arquivo não faz nenhuma chamada de rede. */
'use strict';
var items = [], tela = null, sub = null, curList = null, selMode = false, lp = false, aba = 'fotos';
var vlist = [], vi = 0, SDK = 0, info = {}, carregando = false, nivel = 0, compacto = false;
var pendAba = false, inicio = Date.now(), msgT = null, fechaT = null, tapT = null, rzT = null, reduz = false, ys = {};
var Z = { s: 1, x: 0, y: 0 }, G = null, ultToque = 0, ultX = 0, ultY = 0;
var Galeria = (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.LumiGaleria) || null;
var io = null, VL = null, agendado = false, larg = 0, cab = { total: 0, fn: function () { return ''; } };
var GRID = 320, CAPA = 480, GRANDE = 50 * 1048576, ABAS = ['fotos', 'albuns', 'favoritos', 'limpeza', 'ajustes'];
var fila = [], pedindo = 0;
var DS = null, dicaFeita = false;
var favs = {}, favMudou = false, FAVK = 'lumi.favoritos';
var PT = null, puxouT = 0, atualizando = false, PTR_GATILHO = 64, PTR_MAX = 110;
var VEL = [1, 1.5, 2, 0.5], velI = 0, sk = null, ctlT = null, paisagem = false, tickOn = false;
var saltoAcum = 0, saltoDir = 0, ultSalto = 0, skT = 0;
var permEst = '', ultLeitura = 0, retomando = false, LIMITE_GRANDE = 30e6;
var dupSets = [], dupFeito = false, escaneando = false, dupProg = '', dupDesc = null, hc = {};
var CRIADOR = { nome: 'Tobias', marca: 'sttobii apps', email: 'sttobii.apps@gmail.com', insta: 'st.tobii' };
var BQ = { inp: null, q: '', t: null };
var LOGD = [], ULT = { fmt: 1, ms: 0, n: 0 }, TEMPOS = { 1: 0, 2: 0 }, LIX = { itens: null, suportado: true };
function logd(m) { LOGD.push(new Date().toLocaleTimeString('pt-BR') + ' ' + m); if (LOGD.length > 40) LOGD.shift(); }
window.addEventListener('error', function (e) { logd('erro: ' + (e.message || '') + ' (' + String(e.filename || '').split('/').pop() + ':' + (e.lineno || 0) + ')'); });
window.addEventListener('unhandledrejection', function (e) { logd('promessa: ' + ((e.reason && e.reason.message) || e.reason)); });
var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
try { reduz = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { reduz = false; }

window.onerror = function (m) { setm('Erro inesperado: ' + m, true); };
function $(s) { return document.querySelector(s); }
function el(t, c, x) {
  var e = document.createElement(t);
  if (c) e.className = c;
  if (x != null) e.textContent = x;
  return e;
}
function raf(f) { if (window.requestAnimationFrame) requestAnimationFrame(f); else setTimeout(f, 16); }
/* ---------- ícones (SVG sem arquivos externos) ---------- */
var ICO = {
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  pause: '<rect x="6" y="4.5" width="4.3" height="15" rx="1.3"/><rect x="13.7" y="4.5" width="4.3" height="15" rx="1.3"/>',
  b10: '<path d="M12 5a8 8 0 1 1-7.6 5.5"/><path d="M12 1.2L8.2 5 12 8.6"/><text x="12" y="16.2" font-size="7.4" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none">10</text>',
  f10: '<path d="M12 5a8 8 0 1 0 7.6 5.5"/><path d="M12 1.2L15.8 5 12 8.6"/><text x="12" y="16.2" font-size="7.4" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none">10</text>',
  vol: '<path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M15.6 9.2a4 4 0 0 1 0 5.6"/><path d="M18.4 6.6a8 8 0 0 1 0 10.8"/>',
  mudo: '<path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M16 9.6l5 4.8M21 9.6l-5 4.8"/>',
  loop: '<path d="M17 2.5l3.5 3.5-3.5 3.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5"/><path d="M7 21.5L3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/>',
  rot: '<rect x="2.5" y="8.5" width="14" height="9" rx="2"/><path d="M20 4.5a6 6 0 0 1 1.8 5.2"/><path d="M21.9 6.3l-.1 3.6-3.4-.9"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  lixeira: '<path d="M3.5 6h17M8.5 6V4h7v2M6 6l1 14h10l1-14M10 10.5v6M14 10.5v6"/>',
  trash: '<path d="M3.5 6h17M8.5 6V4h7v2M6 6l1 14h10l1-14M10 10.5v6M14 10.5v6"/>',
  x: '<path d="M5 5l14 14M19 5L5 19"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  ecorte: '<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
  egira: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3.5V8.5h-5"/>',
  eajusta: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  efiltro: '<circle cx="9" cy="9" r="5.5"/><circle cx="15" cy="9" r="5.5"/><circle cx="12" cy="15" r="5.5"/>',
  seta: '<path d="M12 4v15M6 13.5l6 6 6-6"/>',
  fotos: '<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17.2l4.6-4.3a1.6 1.6 0 0 1 2.2 0L15 16.6l1.6-1.5a1.6 1.6 0 0 1 2.2 0l1.7 1.7"/>',
  albuns: '<rect x="4" y="8" width="13" height="12" rx="3.2"/><path d="M8 4.5h9a3 3 0 0 1 3 3V16"/>',
  limpa: '<path d="M10 4l1.7 4.5L16.2 10l-4.5 1.7L10 16.2l-1.7-4.5L3.8 10l4.5-1.5z"/><path d="M18 14l.8 2.2 2.2.8-2.2.8L18 20l-.8-2.2-2.2-.8 2.2-.8z"/>',
  ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  tela: '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M10.5 18.5h3"/>',
  filme: '<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M10 9.4v5.2l4.4-2.6z"/>',
  copia: '<rect x="8.5" y="8.5" width="12" height="12" rx="3.2"/><path d="M15.5 8.5v-2a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2"/>',
  grade: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
  espaco: '<path d="M3.5 6v12M20.5 6v12"/><path d="M8.5 12h7M10.8 9.5L8.3 12l2.5 2.5M13.2 9.5l2.5 2.5-2.5 2.5"/>',
  cadeado: '<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  atualiza: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.6h-4.6"/>',
  mais: '<path d="M9 5l7 7-7 7"/>',
  voltar: '<path d="M15 5l-7 7 7 7"/>',
  aviso: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  exporta: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M5 14v3.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V14"/>',
  importa: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M5 14v3.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V14"/>',
  lupa: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8v.1"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M4 7.5l8 6 8-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7v.1"/>'
};
function ico(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICO[n] || '') + '</svg>'; }
function pintaIcones() {
  var l = document.querySelectorAll('[data-i]');
  for (var k = 0; k < l.length; k++) l[k].innerHTML = ico(l[k].getAttribute('data-i'));
}
pintaIcones();

/* ---------- favoritos (ficam guardados no próprio app, só neste aparelho) ---------- */
function carregaFavs() {
  try { var s = localStorage.getItem(FAVK); favs = s ? (JSON.parse(s) || {}) : {}; } catch (e) { favs = {}; }
}
function salvaFavs() { try { localStorage.setItem(FAVK, JSON.stringify(favs)); } catch (e) { /* sem armazenamento */ } }
function ehFav(i) { return !!favs[i.u]; }
function setFav(lista, v) {
  lista.forEach(function (i) {
    if (v) favs[i.u] = Date.now(); else delete favs[i.u];
    if (i.el) i.el.classList.toggle('fav', !!v);
  });
  salvaFavs(); favMudou = true;
}
function plural(n, um, varios) { return n === 1 ? '1 ' + um : num(n) + ' ' + varios; }
carregaFavs();

/* ---------- ajustes (ficam guardados no próprio app) ---------- */
var CFGK = 'lumi.config';
var CFG = { cols: 3, gap: 3, grande: 50, pergunta: true, auto: true, compacto: true, compactoOff: false, avisaVersao: true };
var COLS_MIN = 3, COLS_MAX = 6;
function noConj(v, l, d) { return l.indexOf(v) >= 0 ? v : d; }
function carregaCfg() {
  try {
    var o = JSON.parse(localStorage.getItem(CFGK) || '{}') || {};
    CFG.cols = noConj(o.cols, [3, 4, 5, 6], 3);
    CFG.gap = noConj(o.gap, [2, 3, 6], 3);
    CFG.grande = noConj(o.grande, [30, 50, 100, 200], 50);
    CFG.pergunta = o.pergunta !== false;
    CFG.auto = true; /* sempre ligado: ao voltar para o Lumi ele procura fotos novas */
    CFG.compactoOff = o.compactoOff === true; /* só fica true se o formato compacto já falhou neste aparelho */
    CFG.compacto = !CFG.compactoOff;
    CFG.avisaVersao = o.avisaVersao !== false;
  } catch (e) { /* usa o padrão */ }
}
function salvaCfg() { try { localStorage.setItem(CFGK, JSON.stringify(CFG)); } catch (e) { /* sem armazenamento */ } }
function aplicaCfg() {
  GRANDE = CFG.grande * 1048576;
  var b = document.body;
  b.classList.toggle('c4', CFG.cols === 4);
  b.classList.toggle('c2', CFG.cols === 2);
  b.classList.toggle('c5', CFG.cols >= 5);
}
carregaCfg(); aplicaCfg();

function setm(t, fixo) {
  var e = $('#m'); if (!e) return;
  clearTimeout(msgT);
  e.classList.remove('ac');
  if (!t) { e.classList.remove('on'); return; }
  e.textContent = t; e.classList.add('on');
  if (!fixo && !/…$/.test(t)) msgT = setTimeout(function () { e.classList.remove('on'); }, 4200);
}
/* aviso com um botão (ex.: "Desfazer") */
function setmAcao(t, rot, fn, ms) {
  var e = $('#m'); if (!e) return;
  clearTimeout(msgT);
  e.textContent = '';
  var b = el('button', 'mb', rot);
  b.onclick = function () { clearTimeout(msgT); e.classList.remove('on'); e.classList.remove('ac'); fn(); };
  e.appendChild(el('span', 0, t)); e.appendChild(b);
  e.classList.add('on'); e.classList.add('ac');
  msgT = setTimeout(function () { e.classList.remove('on'); setTimeout(function () { if (!e.classList.contains('on')) e.classList.remove('ac'); }, 320); }, ms || 8000);
}
function fonte(p) { return Capacitor.convertFileSrc(p); }
function fmt(ms) {
  var s = Math.round((ms || 0) / 1000), m = Math.floor(s / 60);
  s = s % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}
function num(n) { try { return n.toLocaleString('pt-BR'); } catch (e) { return String(n); } }
function fmtTam(b) {
  b = b || 0;
  var v;
  if (b < 1048576) return Math.max(1, Math.round(b / 1024)) + ' KB';
  if (b < 1073741824) { v = b / 1048576; return (v < 10 ? v.toFixed(1) : String(Math.round(v))).replace('.', ',') + ' MB'; }
  return (b / 1073741824).toFixed(2).replace('.', ',') + ' GB';
}
function somaTam(l) { var s = 0; l.forEach(function (i) { s += i.tam || 0; }); return s; }
function dia(t) { var d = new Date((t || 0) * 1000); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
function rotuloDia(t) {
  var d = new Date(t * 1000), h = new Date();
  var k = dia(t), hoje = dia(h.getTime() / 1000);
  var ont = new Date(h.getFullYear(), h.getMonth(), h.getDate() - 1);
  if (k === hoje) return 'Hoje';
  if (k === dia(ont.getTime() / 1000)) return 'Ontem';
  var r = d.getDate() + ' de ' + MESES[d.getMonth()];
  if (d.getFullYear() !== h.getFullYear()) r += ' de ' + d.getFullYear();
  return r;
}
function porDia(l) {
  var secs = [], ult = null, s = null;
  l.forEach(function (i) {
    var d = i.t ? dia(i.t) : 0;
    if (!s || d !== ult) { ult = d; s = { titulo: i.t ? rotuloDia(i.t) : 'Sem data', itens: [], dia: true }; secs.push(s); }
    s.itens.push(i);
  });
  return secs;
}
/* nos níveis mais afastados do zoom (5 e 6 colunas) os títulos passam a ser por mês */
var COLS_MES = 5;
function rotuloMes(t) {
  var d = new Date(t * 1000), h = new Date(), n = MESES[d.getMonth()];
  n = n.charAt(0).toUpperCase() + n.slice(1);
  return d.getFullYear() === h.getFullYear() ? n : n + ' de ' + d.getFullYear();
}
function agrupaMes(secs) {
  var out = [], ult = null, m = null;
  secs.forEach(function (s) {
    if (!s.dia) { out.push(s); ult = null; m = null; return; }
    var t = s.itens.length ? s.itens[0].t : 0;
    var d = t ? new Date(t * 1000) : null, k = d ? d.getFullYear() * 12 + d.getMonth() : -1;
    if (!m || k !== ult) {
      ult = k;
      m = { titulo: t ? rotuloMes(t) : 'Sem data', itens: [], dia: true };
      out.push(m);
    }
    s.itens.forEach(function (i) { m.itens.push(i); });
  });
  return out;
}
function conta(e, total, fn) {
  if (reduz || !total) { e.textContent = fn(total); return; }
  var t0 = Date.now(), dur = 700;
  (function f() {
    var p = Math.min(1, (Date.now() - t0) / dur);
    p = 1 - Math.pow(1 - p, 3);
    e.textContent = fn(Math.round(total * p));
    if (p < 1) raf(f);
  })();
}

/* ---------- abertura animada ---------- */
function fimSplash() {
  var s = $('#splash');
  if (!s || s._ok) return;
  s._ok = true;
  var falta = Math.max(0, (reduz ? 0 : 800) - (Date.now() - inicio));
  setTimeout(function () {
    s.classList.add('sai');
    setTimeout(function () { s.style.display = 'none'; }, reduz ? 0 : 480);
  }, falta);
}

/* ---------- endereços dos arquivos originais (tenta o caminho, depois o content://) ---------- */
/* foto convertida pelo Android (cópia JPEG no cache do app; a original não é mexida) */
function gigante(i) { return (i.w || 0) * (i.h || 0) > LIMITE_GRANDE; }
function nativa(i, lado, cb) {
  try {
    var r = Galeria.imagemGrande({ u: i.u, m: i.mod, lado: lado });
    r.then(function (x) { cb((x && x.p) || ''); }, function () { cb(''); });
  } catch (e) { cb(''); }
}
function cand(i) {
  var a = [];
  if (i.p) {
    a.push(fonte(encodeURI(i.p).replace(/#/g, '%23').replace(/\?/g, '%3F')));
    a.push(fonte(i.p));
  }
  if (i.u) a.push(fonte(i.u));
  return a;
}
function observa(m) {
  if (!window.IntersectionObserver) { m._go(); return; }
  if (!io) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); e.target._go(); }
      });
    }, { rootMargin: '400px' });
  }
  io.observe(m);
}
function pronto(m) {
  m.classList.add('ok');
  var p = m.parentNode;
  if (p && p.classList) p.classList.add('fim');
}
/* Plano B: usa o arquivo original (se a miniatura não existir). Se nada funcionar, marca i.bad (só para não usar de capa de álbum) e chama done.
   O item NUNCA some das listas: ele aparece com um quadrado de aviso e continua podendo ser aberto, compartilhado e excluído. */
function midia(i, done) {
  var c = cand(i), k = 0, m;
  function falha() {
    k++;
    if (k < c.length) m.src = c[k] + (i.v ? '#t=0.1' : '');
    else if (!i.v && !i._nat && Galeria) {
      /* o WebView não abriu: pede ao Android para converter a foto (HEIC, AVIF etc.) */
      i._nat = true;
      nativa(i, CAPA, function (p) {
        if (p) m.src = fonte(p);
        else { i.bad = true; m.onerror = null; avisaBad(); if (done) done(); }
      });
    }
    else { i.bad = true; m.onerror = null; avisaBad(); if (done) done(); }
  }
  if (i.v) {
    m = document.createElement('video');
    m.className = 'ld';
    m.muted = true; m.playsInline = true; m.preload = 'metadata'; m.onerror = falha;
    m.onloadeddata = m.onloadedmetadata = function () { pronto(m); };
    m._go = function () { if (c.length) m.src = c[0] + '#t=0.1'; else falha(); };
    observa(m);
  } else {
    m = document.createElement('img');
    m.className = 'ld';
    m.alt = ''; m.loading = 'lazy'; m.decoding = 'async'; m.onerror = falha;
    m.onload = function () { pronto(m); };
    if (c.length) m.src = c[0]; else falha();
  }
  return m;
}

/* ---------- miniaturas (feitas pelo Android, guardadas no cache do app) ---------- */
function mini(i, lado, cb) {
  var k = 't' + lado;
  if (i[k] != null) { cb(i[k]); return; }
  if (!i._cb) i._cb = {};
  var l = i._cb[k] = i._cb[k] || [];
  l.push(cb);
  if (l.length > 1) return;
  fila.push({ i: i, k: k, lado: lado });
  bombeia();
}
function bombeia() {
  while (pedindo < 3 && fila.length) {
    var lote = [], lado = 0;
    while (fila.length && lote.length < 12) {
      var j = fila[fila.length - 1];
      if (lote.length && j.lado !== lado) break;
      fila.pop();
      if (j.lado === GRID && j.i._vis === false) { delete j.i._cb[j.k]; continue; }
      lado = j.lado; lote.push(j);
    }
    if (!lote.length) continue;
    pedindo++;
    envia(lote, lado);
  }
}
async function envia(lote, lado) {
  var res = {};
  try {
    var r = await Galeria.miniaturas({ lado: lado, itens: lote.map(function (j) { return { u: j.i.u, m: j.i.mod, v: !!j.i.v }; }) });
    res = (r && r.m) || {};
  } catch (e) { res = {}; }
  lote.forEach(function (j) {
    var p = res[j.i.u] || '';
    j.i[j.k] = p;
    var l = (j.i._cb && j.i._cb[j.k]) || [];
    if (j.i._cb) delete j.i._cb[j.k];
    l.forEach(function (f) { try { f(p); } catch (e) { /* ignora */ } });
  });
  pedindo--;
  bombeia();
}
function imgMini(p, onerr) {
  var m = document.createElement('img');
  m.className = 'ld'; m.alt = ''; m.decoding = 'async';
  m.onload = function () { pronto(m); };
  m.onerror = onerr;
  m.src = fonte(p);
  return m;
}
var badT = null;
function avisaBad() { clearTimeout(badT); badT = setTimeout(function () { diag(); }, 600); }
var imC = [];
function guardaIm(i, p, m) {
  i._im = { p: p, n: m };
  imC.push(i);
  if (imC.length > 360) { var o = imC.shift(); if (o !== i) o._im = null; }
}
function montaMidia(i, c, tk) {
  mini(i, GRID, function (p) {
    if (i.el !== c || !i._vis || c._tk !== tk) return;
    function plano() {
      var m = midia(i, function () {
        if (c._tk !== tk) return;
        c.classList.add('qb');
        if (!c.querySelector('.qbi')) c.appendChild(el('span', 'qbi', i.v ? '🎞' : '🖼'));
        c.classList.add('fim');
      });
      c.appendChild(m);
    }
    if (p) {
      var im = i._im;
      if (im && im.p === p && im.n.classList.contains('ok')) { c.appendChild(im.n); c.classList.add('fim'); return; }
      var m = imgMini(p, function () {
        i._im = null; i['t' + GRID] = '';
        if (m.parentNode === c) c.removeChild(m);
        if (c._tk === tk) plano();
      });
      c.appendChild(m);
      guardaIm(i, p, m);
    } else plano();
  });
}
function capa(list, box, from, n) {
  while (from < list.length && list[from].bad) from++;
  if (from >= list.length || n > 4) { box.style.display = 'none'; return; }
  var i = list[from], kc = 't' + CAPA;
  if (i._imc && i._imc.p === i[kc] && i._imc.n.classList.contains('ok')) { box.appendChild(i._imc.n); box.classList.add('fim'); return; }
  mini(i, CAPA, function (p) {
    function proximo() { i._imc = null; box.innerHTML = ''; capa(list, box, from + 1, n + 1); }
    if (p) { var m = imgMini(p, proximo); i._imc = { p: p, n: m }; box.appendChild(m); }
    else box.appendChild(midia(i, proximo));
  });
}

/* ---------- classificação por fatos (pasta, nome do arquivo, tamanho da tela) ---------- */
function ehPrint(w, h) {
  if (!tela || !w || !h) return false;
  var a = Math.max(w, h), b = Math.min(w, h), A = Math.max(tela.w, tela.h), B = Math.min(tela.w, tela.h);
  if (a === A && b === B) return true;
  return Math.abs(a / b - A / B) < 0.012 && a <= A * 1.02 && a >= A * 0.5;
}
function pasta(x) {
  var p = x.p || '', segs = (x.pasta || '').replace(/\\/g, '/').split('/').filter(Boolean);
  if (!segs.length) segs = p.split('/').slice(0, -1).filter(Boolean);
  var d = segs[segs.length - 1] || 'Outros';
  if (/^(sent|private)$/i.test(d)) d = (segs[segs.length - 2] || 'Outros') + ' · enviadas';
  return d;
}
var CONV = /whatsapp|telegram|messenger|signal|discord|mensagens|messages|sms|chat|conversa/i;
var PACOTES = {
  'com.whatsapp': 'WhatsApp', 'com.whatsapp.w4b': 'WhatsApp Business', 'com.instagram.android': 'Instagram',
  'com.android.chrome': 'Chrome', 'com.google.android.youtube': 'YouTube', 'com.facebook.katana': 'Facebook',
  'com.facebook.orca': 'Messenger', 'org.telegram.messenger': 'Telegram', 'com.zhiliaoapp.musically': 'TikTok',
  'com.ss.android.ugc.trill': 'TikTok', 'com.twitter.android': 'X', 'com.discord': 'Discord',
  'com.spotify.music': 'Spotify', 'com.android.settings': 'Configurações', 'com.miui.gallery': 'Galeria',
  'com.google.android.apps.photos': 'Google Fotos', 'com.google.android.apps.maps': 'Maps',
  'com.google.android.gm': 'Gmail', 'com.android.vending': 'Google Play', 'com.kwai.video': 'Kwai',
  'com.nu.production': 'Nubank', 'com.picpay': 'PicPay', 'com.mercadolibre': 'Mercado Livre'
};
/* Nome amigável do app que aparece no fim do nome do print (pode ser "Chrome" ou "com.android.chrome"). */
function nomeApp(s) {
  s = (s || '').trim();
  if (!s) return '';
  if (PACOTES[s.toLowerCase()]) return PACOTES[s.toLowerCase()];
  if (/^[a-z][\w]*(\.[\w]+)+$/i.test(s)) {
    var seg = s.split('.').filter(Boolean), ruins = { android: 1, app: 1, apps: 1, mobile: 1, production: 1, prod: 1, main: 1, client: 1, lite: 1 };
    var k = seg.length - 1;
    while (k > 0 && ruins[seg[k].toLowerCase()]) k--;
    s = seg[k];
  }
  s = s.replace(/[_-]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
/* Descobre o app pelo nome do arquivo. Formatos: Screenshot_20261012-101010_Chrome,
   Screenshot_2026-10-12-10-10-10-123_com.android.chrome (Xiaomi), Screenshot_20261012_101010_com.whatsapp... */
function appDoPrint(f) {
  var base = f.replace(/\.\w+$/, '');
  var m = base.match(/^screenshot[_ -]?\d{4}[-_]?\d{2}[-_]?\d{2}[-_ ]?\d{2}[-_:]?\d{2}[-_:]?\d{2}(?:[-_]\d+)?[_ -]+(.+)$/i);
  var s = m ? m[1] : '';
  if (!s) {
    var pk = base.match(/((?:com|org|br|io|net|app)\.[a-z0-9_]+(?:\.[a-z0-9_]+)*)/i);
    if (pk) s = pk[1];
  }
  if (/^\d+$/.test(s)) s = '';
  return nomeApp(s);
}
function album(x) {
  if (x.v) return 'Vídeos · ' + pasta(x);
  var p = x.p || '', f = x.nome || p.split('/').pop();
  if (/screenshot|captura/i.test(f) || /screenshots/i.test(p)) {
    var app = appDoPrint(f);
    if (CONV.test(app)) return 'Prints · Conversas';
    return app ? 'Prints · ' + app : 'Prints';
  }
  if (ehPrint(x.w, x.h)) return 'Prints recebidos';
  return pasta(x);
}
function groups() {
  var g = {};
  items.forEach(function (i) { (g[i.a] = g[i.a] || []).push(i); });
  return g;
}
function listaPrints() { return items.filter(function (i) { return !i.v && i.a.indexOf('Prints') === 0; }); }
function listaVideosG() { return items.filter(function (i) { return i.v && i.tam >= GRANDE; }).sort(function (a, b) { return b.tam - a.tam; }); }
function setsAtuais() {
  var ex = {};
  items.forEach(function (i) { ex[i.u] = 1; });
  return dupSets.map(function (s) { return s.filter(function (i) { return ex[i.u]; }); }).filter(function (s) { return s.length > 1; });
}

/* ---------- navegação (o botão voltar do Android funciona) ---------- */
function viewerAberto() { return document.body.classList.contains('viewer-open'); }
function empurra(n) { nivel = n; }
function fechaSub() {
  if (BQ.inp) BQ.inp.blur();
  if (viewerAberto()) fechaV();
  mostraAba(aba, true);
}
/* Botão/gesto de voltar do Android: a MainActivity chama esta função.
   Devolve true se o Lumi tratou o "voltar"; false quando está na tela inicial (aí o app fecha). */
window.lumiVoltar = function () {
  if (document.body.classList.contains('forca')) { if (forcaTeste) { tiraForca(); return true; } return false; }
  var cf0 = $('#cf');
  if (ED && !(cf0 && cf0.classList.contains('on'))) { edSai(); return true; }
  if (folhaAberta()) { fechaFolha(); return true; }
  if (viewerAberto()) { fechaV(); return true; }
  var cf = $('#cf');
  if (cf && cf.classList.contains('on')) { if ($('#cfc').onclick) $('#cfc').onclick(); return true; }
  if (selMode) {
    (curList || []).forEach(function (i) { i.s = false; pinta(i); });
    selMode = false; cabecalho();
    return true;
  }
  if (sub) { fechaSub(); return true; }
  return false;
};
function entra(c) {
  if (reduz) return;
  var a = $('#app');
  a.classList.remove('in-r'); a.classList.remove('in-l');
  void a.offsetWidth;
  a.classList.add(c);
}

/* ---------- lista virtual: só existem na tela as linhas que aparecem ---------- */
function layout(d) {
  var N = CFG.cols, W = Math.max(120, (window.innerWidth || 360) - 24), gap = CFG.gap, cw = (W - (N - 1) * gap) / N, rh = cw + gap, HH = 38;
  var y = 0, ent = [], flat = [];
  var secs = d.secoes || [{ titulo: null, itens: d.lista }];
  if (CFG.cols >= COLS_MES) secs = agrupaMes(secs);
  secs.forEach(function (s) {
    if (s.titulo) { ent.push({ k: 'h', y: y, h: HH, txt: s.titulo, it: s.dia ? s.itens : null }); y += HH; }
    for (var a = 0; a < s.itens.length; a += N) {
      var it = s.itens.slice(a, a + N);
      it.forEach(function (i) { i._ix = flat.length; flat.push(i); });
      ent.push({ k: 'r', y: y, h: rh, it: it }); y += rh;
    }
  });
  return { ent: ent, H: y, flat: flat };
}
function primeiro(ent, v) {
  var lo = 0, hi = ent.length - 1, r = ent.length;
  while (lo <= hi) {
    var m = (lo + hi) >> 1;
    if (ent[m].y + ent[m].h >= v) { r = m; hi = m - 1; } else lo = m + 1;
  }
  return r;
}
/* Linhas e células ficam num "estoque": ao sair da tela voltam para lá e são usadas de novo (menos criar/apagar elementos, menos lixo na memória). */
var estoqueL = [], tokC = 0;
function celulaNova() {
  var c = el('div', 'cell'), t = null, sx = 0, sy = 0;
  c._dur = el('span', 'dur'); c._tam = el('span', 'tam');
  c.appendChild(c._dur); c.appendChild(c._tam);
  c.appendChild(el('span', 'chk')); c.appendChild(el('span', 'fv', '♥'));
  c.oncontextmenu = function () { return false; };
  c.ontouchstart = function (e) {
    var i = c._it; if (!i) return;
    if (e.touches && e.touches.length > 1) { clearTimeout(t); return; }
    lp = false;
    var p = e.touches && e.touches[0];
    sx = p ? p.clientX : 0; sy = p ? p.clientY : 0;
    clearTimeout(t);
    t = setTimeout(function () {
      if (c._it !== i || PZ) return;
      lp = true;
      var val = selMode ? !i.s : true;
      i.s = val; pinta(i);
      if (!selMode) { selMode = true; cabecalho(); }
      iniciaDrag(i, val);
      DS.x = sx; DS.y = sy; DS.row = c._row;
      atualizaSel();
    }, 450);
  };
  c.ontouchmove = function (e) {
    if (DS) { dragMove(e); return; }
    var p = e.touches && e.touches[0];
    if (!p || Math.abs(p.clientX - sx) > 10 || Math.abs(p.clientY - sy) > 10) clearTimeout(t);
  };
  c.ontouchend = c.ontouchcancel = function () { clearTimeout(t); fimDrag(); };
  c.onclick = function () {
    var i = c._it; if (!i) return;
    if (lp) { lp = false; return; }
    if (selMode) { i.s = !i.s; pinta(i); atualizaSel(); }
    else if (sub && sub.lixeira) { i.s = true; pinta(i); selMode = true; cabecalho(); }
    else mostrar(VL ? VL.flat : [i], VL ? i._ix : 0);
  };
  return c;
}
function ligaCelula(c, i, k) {
  c._it = i; c._row = k; c._tk = ++tokC;
  i.el = c; i._vis = true;
  c.className = 'cell' + (i.s ? ' on' : '') + (ehFav(i) ? ' fav' : '');
  c.style.animationDelay = '';
  c.style.display = '';
  if (VL.anim >= 0 && VL.anim < 15) { c.classList.add('pop'); c.style.animationDelay = VL.anim * 12 + 'ms'; VL.anim++; }
  if (i.v) { c._dur.textContent = '▶ ' + fmt(i.dur); c._dur.style.display = ''; } else c._dur.style.display = 'none';
  if (VL.d.tam && i.tam) { c._tam.textContent = fmtTam(i.tam); c._tam.style.display = ''; } else c._tam.style.display = 'none';
  montaMidia(i, c, c._tk);
}
function soltaCelula(c) {
  var i = c._it;
  if (i) { if (i.el === c) i.el = null; i._vis = false; }
  c._it = null; c._tk = 0;
  var n = c.firstChild, prox;
  while (n) {
    prox = n.nextSibling;
    if (n.tagName === 'IMG' || n.tagName === 'VIDEO' || n.className === 'qbi') {
      if (n.tagName === 'VIDEO' && io) io.unobserve(n);
      c.removeChild(n);
    }
    n = prox;
  }
}
function linhaNova() {
  var n = el('div', 'vr');
  n._n = CFG.cols; n._cs = [];
  for (var q = 0; q < n._n; q++) { var c = celulaNova(); n._cs.push(c); n.appendChild(c); }
  return n;
}
function monta(k) {
  var e = VL.ent[k], n;
  if (e.k === 'h') {
    n = el('div', 'dh');
    n.appendChild(el('span', 'dt', e.txt));
    if (e.it) {
      n.classList.add('tap');
      n.appendChild(el('span', 'dsel'));
      n.onclick = function () { toggleDia(e.it); };
      estadoHeader(n, e);
    }
  }
  else {
    n = estoqueL.pop();
    if (!n || n._n !== CFG.cols) n = linhaNova();
    n.style.gridTemplateColumns = 'repeat(' + CFG.cols + ',1fr)'; n.style.gap = CFG.gap + 'px';
    for (var q = 0; q < n._cs.length; q++) {
      if (q < e.it.length) ligaCelula(n._cs[q], e.it[q], k);
      else n._cs[q].style.display = 'none';
    }
  }
  n.style.top = e.y + 'px'; n.style.height = e.h + 'px';
  VL.el.appendChild(n); VL.mont[k] = n;
}
function desmonta(k, solto) {
  var e = VL.ent[k], n = VL.mont[k];
  if (n && e && e.k === 'r') {
    n._cs.forEach(soltaCelula);
    if (n.parentNode) n.parentNode.removeChild(n);
    if (estoqueL.length < 40) estoqueL.push(n);
  } else if (!solto && n && n.parentNode) n.parentNode.removeChild(n);
  delete VL.mont[k];
}
function limpaVL() {
  if (!VL) return;
  Object.keys(VL.mont).forEach(function (k) { desmonta(+k, true); });
  if (VL.el && VL.el.parentNode) VL.el.parentNode.removeChild(VL.el);
  VL = null;
  fsInit();
}
function renderV() {
  if (!VL || !VL.ent.length) return;
  var r = VL.el.getBoundingClientRect(), topo = -r.top, h = window.innerHeight || 800, buf = h * (VL.ini ? 0.3 : 1.2);
  var lo = primeiro(VL.ent, topo - buf), hi = Math.min(VL.ent.length - 1, primeiro(VL.ent, topo + h + buf));
  Object.keys(VL.mont).forEach(function (k) { k = +k; if ((k < lo || k > hi) && !(DS && DS.row === k)) desmonta(k); });
  for (var k = lo; k <= hi; k++) if (!VL.mont[k]) monta(k);
  if (VL.anim >= 0) VL.anim = -1;
}
function agenda() {
  if (agendado) return;
  agendado = true;
  raf(function () { agendado = false; renderV(); });
}
function montaLista(d, anima, y) {
  var app = $('#app'); app.innerHTML = '';
  var L = layout(d), vl = el('div', 'vl');
  vl.style.height = L.H + 'px';
  app.appendChild(vl);
  var v = VL = { el: vl, ent: L.ent, flat: L.flat, mont: {}, d: d, anim: (anima && !reduz) ? 0 : -1 };
  curList = L.flat;
  larg = window.innerWidth || 0;
  window.scrollTo(0, y || 0);
  VL.ini = true; renderV(); VL.ini = false;
  setTimeout(function () { if (VL === v) renderV(); }, 260);
  fsInit();
}
function nsel(list) { var c = 0; list.forEach(function (i) { if (i.s) c++; }); return c; }
function pinta(i) { if (i.el) i.el.classList.toggle('on', !!i.s); }
/* ---------- selecionar o dia inteiro (toque na data) ---------- */
function estadoHeader(n, e) {
  var c = 0;
  e.it.forEach(function (i) { if (i.s) c++; });
  n.classList.toggle('on', c > 0 && c === e.it.length);
  n.classList.toggle('part', c > 0 && c < e.it.length);
}
function pintaHeaders() {
  if (!VL) return;
  Object.keys(VL.mont).forEach(function (k) {
    var e = VL.ent[k];
    if (e && e.k === 'h' && e.it) estadoHeader(VL.mont[k], e);
  });
}
function dicaSelecao() {
  if (dicaFeita) return;
  dicaFeita = true;
  setm('Pressione e arraste para selecionar várias fotos. Toque na data para selecionar o dia inteiro.');
}
function toggleDia(it) {
  var tudo = it.every(function (i) { return i.s; });
  it.forEach(function (i) { i.s = !tudo; pinta(i); });
  if (!selMode) { selMode = true; cabecalho(); }
  atualizaSel();
}

/* ---------- selecionar várias arrastando o dedo (depois de segurar uma foto) ---------- */
function iniciaDrag(i, val) {
  DS = { val: val, ancora: i._ix, ult: i._ix, base: {}, x: 0, y: 0, v: 0, timer: null };
  DS.base[i._ix] = !val;
}
function itemEm(x, y) {
  if (!VL || !VL.ent.length) return null;
  var r = VL.el.getBoundingClientRect(), yy = y - r.top, ent = VL.ent;
  var k = primeiro(ent, yy), e = ent[k], lin;
  if (!e) { lin = ent[ent.length - 1]; if (lin.k !== 'r') return null; return lin.it[lin.it.length - 1]; }
  if (e.y > yy) { if (yy < 0) { lin = ent[0].k === 'r' ? ent[0] : ent[1]; return lin ? lin.it[0] : null; } return null; }
  if (e.k !== 'r') return null;
  var col = Math.floor((x - r.left) / (r.width / CFG.cols));
  col = Math.max(0, Math.min(e.it.length - 1, col));
  return e.it[col];
}
function dragAplica() {
  if (!DS || !VL) return;
  var i = itemEm(DS.x, DS.y);
  if (!i || i._ix == null || i._ix === DS.ult) return;
  var ix = i._ix, a = Math.min(DS.ancora, ix), b = Math.max(DS.ancora, ix), fl = VL.flat;
  DS.ult = ix;
  Object.keys(DS.base).forEach(function (k) {
    k = +k;
    if (k < a || k > b) { fl[k].s = DS.base[k]; pinta(fl[k]); delete DS.base[k]; }
  });
  for (var k = a; k <= b; k++) {
    if (DS.base[k] === undefined) DS.base[k] = !!fl[k].s;
    fl[k].s = DS.val; pinta(fl[k]);
  }
  atualizaSel();
}
function bordaScroll() {
  var h = window.innerHeight || 800, v = 0;
  if (DS.y < 130) v = -Math.min(40, Math.ceil((130 - DS.y) / 6));
  else if (DS.y > h - 170) v = Math.min(40, Math.ceil((DS.y - (h - 170)) / 6));
  DS.v = v;
  if (v && !DS.timer) {
    DS.timer = setInterval(function () {
      if (!DS || !DS.v) return;
      window.scrollBy(0, DS.v);
      dragAplica();
    }, 16);
  } else if (!v && DS.timer) { clearInterval(DS.timer); DS.timer = null; }
}
function dragMove(e) {
  var t = e.touches && e.touches[0];
  if (!DS || !t) return;
  DS.x = t.clientX; DS.y = t.clientY;
  if (e.cancelable) e.preventDefault();
  dragAplica();
  bordaScroll();
}
function fimDrag() {
  if (DS) { clearInterval(DS.timer); DS = null; agenda(); }
}
window.addEventListener('touchend', fimDrag, { passive: true });
window.addEventListener('touchcancel', fimDrag, { passive: true });

/* ---------- cabeçalho (muda conforme a tela) ---------- */
function logo() {
  var h = el('h1'); h.appendChild(document.createTextNode('Lu'));
  var b = el('b', 0, 'm'); h.appendChild(b); h.appendChild(document.createTextNode('i'));
  return h;
}
function anel() {
  var d = el('div', 'sp-ic');
  d.appendChild(el('i')); d.appendChild(el('i')); d.appendChild(el('i'));
  return d;
}
function atualizaSel() {
  if (!curList) return;
  var c = nsel(curList), sc = $('#sc'), bt = $('#sbt'), bd = $('#sbd');
  if (sc) sc.textContent = c ? c + (c === 1 ? ' selecionado' : ' selecionados') : 'Selecionar itens';
  if (bt) bt.textContent = (c && c === curList.length) ? 'Nenhum' : 'Todos';
  $('#sbdt').textContent = c ? 'Excluir ' + c : 'Excluir';
  var lix = !!(sub && sub.lixeira);
  var ib = $('#sbf .ic'); if (ib && ib._l !== lix) { ib._l = lix; ib.innerHTML = ico(lix ? 'atualiza' : 'heart'); }
  if (lix) {
    $('#sbdt').textContent = c ? 'Excluir ' + c : 'Excluir';
    $('#sbft').textContent = c ? 'Restaurar ' + c : 'Restaurar';
    $('#sbf').classList.remove('on');
  } else {
    var todosFav = c > 0 && curList.every(function (i) { return !i.s || ehFav(i); });
    $('#sbft').textContent = todosFav ? 'Desfavoritar' : 'Favoritar';
    $('#sbf').classList.toggle('on', todosFav);
  }
  bd.disabled = !c;
  $('#sbf').disabled = !c;
  $('#sbs').disabled = !c;
  pintaHeaders();
}
/* Android 14: o usuário liberou só algumas fotos. Avisa e leva a liberar tudo. */
function avisoParcial() {
  var d = el('div', 'aviso');
  d.appendChild(el('span', 0, 'Acesso limitado: apenas as fotos selecionadas estão disponíveis.'));
  var b = el('button', 'pill', 'Permitir todas');
  b.onclick = liberaTudo;
  d.appendChild(b);
  return d;
}
async function liberaTudo() {
  try {
    var r = await Galeria.pedirAcessoTotal();
    if (r && r.permissao === 'granted') { ler(true, true); return; }
  } catch (e) { /* segue para as configurações */ }
  setm('Em Permissões > Fotos e vídeos, selecione “Permitir tudo”.');
  try { Galeria.abrirConfig(); } catch (e) { /* ignora */ }
}
var TITULOS = { fotos: 'Fotos', albuns: 'Álbuns', favoritos: 'Favoritos', limpeza: 'Limpeza', ajustes: 'Ajustes' };
function tituloAba() { return el('h1', 0, TITULOS[aba] || 'Lumi'); }
function cabecalho(anima) {
  var hd = $('#hd'); hd.innerHTML = '';
  document.body.classList.toggle('sel', selMode);
  document.body.classList.toggle('insub', !!sub);
  document.body.classList.toggle('lix', !!(sub && sub.lixeira));
  var bar, h;
  if (selMode) {
    bar = el('div', 'bar'); h = el('h2');
    var bc = el('button', 'pill', 'Cancelar');
    bc.onclick = function () { (curList || []).forEach(function (i) { i.s = false; pinta(i); }); selMode = false; cabecalho(); };
    var sc = el('span', 'tt'); sc.id = 'sc'; h.appendChild(sc);
    var bt = el('button', 'pill', 'Todos'); bt.id = 'sbt'; bt.setAttribute('aria-label', 'Selecionar todos');
    bt.onclick = function () {
      var tudo = nsel(curList) === curList.length;
      curList.forEach(function (i) { i.s = !tudo; pinta(i); });
      atualizaSel();
    };
    bar.appendChild(bc); bar.appendChild(h); bar.appendChild(bt);
    hd.appendChild(bar);
    if (!sub) hd.appendChild(el('p', 'sub', '\u00a0'));
    atualizaSel();
    dicaSelecao();
  } else if (sub && sub.busca) {
    criaCampoBusca();
    bar = el('div', 'bar');
    var bkb = el('button', 'rb'); bkb.innerHTML = ico('voltar'); bkb.setAttribute('aria-label', 'Voltar'); bkb.onclick = fechaSub;
    var sbx = el('label', 'sbox' + (BQ.q ? ' tem' : '')); sbx.innerHTML = ico('lupa');
    sbx.appendChild(BQ.inp);
    var lm = el('button', 'lm'); lm.innerHTML = ico('x'); lm.setAttribute('aria-label', 'Limpar');
    lm.onclick = function (e) { e.preventDefault(); BQ.inp.value = ''; buscaMuda(); BQ.inp.focus(); };
    sbx.appendChild(lm);
    bar.appendChild(bkb); bar.appendChild(sbx); hd.appendChild(bar);
    var sq2 = el('p', 'sub'); sq2.id = 'bqc'; hd.appendChild(sq2);
    contBusca(curList ? curList.length : 0);
  } else if (sub) {
    bar = el('div', 'bar'); h = el('h2');
    var bk = el('button', 'rb'); bk.innerHTML = ico('voltar'); bk.setAttribute('aria-label', 'Voltar'); bk.onclick = fechaSub;
    h.appendChild(el('span', 'tt', sub.titulo)); h.appendChild(el('small', 0, num((curList || []).length) + ' itens'));
    var rot = sub.acao ? sub.acao.rotulo : 'Selecionar';
    var bs = el('button', 'pill', rot);
    bs.onclick = function () {
      if (sub.acao) { sub.acao.fn(); (curList || []).forEach(pinta); }
      selMode = true; cabecalho();
    };
    bar.appendChild(bk); bar.appendChild(h); bar.appendChild(bs);
    hd.appendChild(bar);
  } else {
    var top = el('div', 'top'); top.appendChild(tituloAba());
    var ac = el('div', 'acoes');
    if ((aba === 'fotos' || aba === 'albuns' || aba === 'favoritos') && items.length) {
      var sqb = el('button', 'rb'); sqb.innerHTML = ico('lupa'); sqb.setAttribute('aria-label', 'Buscar'); sqb.onclick = abrirBusca;
      ac.appendChild(sqb);
    }
    if ((aba === 'fotos' || aba === 'favoritos') && curList && curList.length) {
      var sl = el('button', 'pill', 'Selecionar');
      sl.onclick = function () { selMode = true; cabecalho(); };
      ac.appendChild(sl);
    }
    top.appendChild(ac); hd.appendChild(top);
    var s = el('p', 'sub'); hd.appendChild(s);
    if (permEst === 'parcial') hd.appendChild(avisoParcial());
    if (anima) conta(s, cab.total, cab.fn); else s.textContent = cab.fn(cab.total);
  }
}
$('#sbd').onclick = function () {
  if (!curList) return;
  var sel = curList.filter(function (i) { return i.s; });
  if (sub && sub.lixeira) excluiDeVez(sel); else apagar(sel);
};
$('#sbs').onclick = function () {
  if (curList) compartilhar(curList.filter(function (i) { return i.s; }));
};
$('#sbf').onclick = function () {
  if (!curList) return;
  var s = curList.filter(function (i) { return i.s; });
  if (!s.length) return;
  if (sub && sub.lixeira) { restauraSel(s); return; }
  var todos = s.every(ehFav);
  setFav(s, !todos);
  setm(todos ? plural(s.length, 'item removido', 'itens removidos') + ' dos favoritos'
             : plural(s.length, 'item adicionado', 'itens adicionados') + ' aos favoritos');
  s.forEach(function (i) { i.s = false; pinta(i); });
  selMode = false;
  if (aba === 'favoritos' && !sub && favMudou) { favMudou = false; refrescaAtual(); } else cabecalho();
};

/* ---------- abas ---------- */
function marcaAba() {
  ABAS.forEach(function (a) { $('#tb-' + a).classList.toggle('on', a === aba); });
  $('#tind').style.transform = 'translateX(' + (ABAS.indexOf(aba) * 100) + '%)';
}
function vazio(msg) {
  var app = $('#app'); app.innerHTML = '';
  app.appendChild(el('div', 'vazio', msg));
}
function mostraAba(a, rest, anima, antes0) {
  var antes = antes0 || aba;
  aba = a; sub = null; nivel = 0; selMode = false; curList = null; limpaVL();
  var b = document.body;
  ['insub', 'sel', 'compact', 'sem', 'lix'].forEach(function (c) { b.classList.remove(c); });
  compacto = false;
  marcaAba();
  var y = rest ? (ys[a] || 0) : 0;
  if (a === 'fotos') telaFotos(y); else if (a === 'albuns') telaAlbuns(); else if (a === 'favoritos') telaFavoritos(y); else if (a === 'limpeza') telaLimpeza(); else telaAjustes();
  window.scrollTo(0, y);
  if (VL) renderV();
  if (!atualizando) { var ap = $('#app'); ap.style.transition = ''; ap.style.transform = ''; ap.style.opacity = ''; }
  if (anima && antes !== a) entra(ABAS.indexOf(a) > ABAS.indexOf(antes) ? 'in-r' : 'in-l');
}
function trocaAba(a) {
  if (sub || nivel > 0) return;
  if (a === aba) { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); } return; }
  if (pendAba) return;
  ys[aba] = window.scrollY || 0;
  var antes = aba;
  /* marca a aba na hora (o toque responde) e monta a tela no quadro seguinte */
  pendAba = true; aba = a; marcaAba();
  requestAnimationFrame(function () {
    setTimeout(function () { pendAba = false; mostraAba(a, true, true, antes); }, 0);
  });
}
ABAS.forEach(function (a) { $('#tb-' + a).onclick = function () { trocaAba(a); }; });
window.addEventListener('scroll', function () {
  if (VL) { agenda(); fsScroll(); }
  if (sub || selMode || !$('#hd .top')) return;
  var y = window.scrollY || 0;
  if (!compacto && y > 60) { compacto = true; document.body.classList.add('compact'); }
  else if (compacto && y < 10) { compacto = false; document.body.classList.remove('compact'); }
}, { passive: true });
window.addEventListener('resize', function () {
  clearTimeout(rzT);
  rzT = setTimeout(function () { if (VL && !viewerAberto() && (window.innerWidth || 0) !== larg) refrescaAtual(); }, 160);
});

/* ---------- barra de rolagem rápida: arraste a alça para ir direto a um mês ---------- */
var FS = { on: false, drag: false, max: 0, top: 0, bot: 0, y: 0, dy: 0, t: null, mes: [], vlTop: 0 };
function fsRotulo(t) { var d = new Date((t || 0) * 1000); return MESES[d.getMonth()] + ' de ' + d.getFullYear(); }
function fsMede() {
  var h = window.innerHeight || 800, hd = $('#hd');
  FS.top = (hd ? hd.offsetHeight : 90) + 6;
  FS.bot = Math.max(FS.top + 40, h - 118 - 52);
  FS.max = Math.max(0, document.documentElement.scrollHeight - h);
  FS.vlTop = VL ? VL.el.getBoundingClientRect().top + (window.scrollY || 0) : 0;
}
function fsInit() {
  var b = document.body;
  FS.on = false; FS.drag = false; FS.mes = [];
  b.classList.remove('fsd');
  if (VL) {
    VL.ent.forEach(function (e) { if (e.k === 'h' && e.it && e.it.length) FS.mes.push({ y: e.y, l: fsRotulo(e.it[0].t) }); });
    fsMede();
    FS.on = FS.mes.length > 0 && FS.max > (window.innerHeight || 800) * 2;
  }
  if (!FS.on) { clearTimeout(FS.t); b.classList.remove('fsv'); return; }
  fsPos();
}
function fsLabel(y) {
  var m = FS.mes, yy = y - FS.vlTop + 60, lo = 0, hi = m.length - 1, r = 0;
  while (lo <= hi) { var k = (lo + hi) >> 1; if (m[k].y <= yy) { r = k; lo = k + 1; } else hi = k - 1; }
  return m[r] ? m[r].l : '';
}
function fsPos() {
  var f = FS.max > 0 ? Math.min(1, (window.scrollY || 0) / FS.max) : 0;
  FS.y = FS.top + f * (FS.bot - FS.top);
  $('#fsh').style.transform = 'translate3d(0,' + FS.y + 'px,0)';
}
function fsScroll() {
  if (!FS.on) return;
  if (!FS.drag) fsPos();
  document.body.classList.add('fsv');
  clearTimeout(FS.t);
  FS.t = setTimeout(function () { if (!FS.drag) document.body.classList.remove('fsv'); }, 1400);
}
(function () {
  var fh = $('#fsh');
  fh.addEventListener('touchstart', function (e) {
    if (!FS.on || e.touches.length !== 1) return;
    e.stopPropagation(); if (e.cancelable) e.preventDefault();
    fsMede(); fsPos();
    FS.drag = true; FS.dy = e.touches[0].clientY - FS.y;
    clearTimeout(FS.t);
    document.body.classList.add('fsd'); document.body.classList.add('fsv');
    $('#fsb').textContent = fsLabel(window.scrollY || 0);
  }, { passive: false });
  fh.addEventListener('touchmove', function (e) {
    if (!FS.drag) return;
    e.stopPropagation(); if (e.cancelable) e.preventDefault();
    var y = Math.max(FS.top, Math.min(FS.bot, e.touches[0].clientY - FS.dy));
    var alvo = (y - FS.top) / Math.max(1, FS.bot - FS.top) * FS.max;
    FS.y = y;
    fh.style.transform = 'translate3d(0,' + y + 'px,0)';
    $('#fsb').textContent = fsLabel(alvo);
    window.scrollTo(0, alvo);
  }, { passive: false });
  function fim(e) {
    if (!FS.drag) return;
    e.stopPropagation();
    FS.drag = false; puxouT = Date.now();
    document.body.classList.remove('fsd');
    clearTimeout(FS.t);
    FS.t = setTimeout(function () { document.body.classList.remove('fsv'); }, 1200);
  }
  fh.addEventListener('touchend', fim, { passive: true });
  fh.addEventListener('touchcancel', fim, { passive: true });
})();

function telaFotos(y) {
  var l = items.slice();
  cab = { total: l.length, fn: function (v) { return num(v) + ' itens'; } };
  if (!l.length) { curList = null; cabecalho(true); vazio('Nenhuma foto ou vídeo encontrado.'); return; }
  if (!secFotos || secFotos.src !== items || secFotos.n !== items.length) secFotos = { src: items, n: items.length, secs: porDia(l) };
  montaLista({ lista: l, secoes: secFotos.secs }, true, y);
  cabecalho(true);
}
var secFotos = null;
function vazioFav() {
  var app = $('#app'); app.innerHTML = '';
  var d = el('div', 'vazio');
  var ic = el('div', 'vz-ic'); ic.innerHTML = ico('heart');
  d.appendChild(ic);
  d.appendChild(el('b', 'vz-t', 'Nenhum favorito'));
  d.appendChild(el('p', 'vz-s', 'Os itens marcados como favoritos aparecem aqui.'));
  app.appendChild(d);
}
function telaFavoritos(y) {
  favMudou = false;
  var l = items.filter(function (i) { return ehFav(i); });
  cab = { total: l.length, fn: function (v) { return v === 1 ? '1 favorito' : num(v) + ' favoritos'; } };
  if (!l.length) { curList = null; cabecalho(true); vazioFav(); return; }
  montaLista({ lista: l, secoes: porDia(l) }, true, y);
  cabecalho(true);
}
var albC = null;
function dadosAlbuns() {
  if (albC && albC.src === items && albC.n === items.length) return albC;
  var g = groups(), ns = Object.keys(g).sort(function (a, b) {
    if (a === 'Prints · Conversas') return -1;
    if (b === 'Prints · Conversas') return 1;
    return g[b].length - g[a].length;
  });
  var total = 0, fo = {};
  ns.forEach(function (n) {
    total += g[n].length;
    var f = g[n].filter(function (i) { return !i.v; });
    fo[n] = f.length ? f : g[n];
  });
  albC = { src: items, n: items.length, g: g, ns: ns, total: total, fo: fo };
  return albC;
}
function telaAlbuns() {
  var D = dadosAlbuns(), g = D.g, ns = D.ns, total = D.total;
  cab = { total: total, fn: function (v) { return total ? num(v) + ' itens em ' + ns.length + ' álbuns' : 'Nenhuma foto ou vídeo encontrado'; } };
  cabecalho(true);
  var app = $('#app'); app.innerHTML = '';
  var secs = [
    { t: 'Prints', f: function (n) { return n.indexOf('Prints') === 0; } },
    { t: 'Vídeos', f: function (n) { return n.indexOf('Vídeos · ') === 0; } },
    { t: 'Pastas do celular', f: function () { return true; } }];
  var used = {}, ci = 0;
  secs.forEach(function (s) {
    var list = ns.filter(function (n) { return !used[n] && s.f(n); });
    if (!list.length) return;
    list.forEach(function (n) { used[n] = 1; });
    app.appendChild(el('div', 'sh', s.t));
    var grid = el('div', 'albums');
    list.forEach(function (n) {
      var isV = n.indexOf('Vídeos · ') === 0;
      var c = el('button', 'card'), box = el('div', 'cv'), t = el('div', 't');
      c.style.animationDelay = Math.min(ci, 8) * 22 + 'ms'; ci++;
      var lst = D.fo[n];
      box._go = function () { capa(lst, box, 0, 0); };
      observa(box); /* só carrega a capa de quem está perto da tela */
      t.appendChild(el('b', 0, n.replace('Vídeos · ', '')));
      t.appendChild(el('span', 0, num(g[n].length) + (isV ? ' vídeos' : ' itens')));
      c.appendChild(box); c.appendChild(t);
      c.onclick = function () { abrirSub(defAlbum(n)); };
      grid.appendChild(c);
    });
    app.appendChild(grid);
  });
  if (!ns.length) vazio('Nenhuma foto ou vídeo encontrado.');
}

/* ---------- ajustes ---------- */
function opSeg(opcoes, atual, fn) {
  var s = el('div', 'seg');
  opcoes.forEach(function (o) {
    var b = el('button', o[0] === atual ? 'on' : '', o[1]);
    b.onclick = function () {
      if (o[0] === atual) return;
      atual = o[0];
      Array.prototype.forEach.call(s.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      fn(o[0]);
    };
    s.appendChild(b);
  });
  return s;
}
function linhaBase(tag, ic, tit, desc, cls) {
  var r = el(tag, 'rw' + (cls ? ' ' + cls : ''));
  var i = el('span', 'rwi'); i.innerHTML = ico(ic);
  var t = el('span', 'rwt'), d = el('small', 0, desc);
  t.appendChild(el('b', 0, tit)); t.appendChild(d);
  r.appendChild(i); r.appendChild(t); r.desc = d;
  return r;
}
function linhaSeg(ic, tit, desc, opcoes, atual, fn) {
  var r = linhaBase('div', ic, tit, desc, 'st');
  r.appendChild(opSeg(opcoes, atual, fn));
  return r;
}
function linhaSw(ic, tit, desc, ligado, fn) {
  var r = linhaBase('button', ic, tit, desc), sw = el('span', 'sw' + (ligado ? ' on' : ''));
  r.setAttribute('role', 'switch'); r.setAttribute('aria-checked', ligado ? 'true' : 'false');
  r.appendChild(sw);
  r.onclick = function () {
    ligado = !ligado;
    sw.classList.toggle('on', ligado); r.setAttribute('aria-checked', ligado ? 'true' : 'false');
    fn(ligado);
  };
  return r;
}
function linhaBt(ic, tit, desc, fn, cls) {
  var r = linhaBase('button', ic, tit, desc, cls);
  r.onclick = fn;
  return r;
}
function grupo(titulo, linhas) {
  var f = document.createDocumentFragment(), g = el('div', 'gp');
  f.appendChild(el('div', 'sh', titulo));
  linhas.forEach(function (l) { g.appendChild(l); });
  f.appendChild(g);
  return f;
}
function nFavs() { return Object.keys(favs).length; }
/* ---------- backup dos favoritos (arquivo .json na pasta Downloads) ---------- */
function dataArq() {
  var d = new Date();
  function z(n) { return (n < 10 ? '0' : '') + n; }
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
}
function montaExport() {
  var mapa = {};
  items.forEach(function (i) { mapa[i.u] = i; });
  var lista = Object.keys(favs).map(function (u) {
    var i = mapa[u], o = { u: u, a: +favs[u] || 0 };
    if (i) { o.n = i.nome; o.t = i.tam; o.d = i.t; o.v = i.v ? 1 : 0; }
    return o;
  });
  return JSON.stringify({ lumi: 1, tipo: 'favoritos', em: new Date().toISOString(), total: lista.length, favoritos: lista });
}
async function exportaFavs() {
  if (!nFavs()) { setm('Não há favoritos para exportar.'); return; }
  var nome = 'Lumi-favoritos-' + dataArq() + '.json', texto = montaExport();
  if (Galeria && Galeria.salvarArquivo) {
    try {
      var r = await Galeria.salvarArquivo({ nome: nome, texto: texto });
      setm('Arquivo salvo em Downloads: ' + ((r && r.nome) || nome));
      return;
    } catch (e) { /* tenta copiar o texto */ }
  }
  try {
    await navigator.clipboard.writeText(texto);
    setm('Não foi possível salvar o arquivo. A lista foi copiada para a área de transferência.');
  } catch (e) { setm('Não foi possível exportar os favoritos.'); }
}
function aplicaImport(txt) {
  var o;
  try { o = JSON.parse(txt); } catch (e) { setm('Arquivo inválido. Selecione um backup de favoritos do Lumi.'); return 0; }
  var lista = Array.isArray(o) ? o : (o && Array.isArray(o.favoritos) ? o.favoritos : null);
  if (!lista || !lista.length) { setm('O arquivo não contém favoritos.'); return 0; }
  if (!items.length) { setm('Aguarde o carregamento da galeria e tente novamente.'); return 0; }
  var porU = {}, porNT = {};
  items.forEach(function (i) { porU[i.u] = i; porNT[i.nome + '|' + (i.tam || 0)] = i; });
  var novos = 0, jaEram = 0, faltam = 0;
  lista.forEach(function (e) {
    if (!e || typeof e.u !== 'string') return;
    var i = porU[e.u];
    if (i && e.n && i.nome !== e.n) i = null; /* o número do arquivo mudou de dono: procura pelo nome */
    if (!i && e.n) i = porNT[e.n + '|' + (e.t || 0)] || null;
    if (!i) { faltam++; return; }
    if (favs[i.u]) { jaEram++; return; }
    favs[i.u] = +e.a || Date.now(); novos++;
    if (i.el) i.el.classList.add('fav');
  });
  salvaFavs(); favMudou = true;
  var m = novos ? plural(novos, 'favorito importado', 'favoritos importados') : 'Nenhum favorito novo';
  if (jaEram) m += ' · ' + plural(jaEram, 'já estava', 'já estavam');
  if (faltam) m += ' · ' + plural(faltam, 'não está', 'não estão') + ' neste aparelho';
  setm(m + '.');
  return novos;
}
var INP = null;
function importaFavs(depois) {
  if (!INP) {
    INP = document.createElement('input');
    INP.type = 'file'; INP.accept = 'application/json,.json,text/plain'; INP.style.display = 'none';
    document.body.appendChild(INP);
    INP.onchange = function () {
      var f = INP.files && INP.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { aplicaImport(String(fr.result || '')); if (INP._depois) INP._depois(); };
      fr.onerror = function () { setm('Não foi possível ler o arquivo.'); };
      fr.readAsText(f);
    };
  }
  INP._depois = depois; INP.value = '';
  INP.click();
}
function textoAcesso() { return permEst === 'parcial' ? 'Parcial: toque para liberar todas as fotos' : 'Total: o Lumi vê todas as fotos e vídeos'; }
function telaAjustes() {
  cab = { total: 0, fn: function () { return 'Preferências'; } };
  cabecalho(true);
  var app = $('#app'); app.innerHTML = '';
  var box = el('div', 'cfgs');
  var rg = linhaSeg('espaco', 'Espaçamento da grade', 'Distância entre as miniaturas', [[2, 'Compacto'], [3, 'Padrão'], [6, 'Amplo']], CFG.gap, function (v) {
    CFG.gap = v; salvaCfg();
  });
  box.appendChild(grupo('Grade de fotos', [rg]));

  var rv = linhaSeg('filme', 'Vídeos grandes', 'Tamanho mínimo para aparecer em Limpeza', [[30, '30 MB'], [50, '50 MB'], [100, '100 MB'], [200, '200 MB']], CFG.grande, function (v) {
    CFG.grande = v; salvaCfg(); aplicaCfg();
  });
  var rp = linhaSw('lixeira', 'Confirmar antes de excluir', 'O Android solicita uma confirmação adicional', CFG.pergunta, function (v) { CFG.pergunta = v; salvaCfg(); });
  box.appendChild(grupo('Limpeza', [rv, rp]));

  var rf = linhaBt('heart', 'Limpar favoritos', nFavs() ? plural(nFavs(), 'item favoritado', 'itens favoritados') : 'Nenhum favorito', async function () {
    if (!nFavs()) return;
    var sim = await confirma('Limpar favoritos?', 'Os itens permanecem na galeria. Apenas a marcação de favorito será removida.', 'Limpar');
    if (!sim) return;
    favs = {}; salvaFavs();
    rf.desc.textContent = 'Nenhum favorito';
    setm('Favoritos removidos. É possível restaurá-los importando um backup.');
  }, 'dg');
  function textoFavs() { return nFavs() ? plural(nFavs(), 'item favoritado', 'itens favoritados') : 'Nenhum favorito'; }
  var rex = linhaBt('exporta', 'Exportar favoritos', 'Salva um backup na pasta Downloads', exportaFavs);
  var rim = linhaBt('importa', 'Importar favoritos', 'Restaura a partir de um backup', function () {
    importaFavs(function () { rf.desc.textContent = textoFavs(); });
  });
  box.appendChild(grupo('Favoritos', [rex, rim, rf]));

  var rup = linhaBt('atualiza', 'Verificar atualizações', 'Verifica se há uma versão mais recente', function () {
    rup.desc.textContent = 'Verificando…';
    procuraAtualizacao(true).then(function () { rup.desc.textContent = 'Verifica se há uma versão mais recente'; });
  });
  box.appendChild(grupo('Atualização', [rup]));

  var ri = linhaBt('insta', 'Instagram', '@' + CRIADOR.insta, function () { contato('instagram', CRIADOR.insta); });
  var rm = linhaBt('email', 'E-mail', CRIADOR.email, function () { contato('email', CRIADOR.email); });
  var gc = grupo('Contato', [ri, rm]);
  box.appendChild(gc);
  var rod = el('p', 'rodape');
  rod.appendChild(el('b', 0, 'Lumi · desenvolvido por ' + CRIADOR.marca));
  rod.appendChild(el('span', 0, 'Suas fotos e vídeos permanecem no seu aparelho. O Lumi usa a internet somente para verificar atualizações e não coleta nem envia dados pessoais.'));
  var vr = ($('#dx').getAttribute('data-versao') || '').trim();
  rod.appendChild(el('span', 'rver', 'Versão ' + (vr && vr.indexOf('__') < 0 ? vr : 'de teste')));
  box.appendChild(rod);
  app.appendChild(box);
  diag();
}

/* ---------- limpeza: prints, vídeos grandes e duplicadas ---------- */
function cartao(ic, tit, desc, fn, vazio, ci) {
  var b = el('button', 'lc'), t = el('span', 'lct'), d = el('small', 0, desc);
  b.style.animationDelay = Math.min(ci, 8) * 30 + 'ms';
  if (vazio) b.classList.add('vz');
  t.appendChild(el('b', 0, tit)); t.appendChild(d);
  if (ci) b.classList.add('k' + (ci + 1));
  var bi = el('span', 'lci'); bi.innerHTML = ico(ic);
  var bx = el('span', 'lcx'); bx.innerHTML = ico('mais');
  b.appendChild(bi); b.appendChild(t); b.appendChild(bx);
  b.onclick = vazio ? null : fn;
  b.desc = d;
  return b;
}
function textoDup() {
  var sets = setsAtuais(), extra = 0;
  sets.forEach(function (s) { extra += s[0].tam * (s.length - 1); });
  if (escaneando) return 'Analisando arquivos… ' + dupProg;
  if (dupFeito) return sets.length ? num(sets.length) + (sets.length === 1 ? ' grupo' : ' grupos') + ' · ' + fmtTam(extra) + ' recuperáveis' : 'Nenhuma duplicada encontrada';
  return 'Buscar fotos e vídeos repetidos';
}
function atualizaDup() { if (dupDesc) dupDesc.textContent = textoDup(); }
function telaLimpeza() {
  var pr = listaPrints(), vg = listaVideosG();
  var livre = somaTam(pr) + somaTam(vg);
  cab = { total: 0, fn: function () { return livre ? 'Até ' + fmtTam(livre) + ' para liberar' : 'Liberar espaço'; } };
  cabecalho(true);
  var app = $('#app'); app.innerHTML = '';
  var box = el('div', 'lista');
  box.appendChild(cartao('tela', 'Prints', pr.length ? num(pr.length) + ' prints · ' + fmtTam(somaTam(pr)) : 'Nenhum print encontrado', function () { abrirSub(defPrints()); }, !pr.length, 0));
  box.appendChild(cartao('filme', 'Vídeos grandes', vg.length ? num(vg.length) + (vg.length === 1 ? ' vídeo' : ' vídeos') + ' acima de ' + CFG.grande + ' MB · ' + fmtTam(somaTam(vg)) : 'Nenhum vídeo acima de ' + CFG.grande + ' MB', function () { abrirSub(defVideos()); }, !vg.length, 1));
  var cd = cartao('copia', 'Duplicadas', textoDup(), cliqueDup, false, 2);
  dupDesc = cd.desc;
  if (escaneando) cd.classList.add('bz');
  box.appendChild(cd);
  var cl = cartao('lixeira', 'Lixeira', (SDK && SDK < 30) ? 'Disponível a partir do Android 11' : 'Verificando…', function () { abrirSub(defLixeira()); }, !!(SDK && SDK < 30), 3);
  box.appendChild(cl);
  if (!(SDK && SDK < 30)) carregaLixeira().then(function () { cl.desc.textContent = textoLixeira(); cl.classList.toggle('vz', !(LIX.itens && LIX.itens.length)); if (LIX.itens && LIX.itens.length) cl.onclick = function () { abrirSub(defLixeira()); }; else cl.onclick = null; }, function () { cl.desc.textContent = 'Não foi possível ler a lixeira'; });
  app.appendChild(box);
  app.appendChild(el('p', 'dica', 'Nenhum item é excluído sem a sua confirmação. O Android solicita uma confirmação final.'));
}
/* ---------- lixeira do Android (11+) ---------- */
async function carregaLixeira() {
  if (!Galeria || !Galeria.listarLixeira) { LIX.itens = []; return LIX.itens; }
  var r = await Galeria.listarLixeira();
  LIX.suportado = r.suportado !== false;
  LIX.itens = (r.itens || []).map(function (x) {
    return { p: '', u: x.uri, w: x.w || 0, h: x.h || 0, v: !!x.v, dur: x.dur || 0, t: x.data || 0, nome: x.nome, pasta: '', tam: x.tam || 0, mod: x.mod || 0, exp: x.exp || 0, a: 'Lixeira', lix: true };
  });
  return LIX.itens;
}
function diasLix(i) { return i.exp ? Math.max(0, Math.ceil((i.exp - Date.now() / 1000) / 86400)) : -1; }
function textoLixeira() {
  var l = LIX.itens || [];
  if (!l.length) return 'Lixeira vazia';
  return num(l.length) + (l.length === 1 ? ' item' : ' itens') + ' · ' + fmtTam(somaTam(l));
}
function secoesLix(l) {
  var m = {}, ks = [];
  l.forEach(function (i) { var k = diasLix(i); if (!m[k]) { m[k] = []; ks.push(k); } m[k].push(i); });
  ks.sort(function (a, b) { return a - b; });
  return ks.map(function (k) {
    var t = k < 0 ? 'Na lixeira' : (k === 0 ? 'Expira hoje' : (k === 1 ? 'Expira em 1 dia' : 'Expira em ' + k + ' dias'));
    return { titulo: t, itens: m[k] };
  });
}
function defLixeira() {
  return { id: 'lixeira', titulo: 'Lixeira', tam: true, lixeira: true, dados: function () {
    var l = LIX.itens || [];
    return { lista: l, secoes: secoesLix(l) };
  } };
}
async function restauraSel(sel) {
  if (!sel.length || !Galeria || !Galeria.restaurar) return;
  setm('Aguardando confirmação do Android…');
  try {
    var r = await Galeria.restaurar({ uris: sel.map(function (i) { return i.u; }) });
    if (r.cancelado) { setm('Restauração cancelada.'); return; }
    var rm = {}; sel.forEach(function (i) { rm[i.u] = 1; });
    LIX.itens = (LIX.itens || []).filter(function (i) { return !rm[i.u]; });
    setm(plural(r.ok, 'item restaurado', 'itens restaurados') + '.');
    selMode = false; ultLeitura = 0;
    await ler(true, true);
    if (sub && sub.lixeira) refrescaAtual();
  } catch (e) { setm('Não foi possível restaurar: ' + (e.message || e)); }
}
async function excluiDeVez(sel) {
  if (!sel.length || !Galeria) return;
  var sim = await confirma('Excluir ' + sel.length + (sel.length === 1 ? ' item' : ' itens') + ' permanentemente?', 'Esta ação não pode ser desfeita. O Android solicita uma confirmação final.', 'Excluir definitivamente');
  if (!sim) return;
  setm('Aguardando confirmação do Android…');
  try {
    var r = await Galeria.apagar({ uris: sel.map(function (i) { return i.u; }), permanente: true });
    if (r.cancelado) { setm('Exclusão cancelada.'); return; }
    var rm = {}; sel.forEach(function (i) { rm[i.u] = 1; });
    LIX.itens = (LIX.itens || []).filter(function (i) { return !rm[i.u]; });
    setm(plural(r.ok, 'item excluído', 'itens excluídos') + '.');
    selMode = false;
    refrescaAtual();
  } catch (e) { setm('Não foi possível excluir: ' + (e.message || e)); }
}
async function procuraDup() {
  escaneando = true; dupProg = '0%'; atualizaDup();
  var map = {};
  items.forEach(function (i) {
    if (!i.tam) return;
    var k = i.tam + '|' + i.w + '|' + i.h + '|' + (i.v ? 1 : 0);
    (map[k] = map[k] || []).push(i);
  });
  var cands = [];
  Object.keys(map).forEach(function (k) { if (map[k].length > 1) cands = cands.concat(map[k]); });
  try {
    var feitos = 0;
    async function lote40(ini) {
      var lote = cands.slice(ini, ini + 40).filter(function (i) { return hc[i.u + '|' + i.mod] == null; });
      if (lote.length) {
        var r = await Galeria.assinaturas({ uris: lote.map(function (i) { return i.u; }) });
        lote.forEach(function (i) { hc[i.u + '|' + i.mod] = (r && r.h && r.h[i.u]) || ''; });
      }
      feitos += Math.min(40, cands.length - ini);
      dupProg = Math.round(Math.min(cands.length, feitos) * 100 / cands.length) + '%';
      atualizaDup();
    }
    for (var a = 0; a < cands.length; a += 120) {
      var par = [];
      for (var b = a; b < Math.min(cands.length, a + 120); b += 40) par.push(lote40(b));
      await Promise.all(par);
    }
  } catch (e) {
    setm('Não foi possível comparar os arquivos: ' + (e.message || e));
    escaneando = false; atualizaDup();
    return false;
  }
  var g = {};
  cands.forEach(function (i) {
    var h = hc[i.u + '|' + i.mod];
    if (!h) return;
    var k = i.tam + '|' + h;
    (g[k] = g[k] || []).push(i);
  });
  dupSets = Object.keys(g).map(function (k) { return g[k]; }).filter(function (s) { return s.length > 1; });
  dupSets.forEach(function (s) { s.sort(function (a, b) { return a.t - b.t; }); });
  dupSets.sort(function (a, b) { return b[0].tam * (b.length - 1) - a[0].tam * (a.length - 1); });
  dupFeito = true; escaneando = false; atualizaDup();
  return true;
}
async function cliqueDup() {
  if (escaneando) return;
  if (!Galeria) { setm('Recurso indisponível neste aparelho.'); return; }
  if (!dupFeito) {
    var d = $('#app').children[0];
    if (d && d.children && d.children[2]) d.children[2].classList.add('bz');
    var ok = await procuraDup();
    if (d && d.children && d.children[2]) d.children[2].classList.remove('bz');
    if (!ok || aba !== 'limpeza' || sub || nivel > 0) return;
  }
  if (setsAtuais().length) abrirSub(defDup());
}

/* ---------- telas internas (álbum, prints, vídeos grandes, duplicadas) ---------- */
function defAlbum(n) {
  return { id: 'a:' + n, titulo: n, dados: function () { var l = groups()[n] || []; return { lista: l, secoes: porDia(l) }; } };
}
function defPrints() {
  return { id: 'prints', titulo: 'Prints', tam: true, dados: function () { var l = listaPrints(); return { lista: l, secoes: porDia(l) }; } };
}
function defVideos() {
  return { id: 'videos', titulo: 'Vídeos grandes', tam: true, dados: function () {
    var l = listaVideosG();
    return { lista: l, secoes: [{ titulo: 'Maiores primeiro', itens: l }] };
  } };
}
function dadosDup() {
  var secs = setsAtuais().map(function (s, k) {
    return { titulo: 'Conjunto ' + (k + 1) + ' · ' + s.length + ' cópias · ' + fmtTam(s[0].tam) + ' cada', itens: s };
  });
  var l = [];
  secs.forEach(function (s) { l = l.concat(s.itens); });
  return { lista: l, secoes: secs };
}
function defDup() {
  return { id: 'dup', titulo: 'Duplicadas', tam: true, dados: dadosDup,
    acao: { rotulo: 'Marcar cópias', fn: function () {
      dadosDup().secoes.forEach(function (s) { s.itens.forEach(function (i, k) { i.s = k > 0; }); });
    } } };
}
function abrirSub(def) {
  ys[aba] = window.scrollY || 0;
  empurra(1);
  entraSub(def, true, false, 0);
}
/* ---------- busca ---------- */
function semAcento(s) {
  var t = String(s == null ? '' : s);
  try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* sem normalize */ }
  return t.toLowerCase();
}
function palheiro(i) {
  if (i._h) return i._h;
  var tx = 'sem data';
  if (i.t) {
    var d = new Date(i.t * 1000), z = function (n) { return (n < 10 ? '0' : '') + n; };
    tx = d.getDate() + ' de ' + MESES[d.getMonth()] + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear() + ' ' + z(d.getDate()) + '/' + z(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  var tipo = i.v ? 'video videos filme' : 'foto fotos imagem';
  if (!i.v && /^Prints/.test(i.a || '')) tipo += ' print prints captura de tela screenshot';
  i._h = semAcento([i.nome, i.a, i.pasta, tx, tipo].join(' '));
  return i._h;
}
function resultadosBusca(q) {
  var toks = semAcento(q).split(/\s+/).filter(Boolean);
  if (!toks.length) return [];
  return items.filter(function (i) {
    var h = palheiro(i);
    return toks.every(function (t) {
      if (t === 'favorito' || t === 'favoritos' || t === 'favorita' || t === 'favoritas') return ehFav(i);
      return h.indexOf(t) >= 0;
    });
  });
}
function defBusca() {
  return { id: 'busca', titulo: 'Buscar', busca: true, dados: function () {
    var l = resultadosBusca(BQ.q);
    return { lista: l, secoes: porDia(l) };
  } };
}
function contBusca(n) {
  var c = $('#bqc'); if (!c) return;
  c.textContent = !BQ.q.trim() ? 'Busque por nome, pasta, mês ou ano' : (n === 1 ? '1 resultado' : num(n) + ' resultados');
}
function buscaVazia() {
  var app = $('#app'); app.innerHTML = '';
  var d = el('div', 'vazio'), ic = el('div', 'vz-ic'); ic.innerHTML = ico('lupa');
  d.appendChild(ic);
  d.appendChild(el('b', 'vz-t', 'Buscar na galeria'));
  d.appendChild(el('p', 'vz-s', 'Pesquise por nome de arquivo, pasta, mês ou ano. Também é possível buscar por “vídeos”, “prints” ou “favoritos”.'));
  var ch = el('div', 'chips'), agora = new Date();
  ['vídeos', 'prints', 'favoritos', MESES[agora.getMonth()] + ' ' + agora.getFullYear()].forEach(function (t) {
    var b = el('button', 0, t); b.onclick = function () { BQ.inp.value = t; buscaMuda(); };
    ch.appendChild(b);
  });
  d.appendChild(ch); app.appendChild(d);
}
function buscaAtualiza() {
  if (!sub || !sub.busca) return;
  var d = sub.dados(), q = BQ.q.trim();
  d.lista.forEach(function (i) { i.s = false; });
  limpaVL(); selMode = false;
  if (!q) { curList = []; buscaVazia(); contBusca(0); return; }
  if (!d.lista.length) { curList = []; vazio('Nenhum resultado para “' + q + '”.'); contBusca(0); return; }
  montaLista(d, false, 0);
  contBusca(d.lista.length);
}
function buscaMuda() {
  BQ.q = BQ.inp.value;
  BQ.inp.parentNode.classList.toggle('tem', !!BQ.q);
  clearTimeout(BQ.t); BQ.t = setTimeout(buscaAtualiza, 120);
}
function criaCampoBusca() {
  if (BQ.inp) return;
  var i = document.createElement('input');
  i.type = 'search'; i.id = 'bq'; i.placeholder = 'Buscar fotos, vídeos e pastas';
  i.setAttribute('autocomplete', 'off'); i.setAttribute('autocapitalize', 'off'); i.setAttribute('spellcheck', 'false'); i.setAttribute('enterkeyhint', 'search');
  i.setAttribute('aria-label', 'Buscar');
  i.oninput = buscaMuda;
  i.onkeydown = function (e) { if (e.key === 'Enter') i.blur(); };
  BQ.inp = i;
}
function abrirBusca() {
  criaCampoBusca();
  BQ.q = ''; BQ.inp.value = '';
  abrirSub(defBusca());
  setTimeout(function () { if (sub && sub.busca) BQ.inp.focus(); }, 260);
}
function entraSub(def, anima, keepSel, y) {
  sub = def; selMode = false; limpaVL();
  document.body.classList.remove('compact'); compacto = false;
  var d = def.dados();
  d.tam = def.tam;
  if (!keepSel) d.lista.forEach(function (i) { i.s = false; });
  if (def.busca) { curList = []; cabecalho(); buscaAtualiza(); return; }
  if (!d.lista.length) { curList = []; cabecalho(); vazio(def.lixeira ? 'A lixeira está vazia.' : 'Nenhum item.'); return; }
  montaLista(d, anima, y);
  cabecalho();
  if (anima) entra('in-r');
}
function refrescaAtual() {
  var y = window.scrollY || 0;
  if (sub && sub.busca) { selMode = false; cabecalho(); buscaAtualiza(); return; }
  if (sub) {
    var d = sub.dados();
    if (!d.lista.length) { fechaSub(); return; }
    entraSub(sub, false, true, y);
  } else {
    ys[aba] = y;
    mostraAba(aba, true);
  }
}

/* ---------- boas-vindas e leitura ---------- */
function boasVindas(msg) {
  sub = null; selMode = false; curList = null; limpaVL();
  document.body.classList.remove('insub'); document.body.classList.remove('sel'); document.body.classList.add('sem');
  var hd = $('#hd'); hd.innerHTML = '';
  var app = $('#app'); app.innerHTML = '';
  var box = el('div', 'boas');
  box.appendChild(anel());
  box.appendChild(logo());
  box.appendChild(el('p', 0, msg || 'O Lumi precisa de permissão para acessar suas fotos e vídeos. Os arquivos são lidos apenas neste aparelho.'));
  var b = el('button', 'pri', 'Permitir acesso');
  b.onclick = function () { ler(); };
  box.appendChild(b);
  app.appendChild(box);
  fimSplash();
}

/* ---------- confirmação (folha que sobe de baixo) ---------- */
function confirma(titulo, subt, ok) {
  return new Promise(function (res) {
    var s = $('#cf');
    $('#cft').textContent = titulo; $('#cfs').textContent = subt; $('#cfo').textContent = ok;
    function fim(v) {
      s.classList.remove('on');
      $('#cfo').onclick = null; $('#cfc').onclick = null; s.onclick = null;
      res(v);
    }
    $('#cfo').onclick = function () { fim(true); };
    $('#cfc').onclick = function () { fim(false); };
    s.onclick = function (e) { if (e.target === s) fim(false); };
    s.classList.add('on');
  });
}

/* ---------- visualizador: zoom, arrastar, deslizar ---------- */
var GAP = 28, swT = null;
function larguraV() { return window.innerWidth || 360; }
function thumbSrc(o) { var t = o && o['t' + GRID]; return t ? fonte(t) : ''; }
function ladoSrc(o) {
  if (!o) return '';
  if (o.v) return thumbSrc(o);
  return (o._gp ? fonte(o._gp) : '') || (gigante(o) ? thumbSrc(o) : cand(o)[0]) || thumbSrc(o);
}
function setaLado(id, o) {
  var e = $(id), u = ladoSrc(o);
  if (!u) { e.style.display = 'none'; e.removeAttribute('src'); return; }
  if (e.getAttribute('src') !== u) e.src = u;
  e.style.display = 'block';
}
['#vpa', '#vpb'].forEach(function (q) {
  $(q).onerror = function () { this.style.display = 'none'; };
});
function lados() {
  setaLado('#vpa', vlist[vi - 1]); setaLado('#vpb', vlist[vi + 1]);
  moveLados(0, false);
}
function moveLados(x, anim) {
  var W = larguraV() + GAP, t = anim ? 'transform .26s cubic-bezier(.2,.8,.2,1)' : 'none';
  var a = $('#vpa'), b = $('#vpb');
  a.style.transition = t; b.style.transition = t;
  a.style.transform = 'translate3d(' + (x - W) + 'px,0,0)';
  b.style.transform = 'translate3d(' + (x + W) + 'px,0,0)';
}
function soltaCapa() { var c = $('#vcv'); c.style.display = 'none'; c.removeAttribute('src'); }
function alvo() { return (vlist[vi] && vlist[vi].v) ? $('#vv') : $('#vim'); }
function aplica(anim) {
  var e = alvo();
  e.style.transition = anim ? 'transform .26s cubic-bezier(.2,.8,.2,1)' : 'none';
  e.style.transform = 'translate3d(' + Z.x + 'px,' + Z.y + 'px,0) scale(' + Z.s + ')';
  if (Z.s <= 1.001 && Math.abs(Z.y) < 1) moveLados(Z.x, anim); else moveLados(0, false);
}
function zera() {
  Z.s = 1; Z.x = 0; Z.y = 0;
  ['#vim', '#vv'].forEach(function (q) { var e = $(q); e.style.transition = 'none'; e.style.transform = ''; e.style.opacity = '1'; });
  $('#vbg').style.opacity = '';
  $('#vp').style.opacity = '';
  moveLados(0, false);
}
function limita() {
  if (Z.s <= 1.001) { Z.s = 1; Z.x = 0; Z.y = 0; return; }
  var im = $('#vim'), w = im.offsetWidth * Z.s, h = im.offsetHeight * Z.s;
  var mx = Math.max(0, (w - window.innerWidth) / 2), my = Math.max(0, (h - window.innerHeight) / 2);
  Z.x = Math.max(-mx, Math.min(mx, Z.x));
  Z.y = Math.max(-my, Math.min(my, Z.y));
}
function dist(t) { return Math.sqrt(Math.pow(t[0].clientX - t[1].clientX, 2) + Math.pow(t[0].clientY - t[1].clientY, 2)); }
function centro(t) {
  return { x: (t[0].clientX + t[1].clientX) / 2 - window.innerWidth / 2, y: (t[0].clientY + t[1].clientY) / 2 - window.innerHeight / 2 };
}
function fechaV() {
  var vv = $('#vv'), vw = $('#vw');
  nivel = sub ? 1 : 0;
  if (vv.pause) vv.pause();
  clearTimeout(ctlT); sk = null;
  voltaRetrato();
  vw.classList.remove('on');
  document.body.classList.remove('viewer-open');
  clearTimeout(fechaT);
  fechaT = setTimeout(function () {
    vw.style.display = 'none';
    vw.classList.remove('vid'); vw.classList.remove('espera'); vw.classList.remove('land');
    if (vv.removeAttribute) vv.removeAttribute('src');
    vv.removeAttribute('poster'); soltaCapa();
    ['#vpa', '#vpb'].forEach(function (q) { $(q).style.display = 'none'; });
    zera();
  }, reduz ? 0 : 210);
  /* se tirou favoritos de dentro da aba Favoritos, a lista se refaz ao fechar */
  if (favMudou && aba === 'favoritos' && !sub) { favMudou = false; refrescaAtual(); }
}
function fecharViewer() { fechaV(); }
function mostrar(list, idx) {
  vlist = list; vi = idx; G = null;
  clearTimeout(fechaT); clearTimeout(tapT);
  zera();
  var vw = $('#vw');
  vw.classList.remove('semui'); vw.classList.remove('on');
  vw.style.display = 'flex';
  document.body.classList.add('viewer-open');
  showV(0);
  raf(function () { vw.classList.add('on'); });
  empurra(2);
}
function horaDe(s) {
  var d = new Date(s * 1000), h = d.getHours(), m = d.getMinutes();
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
function atualizaVBtns(i) { $('#vf').classList.toggle('on', !!i && ehFav(i)); $('#ve').style.display = (i && i.v) ? 'none' : ''; }
function showV(d) {
  var i = vlist[vi], im = $('#vim'), vv = $('#vv'), vw = $('#vw'), c = cand(i), k = 0;
  if (!i.v && i._gp) c = [fonte(i._gp)].concat(c);
  if (vv.pause) vv.pause();
  im.className = '';
  clearTimeout(ctlT); sk = null;
  var larga = !!(i.v && i.w > i.h);
  vw.classList.toggle('vid', !!i.v);
  vw.classList.toggle('land', larga);
  vw.classList.remove('espera');
  if (paisagem && !larga) voltaRetrato();
  $('#vro').classList.toggle('on', paisagem);
  atualizaVBtns(i);
  if (i.v) {
    vw.classList.remove('semui');
    im.style.display = 'none'; vv.style.display = 'block';
    vv.loop = false; velI = 0; vv.defaultPlaybackRate = 1;
    $('#vvel').textContent = '1×'; $('#vlp').classList.remove('on');
    pintaProg(0, 0); $('#vbf').style.width = '0%'; $('#vtd').textContent = fmtT((i.dur || 0) / 1000);
    vv.onerror = function () {
      k++;
      if (k < c.length) vv.src = c[k];
      else { vw.classList.remove('espera'); soltaCapa(); setm('Não foi possível abrir este vídeo.'); }
    };
    vv.poster = thumbSrc(i) || '';
    vw.classList.add('espera');
    vv.src = c[0]; vv.controls = false;
    estadoV();
    var pp = vv.play && vv.play();
    if (pp && pp.catch) pp.catch(function () {});
    mostraCtl();
  } else {
    vv.style.display = 'none';
    if (vv.removeAttribute) vv.removeAttribute('src');
    im.style.display = 'block'; im.style.opacity = '0';
    im.onerror = function () {
      k++;
      if (k < c.length) im.src = c[k];
      else if (!i._gp && !i._gr && Galeria) {
        i._gr = true;
        nativa(i, 4096, function (p) {
          if (p) { i._gp = p; if (vlist[vi] === i) im.src = fonte(p); }
          else if (vlist[vi] === i) { im.style.opacity = '1'; soltaCapa(); setm('Não foi possível abrir esta foto.'); }
        });
      } else { im.style.opacity = '1'; soltaCapa(); }
    };
    im.onload = function () {
      im.style.opacity = '1'; soltaCapa();
      if (i._gr && /^Carregando foto/.test($('#m').textContent)) setm('');
      if (d && !reduz) { im.className = ''; void im.offsetWidth; im.className = d > 0 ? 'vin-r' : 'vin-l'; }
    };
    if (gigante(i) && !i._gp && !i._gr && Galeria) {
      /* foto enorme (ex.: 108 MP): o Android prepara uma versão grande, em vez de o WebView tentar abrir o original */
      i._gr = true;
      setm('Carregando foto…');
      nativa(i, 5000, function (p) {
        if (vlist[vi] !== i) return;
        if (p) { i._gp = p; im.src = fonte(p); }
        else { setm(''); im.src = c[0]; }
      });
    } else im.src = c[0];
    [vi - 1, vi + 1].forEach(function (q) {
      var o = vlist[q];
      if (o && !o.v && !gigante(o)) { var pre = new Image(); pre.src = cand(o)[0]; }
    });
  }
  lados();
  $('#vc').textContent = (vi + 1) + ' / ' + vlist.length;
  $('#vdt').textContent = i.t ? rotuloDia(i.t) + ' · ' + horaDe(i.t) : '';
  $('#vtl').style.display = i.t ? '' : 'none';
}
function nav(d) {
  var k = vi + d;
  if (k < 0 || k >= vlist.length) return;
  vi = k; zera(); showV(0);
}
var swAnim = false;
function desliza(d) {
  if (reduz || paisagem) { nav(d); return; }
  swAnim = true;
  Z.x = -d * (larguraV() + GAP); Z.y = 0; Z.s = 1; aplica(true);
  clearTimeout(swT);
  swT = setTimeout(function () {
    var lado = $(d > 0 ? '#vpb' : '#vpa'), cv = $('#vcv'), u = lado.getAttribute('src');
    if (u) { cv.style.transition = 'none'; cv.style.transform = 'none'; cv.src = u; cv.style.display = 'block'; }
    swAnim = false;
    nav(d);
  }, 250);
}
function dobraZoom(x, y) {
  if (Z.s > 1.01) { Z.s = 1; Z.x = 0; Z.y = 0; }
  else {
    var cx = x - window.innerWidth / 2, cy = y - window.innerHeight / 2;
    Z.s = 2.5; Z.x = -1.5 * cx; Z.y = -1.5 * cy; limita();
  }
  aplica(true);
}
function toque(x, y) {
  var agora = Date.now(), atual = vlist[vi];
  if (!atual) return;
  if (atual.v) { toqueVideo(x, agora); return; }
  if (agora - ultToque < 300 && Math.abs(x - ultX) < 40 && Math.abs(y - ultY) < 40) {
    clearTimeout(tapT); ultToque = 0;
    dobraZoom(x, y);
    return;
  }
  ultToque = agora; ultX = x; ultY = y;
  clearTimeout(tapT);
  tapT = setTimeout(function () { ultToque = 0; $('#vw').classList.toggle('semui'); }, 290);
}
/* vídeo: um toque mostra/esconde os controles; toque duplo nas laterais pula 10 s, no meio pausa/continua */
function toqueVideo(x, agora) {
  var W = window.innerWidth || 360, lado = x < W * 0.35 ? -1 : (x > W * 0.65 ? 1 : 0);
  if (lado && agora - ultSalto < 600) { clearTimeout(tapT); ultToque = 0; saltoVisual(lado); return; }
  if (agora - ultToque < 300 && Math.abs(x - ultX) < 80) {
    clearTimeout(tapT); ultToque = 0;
    if (lado) saltoVisual(lado); else playPause();
    return;
  }
  ultToque = agora; ultX = x;
  clearTimeout(tapT);
  tapT = setTimeout(function () { ultToque = 0; alternaCtl(); }, 280);
}
function vStart(e) {
  var t = e.touches, atual = vlist[vi];
  if (!atual) return;
  if (swAnim) { G = { mode: 'ignora' }; return; }
  if (t.length >= 2) {
    if (atual.v) { G = { mode: 'ignora' }; return; }
    clearTimeout(tapT);
    var c = centro(t);
    G = { mode: 'pinch', d0: dist(t) || 1, s0: Z.s, x0: Z.x, y0: Z.y, cx: c.x, cy: c.y };
    return;
  }
  G = { mode: null, sx: t[0].clientX, sy: t[0].clientY, t0: Date.now(), zx: Z.x, zy: Z.y, moveu: false };
}
function vMove(e) {
  if (!G || G.mode === 'ignora') return;
  var t = e.touches, atual = vlist[vi];
  if (!atual) return;
  if (G.mode === 'pinch') {
    if (t.length < 2) return;
    var c = centro(t), s = Math.max(1, Math.min(5, G.s0 * dist(t) / G.d0));
    Z.s = s; Z.x = c.x - (s / G.s0) * (G.cx - G.x0); Z.y = c.y - (s / G.s0) * (G.cy - G.y0);
    limita(); aplica(false);
    return;
  }
  if (t.length !== 1) return;
  var dx = t[0].clientX - G.sx, dy = t[0].clientY - G.sy;
  if (Math.abs(dx) > 8 || Math.abs(dy) > 8) G.moveu = true;
  if (Z.s > 1.02 && !atual.v) {
    G.mode = 'pan'; Z.x = G.zx + dx; Z.y = G.zy + dy; limita(); aplica(false);
    return;
  }
  if (!G.mode && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
    G.mode = Math.abs(dx) > Math.abs(dy) * 1.1 ? 'h' : (dy > 0 ? 'v' : 'x');
  }
  if (G.mode === 'h' && (!atual.v || !paisagem)) {
    var fim = (dx < 0 && vi >= vlist.length - 1) || (dx > 0 && vi <= 0);
    Z.x = dx * (fim ? 0.25 : 1); Z.y = 0; aplica(false);
  } else if (G.mode === 'v') {
    var dd = Math.max(0, dy);
    Z.x = dx * 0.4; Z.y = dd; Z.s = Math.max(0.7, 1 - dd / 1400); aplica(false);
    $('#vbg').style.opacity = String(Math.max(0.15, 1 - dd / 450));
    $('#vp').style.opacity = String(Math.max(0, 1 - dd / 150));
  }
}
function vEnd(e) {
  if (!G) return;
  var g = G, resta = e.touches ? e.touches.length : 0;
  if (resta > 0) {
    if (g.mode === 'pinch') {
      if (Z.s < 1.05) { Z.s = 1; Z.x = 0; Z.y = 0; }
      limita(); aplica(true);
      G = { mode: null, sx: e.touches[0].clientX, sy: e.touches[0].clientY, t0: Date.now(), zx: Z.x, zy: Z.y, moveu: true };
    }
    return;
  }
  var ch = e.changedTouches[0], dx = ch.clientX - g.sx, dy = ch.clientY - g.sy;
  var rapido = g.t0 ? Math.abs(Math.abs(dx) > Math.abs(dy) ? dx : dy) / (Date.now() - g.t0 + 1) > 0.5 : false;
  G = null;
  if (g.mode === 'ignora') return;
  if (g.mode === 'pinch') {
    if (Z.s < 1.05) { Z.s = 1; Z.x = 0; Z.y = 0; }
    limita(); aplica(true);
    return;
  }
  if (g.mode === 'pan') { limita(); aplica(true); return; }
  if (g.mode === 'h') {
    var d = dx < 0 ? 1 : -1;
    if ((Math.abs(dx) > window.innerWidth * 0.2 || (rapido && Math.abs(dx) > 40)) && vi + d >= 0 && vi + d < vlist.length) { desliza(d); return; }
    Z.x = 0; Z.y = 0; Z.s = 1; aplica(true);
    return;
  }
  if (g.mode === 'v') {
    if (dy > 110 || (dy > 50 && rapido)) { fecharViewer(); return; }
    Z.x = 0; Z.y = 0; Z.s = 1; aplica(true);
    $('#vbg').style.opacity = ''; $('#vp').style.opacity = '';
    return;
  }
  if (g.mode === 'x') { Z.x = 0; Z.y = 0; Z.s = 1; aplica(true); return; }
  if (!g.moveu) toque(ch.clientX, ch.clientY);
}
(function () {
  var vw = $('#vw');
  vw.addEventListener('touchstart', vStart, { passive: true });
  vw.addEventListener('touchmove', vMove, { passive: true });
  vw.addEventListener('touchend', vEnd, { passive: true });
  vw.addEventListener('touchcancel', function () { G = null; if (viewerAberto()) { Z.s = 1; Z.x = 0; Z.y = 0; aplica(true); } }, { passive: true });
})();
/* os botões e a barra do player não podem disparar os gestos do visualizador */
['#vt', '#vp', '#vact'].forEach(function (q) {
  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function (ev) {
    $(q).addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
  });
});
$('#vx').onclick = fecharViewer;
$('#vd').onclick = async function () {
  var ok = await apagar([vlist[vi]]);
  if (ok) {
    vlist.splice(vi, 1);
    if (!vlist.length) fechaSub();
    else { if (vi >= vlist.length) vi = vlist.length - 1; zera(); showV(0); }
  }
};
$('#vf').onclick = function () {
  var i = vlist[vi];
  if (!i) return;
  var v = !ehFav(i);
  setFav([i], v);
  atualizaVBtns(i);
  var b = $('#vf'); b.classList.remove('bate'); void b.offsetWidth;
  if (v) b.classList.add('bate');
  setm(v ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
};
$('#vs').onclick = function () {
  var i = vlist[vi];
  if (!i) return;
  if (i.v) vid().pause();
  compartilhar([i]);
};

/* ---------- player de vídeo ---------- */
function vid() { return $('#vv'); }
function fmtT(s) {
  s = Math.max(0, Math.floor(s || 0));
  var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (h ? h + ':' + (m < 10 ? '0' : '') + m : String(m)) + ':' + (x < 10 ? '0' : '') + x;
}
function durV() {
  var d = vid().duration;
  if (d && isFinite(d)) return d;
  var i = vlist[vi];
  return i && i.dur ? i.dur / 1000 : 0;
}
function pintaProg(t, p) {
  $('#vpr').style.width = p + '%';
  $('#vth').style.left = p + '%';
  $('#vtc').textContent = fmtT(t);
}
function atualizaProg() {
  if (sk) return;
  var v = vid(), d = durV(), t = v.currentTime || 0;
  pintaProg(t, d ? Math.min(100, t * 100 / d) : 0);
}
function atualizaBuf() {
  var v = vid(), d = durV(), b = 0;
  try { if (v.buffered && v.buffered.length) b = v.buffered.end(v.buffered.length - 1); } catch (e) { b = 0; }
  $('#vbf').style.width = d ? Math.min(100, b * 100 / d) + '%' : '0%';
}
function tick() {
  if (!viewerAberto() || vid().paused) { tickOn = false; return; }
  atualizaProg();
  raf(tick);
}
function iniciaTick() { if (!tickOn) { tickOn = true; raf(tick); } }
function estadoV() {
  var v = vid(), b = $('#vpl');
  $('#vw').classList.toggle('pausa', v.paused && !sk);
  b.innerHTML = ico(v.paused ? 'play' : 'pause');
  b.classList.toggle('play', v.paused);
}
/* mostra os controles e, se o vídeo está tocando, esconde de novo depois de 3 s */
function mostraCtl() {
  var i = vlist[vi];
  clearTimeout(ctlT);
  if (!i || !i.v) return;
  $('#vw').classList.remove('semui');
  if (!vid().paused && !sk) ctlT = setTimeout(function () { $('#vw').classList.add('semui'); }, 3200);
}
function alternaCtl() {
  var vw = $('#vw');
  if (vw.classList.contains('semui')) mostraCtl();
  else { clearTimeout(ctlT); vw.classList.add('semui'); }
}
function playPause() {
  var v = vid();
  if (v.paused || v.ended) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  else v.pause();
  mostraCtl();
}
function salta(s) {
  var v = vid(), d = durV(), t = (v.currentTime || 0) + s;
  v.currentTime = Math.max(0, d ? Math.min(d, t) : t);
  atualizaProg();
}
function saltoVisual(dir) {
  var agora = Date.now();
  if (agora - ultSalto > 700 || saltoDir !== dir) saltoAcum = 0;
  saltoAcum += 10; saltoDir = dir; ultSalto = agora;
  salta(dir * 10);
  var e = $(dir < 0 ? '#vfl' : '#vfr');
  e.querySelector('span').textContent = (dir < 0 ? '−' : '+') + saltoAcum + ' s';
  e.classList.remove('on'); void e.offsetWidth; e.classList.add('on');
}
function girarApp(p) {
  if (!Galeria) return;
  try { var r = Galeria.orientacao({ paisagem: p }); if (r && r.catch) r.catch(function () {}); } catch (e) { /* ignora */ }
}
function voltaRetrato() {
  if (!paisagem) return;
  paisagem = false; $('#vro').classList.remove('on'); girarApp(false);
}
$('#vpl').onclick = playPause;
$('#vbig').onclick = playPause;
$('#vb10').onclick = function () { salta(-10); mostraCtl(); };
$('#vf10').onclick = function () { salta(10); mostraCtl(); };
$('#vvel').onclick = function () {
  velI = (velI + 1) % VEL.length;
  vid().playbackRate = VEL[velI];
  this.textContent = String(VEL[velI]).replace('.', ',') + '×';
  mostraCtl();
};
$('#vlp').onclick = function () {
  var v = vid(); v.loop = !v.loop;
  this.classList.toggle('on', v.loop);
  setm(v.loop ? 'Repetição ativada' : 'Repetição desativada');
  mostraCtl();
};
$('#vmu').onclick = function () { var v = vid(); v.muted = !v.muted; mostraCtl(); };
$('#vro').onclick = function () {
  paisagem = !paisagem;
  this.classList.toggle('on', paisagem);
  girarApp(paisagem);
  mostraCtl();
};
(function () {
  var v = vid(), vw = $('#vw');
  function ev(n, f) { v.addEventListener(n, f); }
  ev('loadedmetadata', function () { $('#vtd').textContent = fmtT(durV()); atualizaProg(); atualizaBuf(); });
  ev('durationchange', function () { $('#vtd').textContent = fmtT(durV()); });
  ev('progress', atualizaBuf);
  ev('timeupdate', function () { if (v.paused) atualizaProg(); atualizaBuf(); });
  ev('play', function () { estadoV(); mostraCtl(); iniciaTick(); });
  ev('playing', function () { vw.classList.remove('espera'); soltaCapa(); estadoV(); iniciaTick(); });
  ev('loadeddata', soltaCapa);
  ev('pause', function () { estadoV(); mostraCtl(); });
  ev('ended', function () { estadoV(); mostraCtl(); atualizaProg(); });
  ev('waiting', function () { if (!v.paused) vw.classList.add('espera'); });
  ev('canplay', function () { vw.classList.remove('espera'); });
  ev('volumechange', function () { $('#vmu').innerHTML = ico(v.muted || v.volume === 0 ? 'mudo' : 'vol'); });
})();
/* barra de progresso: toque ou arraste para ir a qualquer ponto do vídeo */
(function () {
  var s = $('#vsk'), caixa = s.querySelector('.in');
  function frac(e) {
    var r = caixa.getBoundingClientRect(), p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!p) return 0;
    return Math.max(0, Math.min(1, (p.clientX - r.left) / (r.width || 1)));
  }
  function vai(e, fim) {
    var d = durV();
    if (!d) return;
    var f = frac(e), t = f * d, v = vid(), w = caixa.offsetWidth, tip = $('#vtip'), agora = Date.now();
    pintaProg(t, f * 100);
    tip.textContent = fmtT(t); tip.style.left = Math.max(34, Math.min(w - 34, f * w)) + 'px';
    if (fim || agora - skT > 70) {
      skT = agora;
      if (!fim && v.fastSeek) v.fastSeek(t); else v.currentTime = t;
    }
  }
  function acaba(e, ok) {
    if (!sk) return;
    if (ok) vai(e, true);
    sk = null; s.classList.remove('sc');
    estadoV(); mostraCtl(); atualizaProg();
  }
  s.addEventListener('touchstart', function (e) {
    sk = {}; s.classList.add('sc'); clearTimeout(ctlT);
    $('#vw').classList.remove('semui');
    vai(e, false);
  }, { passive: true });
  s.addEventListener('touchmove', function (e) { if (sk) vai(e, false); }, { passive: true });
  s.addEventListener('touchend', function (e) { acaba(e, true); }, { passive: true });
  s.addEventListener('touchcancel', function (e) { acaba(e, false); }, { passive: true });
})();

/* ---------- compartilhar (folha de compartilhamento do Android) ---------- */
async function compartilhar(arr) {
  if (!arr.length) return;
  if (!Galeria) { setm('Recurso indisponível neste aparelho.'); return; }
  if (arr.length > 100) { setm('Limite de 100 itens por compartilhamento.'); return; }
  try {
    await Galeria.compartilhar({ uris: arr.map(function (i) { return i.u; }) });
  } catch (e) {
    setm('Não foi possível compartilhar: ' + (e.message || e));
  }
}

/* ---------- puxar a tela para baixo para atualizar ---------- */
function podePuxar() {
  if (atualizando || carregando || DS || selMode || sub || nivel > 0 || viewerAberto()) return false;
  var cf = $('#cf');
  if (cf && cf.classList.contains('on')) return false;
  return (window.scrollY || 0) <= 0;
}
function ptrPosiciona(d) {
  var p = $('#ptr'), a = $('#app'), pr = Math.min(1, d / PTR_GATILHO);
  p.style.transition = 'none'; a.style.transition = 'none';
  p.style.opacity = String(Math.min(1, pr * 1.3));
  p.style.transform = 'translateY(' + (d - 52) + 'px) scale(' + (0.6 + 0.4 * pr) + ')';
  a.style.transform = 'translateY(' + d + 'px)';
  p.classList.toggle('pronto', d >= PTR_GATILHO);
}
function ptrFecha() {
  var p = $('#ptr'), a = $('#app');
  p.style.transition = 'transform .28s cubic-bezier(.2,.8,.2,1),opacity .22s';
  a.style.transition = 'transform .28s cubic-bezier(.2,.8,.2,1)';
  p.style.opacity = '0'; p.style.transform = 'translateY(-52px) scale(.6)'; a.style.transform = '';
  p.classList.remove('pronto'); p.classList.remove('gira');
  setTimeout(function () { a.style.transition = ''; p.style.transition = ''; }, 340);
}
async function puxaAtualiza() {
  var p = $('#ptr'), a = $('#app');
  atualizando = true;
  p.classList.remove('pronto'); p.classList.add('gira');
  p.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1)';
  a.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1)';
  p.style.transform = 'translateY(10px) scale(1)'; a.style.transform = 'translateY(54px)';
  var antes = items.length, t0 = Date.now();
  var ok = await ler(true);
  var resta = 750 - (Date.now() - t0);
  if (resta > 0) await new Promise(function (r) { setTimeout(r, resta); });
  ptrFecha();
  atualizando = false;
  if (ok) {
    var dif = items.length - antes;
    setm(dif > 0 ? plural(dif, 'item novo', 'itens novos') : 'Galeria atualizada');
  }
}
document.addEventListener('touchstart', function (e) {
  PT = null;
  if (e.touches.length !== 1 || !podePuxar()) return;
  PT = { y: e.touches[0].clientY, x: e.touches[0].clientX, ativo: false, d: 0 };
}, { passive: true });
document.addEventListener('touchmove', function (e) {
  if (!PT) return;
  if (e.touches.length !== 1 || selMode || DS || viewerAberto()) { if (PT.ativo) ptrFecha(); PT = null; return; }
  var t = e.touches[0], dy = t.clientY - PT.y, dx = t.clientX - PT.x;
  if (!PT.ativo) {
    if (dy < -6 || (Math.abs(dx) > 14 && Math.abs(dx) > dy)) { PT = null; return; }
    if (dy < 12) return;
    if ((window.scrollY || 0) > 0) { PT = null; return; }
    PT.ativo = true; PT.y = t.clientY;
    var a = $('#app'); a.classList.remove('in-r'); a.classList.remove('in-l');
    $('#ptr').style.top = $('#hd').getBoundingClientRect().bottom + 'px';
    dy = 0;
  } else dy = t.clientY - PT.y;
  if (e.cancelable) e.preventDefault();
  PT.d = Math.max(0, Math.min(PTR_MAX, dy * 0.55));
  ptrPosiciona(PT.d);
}, { passive: false });
document.addEventListener('touchend', function () {
  if (!PT) return;
  var g = PT; PT = null;
  if (!g.ativo) return;
  puxouT = Date.now();
  if (g.d >= PTR_GATILHO) puxaAtualiza(); else ptrFecha();
}, { passive: true });
document.addEventListener('touchcancel', function () {
  if (PT && PT.ativo) ptrFecha();
  PT = null;
}, { passive: true });
/* depois de puxar, o toque que termina o gesto não pode abrir uma foto por engano */
document.addEventListener('click', function (e) {
  if (Date.now() - puxouT < 400) { e.stopPropagation(); e.preventDefault(); }
}, true);

/* ---------- passar de uma aba para a outra deslizando o dedo para o lado ---------- */
var SW = null, swT = null;
function swLivre() {
  if (pendAba || atualizando || DS || selMode || sub || nivel > 0 || viewerAberto()) return false;
  var b = document.body;
  if (b.classList.contains('sem') || b.classList.contains('insub') || b.classList.contains('sel')) return false;
  var cf = $('#cf');
  return !(cf && cf.classList.contains('on'));
}
function swVolta() {
  var a = $('#app');
  clearTimeout(swT);
  a.style.transition = 'transform .22s var(--ease),opacity .22s';
  a.style.transform = ''; a.style.opacity = '';
  swT = setTimeout(function () { a.style.transition = ''; }, 260);
}
document.addEventListener('touchstart', function (e) {
  SW = null;
  if (e.touches.length !== 1 || !swLivre()) return;
  var t = e.touches[0], w = window.innerWidth || 360;
  if (t.clientX < 24 || t.clientX > w - 24) return; /* bordas: gesto de voltar do Android */
  if (e.target && e.target.closest && e.target.closest('input,select,textarea')) return;
  SW = { x: t.clientX, y: t.clientY, w: w, ativo: false, dir: 0, alvo: 0, m: 0, ta: 0 };
}, { passive: true });
document.addEventListener('touchmove', function (e) {
  if (!SW) return;
  if (e.touches.length !== 1 || !swLivre()) { if (SW.ativo) swVolta(); SW = null; return; }
  var t = e.touches[0], dx = t.clientX - SW.x, dy = t.clientY - SW.y, a = $('#app');
  if (!SW.ativo) {
    if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx) * 0.7) { SW = null; return; } /* é rolagem */
    if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    var dir = dx < 0 ? 1 : -1, alvo = ABAS.indexOf(aba) + dir;
    if (alvo < 0 || alvo >= ABAS.length) { SW = null; return; }
    clearTimeout(swT);
    SW.ativo = true; SW.dir = dir; SW.alvo = alvo; SW.x = t.clientX; SW.ta = Date.now();
    a.classList.remove('in-r'); a.classList.remove('in-l');
    a.style.transition = 'none';
    dx = 0;
  }
  if (e.cancelable) e.preventDefault();
  var m = Math.max(0, -dx * SW.dir);
  SW.m = m;
  a.style.transform = 'translate3d(' + (-SW.dir * Math.min(m * 0.5, SW.w * 0.3)) + 'px,0,0)';
  a.style.opacity = String(1 - Math.min(0.55, m / (SW.w * 0.9)));
}, { passive: false });
document.addEventListener('touchend', function () {
  if (!SW) return;
  var g = SW; SW = null;
  if (!g.ativo) return;
  puxouT = Date.now(); /* o fim do gesto não pode abrir uma foto por engano */
  var rapido = g.m > 40 && g.m / Math.max(1, Date.now() - g.ta) > 0.45;
  if ((g.m > g.w * 0.26 || rapido) && swLivre()) {
    var a = $('#app');
    a.style.transition = 'transform .12s ease-out,opacity .12s ease-out';
    a.style.transform = 'translate3d(' + (-g.dir * 40) + 'px,0,0)'; a.style.opacity = '0';
    trocaAba(ABAS[g.alvo]);
  } else swVolta();
}, { passive: true });
document.addEventListener('touchcancel', function () {
  if (SW && SW.ativo) swVolta();
  SW = null;
}, { passive: true });


/* ---------- zoom da grade com dois dedos ----------
   A grade acompanha os dedos em tempo real (escala a partir do topo da tela). Ao soltar, ela se ajusta
   ao número de colunas mais próximo e a primeira linha visível continua no mesmo lugar. */
var PZ = null;
function pzLivre() {
  if (!VL || pendAba || atualizando || DS || viewerAberto() || ED || folhaAberta()) return false;
  if (document.body.classList.contains('forca')) return false;
  var cf = $('#cf');
  return !(cf && cf.classList.contains('on'));
}
function pzDist(e) { var a = e.touches[0], b = e.touches[1]; return Math.sqrt(Math.pow(a.clientX - b.clientX, 2) + Math.pow(a.clientY - b.clientY, 2)); }
function topoVisivel() { var h = $('#hd'); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0; }
function mudaCols(n, antigos) {
  if (!VL || n === CFG.cols || n < COLS_MIN || n > COLS_MAX) return;
  var d = VL.d, r = VL.el.getBoundingClientRect(), docTop = r.top + (window.scrollY || 0);
  var k = primeiro(VL.ent, topoVisivel() - r.top), e0 = VL.ent[k], offs = e0 ? r.top + e0.y : 0;
  CFG.cols = n; aplicaCfg();
  var L = layout(d), y = window.scrollY || 0;
  if (e0) {
    var ne = null;
    L.ent.forEach(function (x) {
      if (ne) return;
      if (e0.k === 'h') {
        if (x.k !== 'h') return;
        if (e0.it && e0.it.length) { if (x.it && x.it.indexOf(e0.it[0]) >= 0) ne = x; }
        else if (x.txt === e0.txt) ne = x;
      } else if (x.k === 'r' && x.it.indexOf(e0.it[0]) >= 0) ne = x;
    });
    if (ne) y = Math.max(0, docTop + ne.y - offs);
  }
  montaLista(d, false, y);
  if (antigos && VL && VL.el && !reduz) deslizaGrade(antigos);
}
/* cada foto desliza do tamanho/posição que tinha para o novo lugar; as que não estavam na tela aparecem suavemente */
function deslizaGrade(antigos) {
  var todos = VL.el.querySelectorAll('.cell, .dh'), mov = [];
  Array.prototype.forEach.call(todos, function (c) {
    var o = c._it && antigos.get(c._it);
    c.style.transition = 'none';
    if (o) {
      var nr = c.getBoundingClientRect();
      if (nr.width > 1 && nr.height > 1) {
        c.style.transformOrigin = '0 0';
        c.style.transform = 'translate(' + (o.left - nr.left).toFixed(1) + 'px,' + (o.top - nr.top).toFixed(1) + 'px) scale(' + (o.width / nr.width).toFixed(4) + ',' + (o.height / nr.height).toFixed(4) + ')';
        mov.push(c); return;
      }
    }
    c.style.opacity = '0';
    mov.push(c);
  });
  void VL.el.offsetWidth;
  raf(function () {
    mov.forEach(function (c) {
      c.style.transition = 'transform .32s cubic-bezier(.2,.8,.2,1), opacity .3s ease-out';
      c.style.transform = ''; c.style.opacity = '';
    });
    setTimeout(function () { mov.forEach(function (c) { c.style.transition = ''; c.style.transformOrigin = ''; }); }, 360);
  });
}
function pzSolta(cancela) {
  var p = PZ;
  if (!p || p.fin) return;
  var n = cancela ? p.c0 : Math.max(COLS_MIN, Math.min(COLS_MAX, Math.round(p.c0 / p.f)));
  p.fin = true;
  puxouT = Date.now();
  function limpa() { p.el.style.transition = ''; p.el.style.transform = ''; p.el.style.willChange = ''; p.el.style.transformOrigin = ''; }
  if (n !== p.c0 && VL && VL.el === p.el) {
    var antigos = new Map();
    if (!reduz) Object.keys(VL.mont).forEach(function (k) {
      var no = VL.mont[k];
      if (no && no.querySelectorAll) Array.prototype.forEach.call(no.querySelectorAll('.cell'), function (c) { if (c._it) antigos.set(c._it, c.getBoundingClientRect()); });
    });
    limpa();
    mudaCols(n, reduz ? null : antigos);
    PZ = null; salvaCfg();
    return;
  }
  if (reduz) { limpa(); PZ = null; return; }
  p.el.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1)';
  p.el.style.transform = 'scale(1)';
  setTimeout(function () { limpa(); PZ = null; }, 230);
}
document.addEventListener('touchstart', function (e) {
  if (PZ && PZ.fin) return;
  if (e.touches.length === 2 && pzLivre()) {
    var r = VL.el.getBoundingClientRect();
    PZ = { d0: Math.max(30, pzDist(e)), c0: CFG.cols, f: 1, el: VL.el, fin: false };
    PZ.el.style.transformOrigin = '0px ' + (topoVisivel() - r.top) + 'px';
    PZ.el.style.transition = 'none';
    PZ.el.style.willChange = 'transform';
  } else if (e.touches.length !== 2 && PZ) pzSolta(true);
}, { passive: true });
document.addEventListener('touchmove', function (e) {
  if (!PZ || PZ.fin || e.touches.length !== 2) return;
  if (e.cancelable) e.preventDefault();
  var fmin = PZ.c0 / (COLS_MAX + 0.4), fmax = PZ.c0 / (COLS_MIN - 0.4);
  PZ.f = Math.max(fmin, Math.min(fmax, pzDist(e) / PZ.d0));
  PZ.el.style.transform = 'scale(' + PZ.f.toFixed(4) + ')';
}, { passive: false });
document.addEventListener('touchend', function (e) { if (e.touches.length < 2) pzSolta(false); }, { passive: true });
document.addEventListener('touchcancel', function () { pzSolta(true); }, { passive: true });

/* ---------- exclusão (confirmação do próprio Android) ---------- */
async function desfazerLixeira(uris) {
  if (!Galeria || !Galeria.restaurar) { setm('Não foi possível desfazer neste aparelho.'); return; }
  setm('Aguardando confirmação do Android…');
  try {
    var r = await Galeria.restaurar({ uris: uris });
    if (r.cancelado) { setm('Restauração cancelada.'); return; }
    setm(plural(r.ok, 'item restaurado', 'itens restaurados') + '.');
    ultLeitura = 0;
    ler(true, true);
  } catch (e) {
    setm('Não foi possível desfazer: ' + (e.message || e));
  }
}
async function apagar(arr) {
  if (!arr.length) return false;
  if (!Galeria) { setm('Recurso indisponível neste aparelho.'); return false; }
  if (arr.length > 2000) { setm('Limite de 2000 itens por operação.'); return false; }
  var sim = CFG.pergunta ? await confirma(
    'Mover ' + arr.length + (arr.length === 1 ? ' item' : ' itens') + ' para a lixeira?',
    (SDK && SDK < 30) ? 'Neste Android a exclusão é permanente e não pode ser desfeita. O Android solicita uma confirmação final.'
      : 'Os itens permanecem na lixeira do Android por cerca de 30 dias. O Android solicita uma confirmação final.',
    (SDK && SDK < 30) ? 'Excluir' : 'Mover para a lixeira') : true;
  if (!sim) return false;
  setm('Aguardando confirmação do Android…');
  try {
    var r = await Galeria.apagar({ uris: arr.map(function (i) { return i.u; }), permanente: false });
    if (r.cancelado) { setm('Exclusão cancelada.'); return false; }
    var uris = arr.map(function (i) { return i.u; });
    if (r.lixeira && r.ok > 0) {
      setmAcao(plural(r.ok, 'item movido', 'itens movidos') + ' para a lixeira', 'Desfazer', function () { desfazerLixeira(uris); }, 9000);
    } else setm(plural(r.ok, 'item excluído', 'itens excluídos') + '.');
    var rm = {}; arr.forEach(function (i) { rm[i.u] = 1; });
    items = items.filter(function (i) { return !rm[i.u]; });
    selMode = false;
    refrescaAtual();
    return r.ok > 0;
  } catch (e) {
    setm('Não foi possível excluir: ' + (e.message || e));
    return false;
  }
}

/* ---------- folha de baixo: detalhes da foto e diagnóstico ---------- */
function folhaAberta() { return $('#fo').classList.contains('on'); }
function fechaFolha() { $('#fo').classList.remove('on'); }
function abreFolha(titulo, corpo, botoes) {
  $('#fot').textContent = titulo;
  var b = $('#fob'); b.innerHTML = ''; b.appendChild(corpo); b.scrollTop = 0;
  var a = $('#foa'); a.innerHTML = '';
  (botoes || []).concat([{ rot: 'Fechar', fn: fechaFolha, cls: 'sec2' }]).forEach(function (x) {
    var bt = el('button', 'big ' + (x.cls || 'sec2'), x.rot); bt.onclick = x.fn; a.appendChild(bt);
  });
  $('#fo').classList.add('on');
}
$('#fo').onclick = function (e) { if (e.target === this) fechaFolha(); };
function dataLonga(t) { var d = new Date(t * 1000); return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear() + ', ' + horaDe(t); }
function detalhes(i) {
  var d = el('div', 'dl');
  function lin(k, v) {
    if (v === '' || v == null) return;
    var r = el('div', 'dr'); r.appendChild(el('span', 'dk', k)); r.appendChild(el('span', 'dv', v)); d.appendChild(r);
  }
  var ext = (/\.([a-z0-9]+)$/i.exec(i.nome || '') || [])[1];
  lin('Nome', i.nome);
  lin('Data', i.t ? dataLonga(i.t) : 'Sem data');
  lin('Tamanho', i.tam ? fmtTam(i.tam) : '');
  lin('Dimensões', (i.w && i.h) ? i.w + ' × ' + i.h + (i.v ? '' : ' · ' + (i.w * i.h / 1e6).toFixed(1).replace('.', ',') + ' MP') : '');
  if (i.v) lin('Duração', fmtT((i.dur || 0) / 1000));
  lin('Tipo', ext ? ext.toUpperCase() + (i.v ? ' · vídeo' : ' · foto') : '');
  lin('Álbum', i.a && i.a !== i.pasta ? i.a : '');
  lin('Pasta', i.pasta);
  lin('Caminho', i.p);
  lin('Modificado', i.mod ? dataLonga(i.mod) : '');
  lin('Favorito', ehFav(i) ? 'Sim' : 'Não');
  abreFolha(i.v ? 'Detalhes do vídeo' : 'Detalhes da foto', d, []);
}
$('#ve').onclick = function () { var i = vlist[vi]; if (i && !i.v) abreEditor(i); };
$('#vi').onclick = function () {
  var i = vlist[vi];
  if (!i) return;
  if (i.v && vid().pause) vid().pause();
  detalhes(i);
};
async function contato(tipo, valor) {
  try {
    if (Galeria && Galeria.abrirContato) { await Galeria.abrirContato({ tipo: tipo, valor: valor }); return; }
  } catch (e) { /* copia o texto */ }
  var ok = await copiaTexto(tipo === 'instagram' ? '@' + valor : valor);
  setm(ok ? (tipo === 'instagram' ? '@' + valor : valor) + ' copiado para a área de transferência.' : 'Não foi possível abrir.');
}
function copiaTexto(t) {
  function plano() {
    var a = el('textarea'); a.value = t; a.style.cssText = 'position:fixed;left:-999px;top:0;opacity:0';
    document.body.appendChild(a); a.select(); var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(a); return ok;
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return plano(); });
  } catch (e) { /* tenta o jeito antigo */ }
  return Promise.resolve(plano());
}
async function testaFormatos(L) {
  if (!Galeria) { L.push('Teste: módulo nativo ausente.'); return; }
  var vistos = {};
  for (var k = 0; k < 2; k++) {
    var comp = k === 1, nome = comp ? 'compacto' : 'normal', t0 = Date.now();
    try {
      var r = await Galeria.listar(comp ? { compacto: true } : {});
      var f = r.fotos || [], x = f[0];
      var ok = true, ruim = 0;
      for (var q = 0; q < Math.min(f.length, 400); q++) {
        var y = f[q];
        if (comp ? !(Array.isArray(y) && typeof y[0] === 'number' && typeof y[2] === 'string') : !(y && typeof y.uri === 'string' && typeof y.nome === 'string')) ruim++;
      }
      ok = ruim === 0 && f.length > 0;
      L.push('Teste ' + nome + ': ' + (ok ? 'OK' : 'PROBLEMA') + ' · ' + f.length + ' itens · ' + (Date.now() - t0) + ' ms · fmt=' + r.fmt + ' · itens fora do formato: ' + ruim);
      L.push('  1º item: ' + (x === undefined ? '(nenhum)' : JSON.stringify(x).slice(0, 260)));
      if (comp) L.push('  pastas: ' + (r.pastas ? r.pastas.length : 'ausente') + ' · raiz: ' + r.raiz + ' · bI: ' + r.bI);
      vistos[nome] = f.length;
    } catch (e) { L.push('Teste ' + nome + ': FALHOU · ' + (e.message || e)); }
  }
  if (vistos.normal != null && vistos.compacto != null) L.push('Contagem igual nos dois formatos: ' + (vistos.normal === vistos.compacto ? 'sim' : 'NÃO'));
}
async function relatorio(testa) {
  var L = [], versao = ($('#dx').getAttribute('data-versao') || '').trim();
  L.push('Lumi ' + versao);
  L.push('Gerado em ' + new Date().toLocaleString('pt-BR'));
  L.push('Navegador: ' + (navigator.userAgent || '').slice(0, 160));
  try { if (Galeria) { var e = await Galeria.estado(); L.push('Android API ' + e.sdk + ' · permissão: ' + e.permissao); } } catch (x) { L.push('Estado indisponível: ' + (x.message || x)); }
  var semData = items.filter(function (i) { return !i.t; }).length;
  var semMini = items.filter(function (i) { return !i['t' + GRID]; }).length;
  var ruins = items.filter(function (i) { return i.bad; }).length;
  L.push('Na tela: ' + items.length + ' itens (fotos ' + (info.im != null ? info.im : '?') + ', vídeos ' + (info.vd != null ? info.vd : '?') + ')');
  L.push('Sem data: ' + semData + ' · sem miniatura ainda: ' + semMini + ' · com falha: ' + ruins);
  L.push('Última leitura: formato ' + (ULT.fmt === 2 ? 'compacto' : 'normal') + ' · ' + ULT.ms + ' ms');
  L.push('Leitura compacta: ' + (CFG.compacto ? 'ligada' : 'desligada'));
  L.push('Favoritos: ' + nFavs());
  if (testa) { L.push(''); await testaFormatos(L); }
  L.push(''); L.push('Registro de erros (' + LOGD.length + '):');
  if (!LOGD.length) L.push('  nenhum');
  LOGD.forEach(function (m) { L.push('  ' + m); });
  return L.join('\n');
}
async function abreDiag() {
  var pre = el('pre', 'dgp', 'Montando o relatório…');
  var texto = '';
  async function monta(testa) {
    pre.textContent = testa ? 'Testando os dois formatos de leitura… pode levar alguns segundos.' : 'Montando o relatório…';
    texto = await relatorio(testa); pre.textContent = texto;
  }
  abreFolha('Diagnóstico', pre, [
    { rot: 'Testar a leitura da galeria', cls: 'sec2', fn: function () { monta(true); } },
    { rot: 'Copiar relatório', cls: 'sec2', fn: async function () { setm((await copiaTexto(texto)) ? 'Relatório copiado.' : 'Não foi possível copiar.'); } },
    { rot: 'Salvar em Downloads', cls: 'sec2', fn: async function () {
      if (!Galeria || !Galeria.salvarArquivo) { setm('Não foi possível salvar neste aparelho.'); return; }
      try { var r = await Galeria.salvarArquivo({ nome: 'Lumi-diagnostico-' + dataArq() + '.txt', texto: texto }); setm('Arquivo salvo em Downloads: ' + ((r && r.nome) || 'relatório')); }
      catch (e) { setm('Não foi possível salvar: ' + (e.message || e)); }
    } }
  ]);
  await monta(false);
}

/* ---------- leitura da galeria ---------- */
function pdx(t) {
  $('#dx').textContent = t;
  var d = $('#dx2'); if (d) d.textContent = t;
}
async function diag() {
  var versao = $('#dx').getAttribute('data-versao') || '';
  if (!Galeria) { pdx('Não foi possível acessar a galeria neste aparelho.'); return; }
  try {
    var r = await Galeria.estado(); SDK = r.sdk;
    var eraParcial = permEst === 'parcial';
    permEst = r.permissao;
    if (eraParcial !== (permEst === 'parcial') && !sub && !selMode && !viewerAberto() && $('#hd .top')) cabecalho();
    var acesso = permEst === 'granted' ? 'Acesso completo às fotos e vídeos' : permEst === 'parcial' ? 'Acesso parcial: só algumas fotos foram liberadas' : 'Sem acesso às fotos e vídeos';
    var nb = items.filter(function (i) { return i.bad; }).length;
    var t = acesso;
    if (info.im != null) t = plural(items.length, 'item', 'itens') + ' na biblioteca (' + plural(info.im, 'foto', 'fotos') + ' e ' + plural(info.vd, 'vídeo', 'vídeos') + ')\n' + acesso;
    if (nb) t += '\n' + plural(nb, 'item sem prévia', 'itens sem prévia');
    pdx(t);
  } catch (e) {
    pdx('Não foi possível conferir o acesso às fotos agora.');
  }
}
/* assinatura rápida da lista: se não mudou nada, não precisa refazer a tela */
function assinatura(l) {
  var h = l.length | 0;
  for (var k = 0; k < l.length; k++) {
    var s = l[k].u || '', id = +s.slice(s.lastIndexOf('/') + 1) || 0;
    h = ((h * 31 + id) ^ (l[k].mod || 0) ^ (l[k].v ? 7 : 0)) | 0;
  }
  return h;
}
/* quieto: sem aviso de "lendo". preserva: se a lista mudou, refaz a tela mantendo a rolagem e a tela aberta */
function converteLeitura(r) {
  var f = r.fotos || [];
  if (r.fmt === 2 && r.pastas) {
    var raiz = r.raiz || '', pas = r.pastas || [], bI = r.bI || '', bV = r.bV || '', nIm = r.imagens | 0;
    return f.map(function (x, k) {
      var v = k >= nIm, pa = pas[x[3]] || '';
      return { p: x[1] || (raiz + pa + x[2]), u: (v ? bV : bI) + x[0], w: x[4] || 0, h: x[5] || 0, v: v, dur: x[9] || 0, t: x[6] || 0, nome: x[2], pasta: pa, tam: x[8] || 0, mod: x[7] || 0 };
    });
  }
  return f.map(function (x) {
    return { p: x.path, u: x.uri, w: x.w, h: x.h, v: !!x.v, dur: x.dur || 0, t: x.data || 0, nome: x.nome, pasta: x.pasta, tam: x.tam || 0, mod: x.mod || 0 };
  });
}
/* confere se o formato compacto chegou inteiro: endereço com número no fim, nome e data na maioria dos itens */
function leituraValida(novos, r) {
  if (!novos.length) return true;
  var n = Math.min(novos.length, 300), bons = 0;
  for (var k = 0; k < n; k++) {
    var o = novos[Math.floor(k * novos.length / n)];
    if (o && /\/\d+$/.test(o.u || '') && o.nome && o.t > 0) bons++;
  }
  return bons >= n * 0.9 && (r.fotos || []).length === novos.length;
}
var compactoCaiu = false;
/* se a leitura nativa travar, não deixa o app preso em "Lendo…" para sempre */
function comLimite(pr, ms) {
  return new Promise(function (res, rej) {
    var t = setTimeout(function () { rej(new Error('a leitura demorou demais')); }, ms);
    pr.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
  });
}
async function ler(quieto, preserva) {
  if (!Galeria) { setm('Recurso indisponível neste aparelho.'); return false; }
  if (carregando) return false;
  carregando = true;
  var ok = false;
  document.body.classList.add('lendo');
  if (!quieto) setm('Carregando a galeria…');
  try {
    var t0 = Date.now();
    var r = await comLimite(Galeria.listar(CFG.compacto ? { compacto: true } : {}), 60000);
    var novos = converteLeitura(r);
    if (CFG.compacto && !leituraValida(novos, r)) {
      logd('leitura compacta inválida; voltando ao formato normal');
      CFG.compacto = false; CFG.compactoOff = true; salvaCfg(); compactoCaiu = true;
      t0 = Date.now();
      r = await comLimite(Galeria.listar({}), 60000);
      novos = converteLeitura(r);
    }
    ULT = { fmt: r.fmt || 1, ms: Date.now() - t0, n: novos.length };
    TEMPOS[ULT.fmt === 2 ? 2 : 1] = ULT.ms;
    tela = { w: r.telaW, h: r.telaH };
    info = { im: r.imagens, vd: r.videos, oc: r.ocultas };
    novos.sort(function (a, b) { return b.t - a.t; });
    var igual = preserva && items.length && assinatura(novos) === assinatura(items);
    if (!igual) {
      var velhos = {};
      items.forEach(function (o) { velhos[o.u] = o; });
      novos.forEach(function (o) {
        var v = velhos[o.u];
        if (v && v.mod === o.mod) ['t' + GRID, 't' + CAPA, '_gp', '_im', '_imc'].forEach(function (k) { if (v[k]) o[k] = v[k]; });
      });
      items = novos;
      items.forEach(function (o) { o.a = album(o); });
      dupSets = []; dupFeito = false;
      if (preserva && !$('body').classList.contains('sem')) refrescaAtual();
      else { sub = null; nivel = 0; mostraAba(aba, true); }
    }
    if (!items.length) setm('Nenhuma foto ou vídeo encontrado.');
    else setm('');
    ok = true;
  } catch (e) {
    setm('Não foi possível carregar: ' + (e.message || e));
    if (!items.length) boasVindas('Não foi possível acessar a galeria. Verifique a permissão de fotos e vídeos do Lumi e tente novamente.');
  }
  carregando = false;
  ultLeitura = Date.now();
  document.body.classList.remove('lendo');
  var em = $('#m'); if (em && /^Carregando a galeria/.test(em.textContent || '')) setm('');
  fimSplash();
  diag();
  return ok;
}
/* ao voltar para o app (depois de tirar uma foto, ou de liberar a permissão), confere se algo mudou */
async function retoma() {
  if (!Galeria || retomando || carregando || atualizando || !CFG.auto) return;
  if (Date.now() - ultLeitura < 8000) return;
  if (viewerAberto() || selMode || DS) return;
  var cf = $('#cf');
  if (cf && cf.classList.contains('on')) return;
  retomando = true;
  try {
    var r = await Galeria.estado();
    if (r.permissao === 'granted' || r.permissao === 'parcial') {
      if (items.length) await ler(true, true); else await ler(true);
    }
  } catch (e) { /* tenta de novo na próxima vez */ }
  retomando = false;
}
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { retoma(); procuraAtualizacao(false); } });
document.addEventListener('resume', retoma);
window.addEventListener('focus', retoma);


/* ---------- editor de fotos: corta, gira e ajusta; salva uma CÓPIA (a original nunca é alterada) ---------- */
var ED = null, EDMIN = 48, EDMAX = 4096;
var EDRAZ = [['Livre', 0], ['Original', -1], ['1:1', 1], ['4:3', 4 / 3], ['3:4', 3 / 4], ['16:9', 16 / 9], ['9:16', 9 / 16]];
var EDFIL = [['Original', ''], ['P&B', 'grayscale(1) contrast(1.05)'], ['Vívido', 'saturate(1.45) contrast(1.08)'], ['Quente', 'sepia(.25) saturate(1.2) hue-rotate(-10deg)'], ['Frio', 'sepia(.2) hue-rotate(170deg) saturate(1.15)'], ['Sépia', 'sepia(.85)'], ['Fosco', 'contrast(.9) brightness(1.05) saturate(.85)']];
function edFiltro() {
  var e = ED, f = 'brightness(' + (1 + e.br / 200).toFixed(3) + ') contrast(' + (1 + e.ct / 200).toFixed(3) + ') saturate(' + (1 + e.sa / 100).toFixed(3) + ')';
  var p = EDFIL[e.fil][1];
  return p ? f + ' ' + p : f;
}
function edRazaoVal() {
  var e = ED, r = EDRAZ[e.raz][1];
  return r === 0 ? 0 : r === -1 ? e.base.width / e.base.height : r;
}
/* redesenha a imagem de trabalho já girada/espelhada (limitada a 4096 px no lado maior) */
function edBase(resetaCorte) {
  var e = ED, im = e.src, iw = im.naturalWidth, ih = im.naturalHeight;
  var k = Math.min(1, EDMAX / Math.max(iw, ih)), sw = Math.round(iw * k), sh = Math.round(ih * k);
  var lado = e.rot % 180 !== 0, w = lado ? sh : sw, h = lado ? sw : sh;
  e.base.width = w; e.base.height = h;
  var x = e.base.getContext('2d');
  x.save();
  x.translate(w / 2, h / 2);
  if (e.flip) x.scale(-1, 1);
  x.rotate(e.rot * Math.PI / 180);
  x.drawImage(im, -sw / 2, -sh / 2, sw, sh);
  x.restore();
  if (resetaCorte || !e.crop) e.crop = { x: 0, y: 0, w: w, h: h };
}
function edLayout() {
  var e = ED, v = $('#edv'), W = e.base.width, H = e.base.height;
  var aw = Math.max(60, v.clientWidth - 28), ah = Math.max(60, v.clientHeight - 28);
  e.sc = Math.min(aw / W, ah / H);
  var w = $('#edw');
  w.style.width = Math.round(W * e.sc) + 'px'; w.style.height = Math.round(H * e.sc) + 'px';
  edQuadro();
}
function edQuadro() {
  var c = ED.crop, k = $('#edk'), s = ED.sc;
  k.style.left = (c.x * s) + 'px'; k.style.top = (c.y * s) + 'px';
  k.style.width = (c.w * s) + 'px'; k.style.height = (c.h * s) + 'px';
}
function edRazao(h, x0, y0, x1, y1, ini, r, W, H) {
  var w = x1 - x0, hh = y1 - y0;
  if (h === 'n' || h === 's') w = hh * r; else hh = w / r;
  var ancX = h.indexOf('w') >= 0 ? 'r' : h.indexOf('e') >= 0 ? 'l' : 'c';
  var ancY = h.indexOf('n') >= 0 ? 'b' : h.indexOf('s') >= 0 ? 't' : 'c';
  var ax = ancX === 'r' ? ini.x + ini.w : ancX === 'l' ? ini.x : ini.x + ini.w / 2;
  var ay = ancY === 'b' ? ini.y + ini.h : ancY === 't' ? ini.y : ini.y + ini.h / 2;
  var mw = ancX === 'r' ? ax : ancX === 'l' ? W - ax : 2 * Math.min(ax, W - ax);
  var mh = ancY === 'b' ? ay : ancY === 't' ? H - ay : 2 * Math.min(ay, H - ay);
  var k = Math.min(1, mw / w, mh / hh); w *= k; hh *= k;
  if (!(w >= EDMIN) || !(hh >= EDMIN)) return null;
  return { x: ancX === 'r' ? ax - w : ancX === 'l' ? ax : ax - w / 2, y: ancY === 'b' ? ay - hh : ancY === 't' ? ay : ay - hh / 2, w: w, h: hh };
}
function edArrasta(h, dx, dy, ini) {
  var e = ED, W = e.base.width, H = e.base.height;
  if (h === 'move') return { x: Math.max(0, Math.min(W - ini.w, ini.x + dx)), y: Math.max(0, Math.min(H - ini.h, ini.y + dy)), w: ini.w, h: ini.h };
  var x0 = ini.x, y0 = ini.y, x1 = ini.x + ini.w, y1 = ini.y + ini.h;
  if (h.indexOf('w') >= 0) x0 = Math.max(0, Math.min(x0 + dx, x1 - EDMIN));
  if (h.indexOf('e') >= 0) x1 = Math.min(W, Math.max(x1 + dx, x0 + EDMIN));
  if (h.indexOf('n') >= 0) y0 = Math.max(0, Math.min(y0 + dy, y1 - EDMIN));
  if (h.indexOf('s') >= 0) y1 = Math.min(H, Math.max(y1 + dy, y0 + EDMIN));
  var r = edRazaoVal();
  if (!r) return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  return edRazao(h, x0, y0, x1, y1, ini, r, W, H) || ini;
}
function edChip(txt, on, fn) {
  var b = el('button', 'chp' + (on ? ' on' : ''), txt);
  b.onclick = fn;
  return b;
}
function edPainel() {
  var e = ED, p = $('#edp'), r = $('#ed');
  p.textContent = '';
  r.className = 'on t-' + e.aba;
  ['cortar', 'girar', 'ajustar', 'filtros'].forEach(function (a) { $('#edn-' + a).classList.toggle('on', a === e.aba); });
  if (e.aba === 'cortar') {
    var ln = el('div', 'edch');
    EDRAZ.forEach(function (z, k) {
      ln.appendChild(edChip(z[0], e.raz === k, function () {
        e.raz = k;
        var v = edRazaoVal();
        if (v) {
          var W = e.base.width, H = e.base.height, w = W, h = w / v;
          if (h > H) { h = H; w = h * v; }
          e.crop = { x: (W - w) / 2, y: (H - h) / 2, w: w, h: h }; e.sujo = true; edQuadro();
        }
        edPainel();
      }));
    });
    p.appendChild(ln);
    p.appendChild(el('small', 'ednt', 'Arraste os cantos ou as bordas para definir a área.'));
  } else if (e.aba === 'girar') {
    var lg = el('div', 'edch');
    lg.appendChild(edChip('↺ Girar à esquerda', false, function () { e.rot = (e.rot + 270) % 360; e.sujo = true; edBase(true); edLayout(); }));
    lg.appendChild(edChip('↻ Girar à direita', false, function () { e.rot = (e.rot + 90) % 360; e.sujo = true; edBase(true); edLayout(); }));
    lg.appendChild(edChip('⇋ Espelhar', e.flip, function () { e.flip = !e.flip; e.sujo = true; edBase(true); edLayout(); edPainel(); }));
    p.appendChild(lg);
    p.appendChild(el('small', 'ednt', 'Girar ou espelhar redefine a área de corte.'));
  } else if (e.aba === 'ajustar') {
    [['Brilho', 'br'], ['Contraste', 'ct'], ['Saturação', 'sa']].forEach(function (d) {
      var row = el('div', 'edr'), lab = el('span', 0, d[0]), inp = el('input'), out = el('output', 0, String(e[d[1]]));
      inp.type = 'range'; inp.min = '-100'; inp.max = '100'; inp.step = '1'; inp.value = String(e[d[1]]);
      inp.oninput = function () { e[d[1]] = +inp.value; out.textContent = inp.value; e.sujo = true; e.base.style.filter = edFiltro(); };
      inp.ondblclick = function () { inp.value = '0'; inp.oninput(); };
      row.appendChild(lab); row.appendChild(inp); row.appendChild(out);
      p.appendChild(row);
    });
  } else {
    var lf = el('div', 'edch');
    EDFIL.forEach(function (f, k) {
      lf.appendChild(edChip(f[0], e.fil === k, function () { e.fil = k; e.sujo = true; e.base.style.filter = edFiltro(); edPainel(); }));
    });
    p.appendChild(lf);
    p.appendChild(el('small', 'ednt', 'Os filtros são aplicados junto com os ajustes.'));
  }
}
function edMonta() {
  if ($('#ed')) return;
  var r = el('div'); r.id = 'ed';
  var top = el('div', 'edt'), bx = el('button', 'edb', 'Cancelar'), bs = el('button', 'edb ok', 'Salvar cópia');
  bx.id = 'edx'; bs.id = 'eds';
  bx.onclick = edSai; bs.onclick = edSalva;
  top.appendChild(bx); top.appendChild(el('b', 0, 'Editar foto')); top.appendChild(bs);
  var v = el('div'); v.id = 'edv';
  var w = el('div'); w.id = 'edw';
  var k = el('div'); k.id = 'edk';
  ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(function (h) { var d = el('i', 'h h-' + h); d.setAttribute('data-h', h); k.appendChild(d); });
  w.appendChild(k); v.appendChild(w);
  k.addEventListener('pointerdown', function (ev) {
    if (!ED || ED.aba !== 'cortar') return;
    var h = (ev.target && ev.target.getAttribute && ev.target.getAttribute('data-h')) || 'move';
    ED.drag = { h: h, x: ev.clientX, y: ev.clientY, id: ev.pointerId, ini: { x: ED.crop.x, y: ED.crop.y, w: ED.crop.w, h: ED.crop.h } };
    try { k.setPointerCapture(ev.pointerId); } catch (x) { /* segue sem captura */ }
    ev.preventDefault();
  });
  k.addEventListener('pointermove', function (ev) {
    var d = ED && ED.drag;
    if (!d || ev.pointerId !== d.id) return;
    ED.crop = edArrasta(d.h, (ev.clientX - d.x) / ED.sc, (ev.clientY - d.y) / ED.sc, d.ini);
    ED.sujo = true; edQuadro();
    ev.preventDefault();
  });
  function fimArrasto(ev) { if (ED && ED.drag && ev.pointerId === ED.drag.id) ED.drag = null; }
  k.addEventListener('pointerup', fimArrasto); k.addEventListener('pointercancel', fimArrasto);
  var pn = el('div'); pn.id = 'edp';
  var nv = el('div'); nv.id = 'edn';
  [['cortar', 'Cortar', 'ecorte'], ['girar', 'Girar', 'egira'], ['ajustar', 'Ajustar', 'eajusta'], ['filtros', 'Filtros', 'efiltro']].forEach(function (a) {
    var b = el('button'); b.id = 'edn-' + a[0];
    var ic = el('span'); ic.innerHTML = ico(a[2]);
    b.appendChild(ic); b.appendChild(el('span', 0, a[1]));
    b.onclick = function () { if (ED) { ED.aba = a[0]; edPainel(); } };
    nv.appendChild(b);
  });
  r.appendChild(top); r.appendChild(v); r.appendChild(pn); r.appendChild(nv);
  document.body.appendChild(r);
  window.addEventListener('resize', function () { if (ED) edLayout(); });
}
function abreEditor(i) {
  if (ED || !i || i.v) return;
  var im = $('#vim');
  var src = im && (im.currentSrc || im.getAttribute('src'));
  if (!src || !im.complete || !im.naturalWidth) { setm('Aguarde o carregamento da foto para editar.'); return; }
  var temFiltro = false;
  try { temFiltro = 'filter' in document.createElement('canvas').getContext('2d'); } catch (x) { /* sem filtro */ }
  var carga = new Image();
  setm('Abrindo editor…');
  carga.onload = function () {
    setm('');
    edMonta();
    var base = document.createElement('canvas'); base.id = 'edc';
    var w = $('#edw'), velho = $('#edc');
    if (velho) w.removeChild(velho);
    w.insertBefore(base, $('#edk'));
    ED = { it: i, src: carga, rot: 0, flip: false, br: 0, ct: 0, sa: 0, fil: 0, aba: 'cortar', raz: 0, crop: null, base: base, sc: 1, sujo: false, salvando: false, drag: null, temFiltro: temFiltro };
    edBase(true);
    base.style.filter = '';
    $('#edn-ajustar').style.display = temFiltro ? '' : 'none';
    $('#edn-filtros').style.display = temFiltro ? '' : 'none';
    var bs = $('#eds'); bs.disabled = false; bs.textContent = 'Salvar cópia';
    $('#ed').className = 'on t-cortar';
    edPainel();
    raf(edLayout);
  };
  carga.onerror = function () { setm('Não foi possível abrir esta foto no editor.'); };
  carga.src = src;
}
function edFecha() {
  var e = ED;
  ED = null;
  var r = $('#ed'); if (r) r.className = '';
  if (e && e.base) { e.base.width = 1; e.base.height = 1; }
}
async function edSai() {
  if (!ED || ED.salvando) return;
  if (ED.sujo) {
    var sim = await confirma('Descartar edições?', 'As alterações não salvas serão perdidas. A foto original não é modificada.', 'Descartar');
    if (!sim) return;
  }
  edFecha();
}
function edNome() {
  var d = new Date();
  function z(n) { return (n < 10 ? '0' : '') + n; }
  return 'Lumi-' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()) + '.jpg';
}
async function edSalva() {
  var e = ED;
  if (!e || e.salvando) return;
  if (!e.sujo) { setm('Nenhuma alteração para salvar.'); return; }
  e.salvando = true;
  var b = $('#eds'); b.disabled = true; b.textContent = 'Salvando…';
  try {
    var c = e.crop, out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(c.w)); out.height = Math.max(1, Math.round(c.h));
    var x = out.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, out.width, out.height);
    if (e.temFiltro) x.filter = edFiltro();
    x.drawImage(e.base, Math.round(c.x), Math.round(c.y), out.width, out.height, 0, 0, out.width, out.height);
    var url = out.toDataURL('image/jpeg', 0.92);
    var b64 = url.slice(url.indexOf(',') + 1);
    out.width = 1; out.height = 1;
    if (b64.length < 200) throw new Error('não foi possível gerar a imagem');
    var r = await comLimite(Galeria.salvarFoto({ base64: b64, nome: edNome(), data: Math.round((e.it.t || 0) * 1000) }), 60000);
    edFecha();
    setm('Cópia salva em ' + ((r && r.pasta) || 'Pictures/Lumi') + '. A foto original não foi alterada.');
    ultLeitura = 0; ler(true, true);
  } catch (err) {
    e.salvando = false; b.disabled = false; b.textContent = 'Salvar cópia';
    setm('Não foi possível salvar: ' + (err.message || err));
  }
}

/* ---------- atualização do app (só consulta a página de versões no GitHub; nada seu é enviado) ---------- */
var REPO = (function () {
  var e = $('#dx'), r = e ? (e.getAttribute('data-repo') || '').trim() : '';
  return /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(r) ? r : '';
})();
var UPDK = 'lumi.upd';
function instalada() { var e = $('#dx'), v = e ? (e.getAttribute('data-versao') || '').trim() : ''; return v.indexOf('__') < 0 ? v : ''; }
function versaoNum(v) { var m = /(\d+)\.(\d+)(?:\.(\d+))?/.exec(String(v || '')); return m ? [+m[1], +m[2], +(m[3] || 0)] : null; }
function maisNova(a, b) { for (var i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]; return false; }
function lerUpd() { try { return JSON.parse(localStorage.getItem(UPDK) || '{}') || {}; } catch (e) { return {}; } }
function salvaUpd(o) { try { localStorage.setItem(UPDK, JSON.stringify(o)); } catch (e) { /* sem armazenamento */ } }
function textoUpd() {
  if (!REPO) return 'Ainda não configurada (falta repoPublico em version.properties)';
  var st = lerUpd();
  return 'Instalada: Lumi ' + (instalada() || 'em teste') + (st.t ? ' · conferido às ' + new Date(st.t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
}
async function buscaVersao() {
  var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var t = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
  try {
    var r = await fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' }, signal: ctl ? ctl.signal : undefined }); /* rede-ok */
    if (!r.ok) throw new Error(r.status === 404 ? 'nenhuma versão publicada ainda' : 'erro ' + r.status);
    var j = await r.json(), v = versaoNum(j.tag_name || j.name);
    if (!v) throw new Error('versão ilegível');
    var apk = (j.assets || []).filter(function (a) { return /\.apk$/i.test(a.name || ''); })[0];
    return { v: v, txt: v.join('.'), url: apk ? apk.browser_download_url : j.html_url };
  } finally { clearTimeout(t); }
}
async function abreLink(u) {
  if (!/^https:\/\/github\.com\//.test(u || '')) { setm('Endereço de download inválido.'); return; }
  try { if (Galeria && Galeria.abrirLink) { await Galeria.abrirLink({ url: u }); return; } } catch (e) { /* tenta o jeito simples */ }
  try { window.open(u, '_blank'); } catch (e) { setm('Não foi possível abrir o download.'); }
}
/* tela que trava o app enquanto houver versão nova (só some depois de instalar a atualização) */
var forcaUrl = '', forcaT = 0, forcaTeste = false;
function mostraForca(n, atual, teste) {
  forcaUrl = n.url; forcaTeste = !!teste;
  var f = $('#upd');
  if (!f) {
    f = el('div'); f.id = 'upd';
    f.appendChild(anel());
    f.appendChild(el('h2', 0, 'Atualização obrigatória'));
    f.appendChild(el('p', 0, ''));
    var b = el('button', 'big pri', 'Atualizar agora');
    b.onclick = function () { if (forcaTeste) setm('Prévia: aqui o download da nova versão abriria no navegador.'); else abreLink(forcaUrl); };
    var c = el('button', 'big sec2', 'Verificar novamente');
    c.onclick = function () { if (forcaTeste) { setm('Prévia: aqui o app conferiria se a nova versão já foi instalada.'); return; } c.textContent = 'Verificando…'; procuraAtualizacao(true).then(function () { c.textContent = 'Verificar novamente'; }); };
    var fx = el('button', 'big sec2 fx', 'Fechar a prévia');
    fx.onclick = function () { tiraForca(); };
    f.appendChild(b); f.appendChild(c); f.appendChild(fx);
    f.appendChild(el('small', 0, 'O download será aberto no navegador. Ao concluir, abra o arquivo e confirme a instalação. Suas fotos e favoritos são preservados.'));
    document.body.appendChild(f);
  }
  f.querySelector('p').textContent = 'Está disponível a versão ' + n.txt + ' do Lumi (instalada: ' + atual.join('.') + '). Atualize para continuar usando o aplicativo.';
  f.classList.toggle('teste', !!teste);
  document.body.classList.add('forca');
  setm('');
  var cf = $('#cf'); if (cf) cf.classList.remove('on');
  if (viewerAberto() && typeof fechaV === 'function') { try { fechaV(); } catch (e) { /* segue */ } }
}
function tiraForca() { document.body.classList.remove('forca'); forcaTeste = false; }
/* se uma versão obrigatória já foi vista e ainda não foi instalada, a tela volta na hora, mesmo sem internet */
function checaExigida() {
  var atual = versaoNum(instalada()), st = lerUpd(), ex = versaoNum(st.exige);
  if (!REPO || !atual || !ex) return;
  if (maisNova(ex, atual)) mostraForca({ txt: st.exige, url: st.url || '' }, atual);
  else if (st.exige) { delete st.exige; delete st.url; salvaUpd(st); }
}
async function procuraAtualizacao(manual) {
  if (!REPO) { if (manual) setm('Atualizações indisponíveis nesta versão.'); return; }
  var atual = versaoNum(instalada());
  if (!atual) { if (manual) setm('Versão de teste: não é possível verificar atualizações.'); return; }
  if (!manual && Date.now() - forcaT < 20000) return;
  forcaT = Date.now();
  var st = lerUpd();
  if (manual) setm('Verificando atualizações…');
  try {
    var n = await buscaVersao();
    st.t = Date.now();
    if (maisNova(n.v, atual)) {
      st.exige = n.txt; st.url = n.url; salvaUpd(st);
      mostraForca(n, atual);
      if (manual) setm('');
      return;
    }
    delete st.exige; delete st.url; salvaUpd(st);
    tiraForca();
    if (manual) setm('O Lumi já está na versão mais recente (' + atual.join('.') + ').');
  } catch (e) {
    /* sem internet ou GitHub fora do ar: o app segue normal (a menos que uma versão obrigatória já tenha sido vista) */
    logd('atualização: ' + (e.message || e));
    if (manual) setm('Não foi possível verificar: ' + (e.message || e));
  }
}
async function iniciar() {
  setTimeout(fimSplash, 6000);
  checaExigida();
  procuraAtualizacao(false);
  if (!Galeria) { boasVindas('Recurso indisponível neste aparelho.'); diag(); return; }
  try {
    var r = await Galeria.estado();
    if (r.permissao === 'granted' || r.permissao === 'parcial') { ler(); return; }
  } catch (e) { /* segue para a tela de boas-vindas */ }
  boasVindas();
  diag();
}
iniciar();
/* sem seleção nem cópia de texto (só os campos de digitar continuam normais) */
(function () {
  function campo(t) { return t && t.closest && t.closest('input,textarea'); }
  document.addEventListener('contextmenu', function (e) { if (!campo(e.target)) e.preventDefault(); }, true);
  document.addEventListener('selectstart', function (e) { if (!campo(e.target)) e.preventDefault(); }, true);
  document.addEventListener('copy', function (e) { if (!campo(e.target)) e.preventDefault(); }, true);
  document.addEventListener('cut', function (e) { if (!campo(e.target)) e.preventDefault(); }, true);
})();
