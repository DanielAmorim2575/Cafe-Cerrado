const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const R = document.documentElement;

const get = k => {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
};

const set = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
};

/* Acessibilidade */

let fs = +(get('fs') || 100);

function setFs() {
  R.style.setProperty('--fs', fs + '%');
  set('fs', fs);
}

function setTema(t) {
  R.dataset.theme = t;
  $('#tema').textContent = t === 'dark' ? 'Modo claro' : 'Modo escuro';
  $('#tema').setAttribute('aria-pressed', t === 'dark');
  set('tema', t);
}

setTema(
  get('tema') ||
  (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
);

setFs();

$('#tema').onclick = () => {
  setTema(R.dataset.theme === 'dark' ? 'light' : 'dark');
};

$('#ma').onclick = () => {
  fs = Math.min(150, fs + 10);
  setFs();
};

$('#me').onclick = () => {
  fs = Math.max(80, fs - 10);
  setFs();
};

$('#ct').onclick = e => {
  const on = R.dataset.contrast !== 'alto';

  if (on) {
    R.dataset.contrast = 'alto';
  } else {
    delete R.dataset.contrast;
  }

  e.target.setAttribute('aria-pressed', on);
};

$('#mv').onclick = e => {
  const on = !R.hasAttribute('data-reduce');

  R.toggleAttribute('data-reduce', on);
  e.target.setAttribute('aria-pressed', on);

  if (on) stop();
};

$('#apb').onclick = e => {
  const o = $('#pa').classList.toggle('open');
  e.target.setAttribute('aria-expanded', o);
};

/* Cardápio */

const itens = [
  ['Espresso', 'cafes', 'R$ 6', 'Curto e intenso, grãos do Cerrado.'],
  ['Cappuccino', 'cafes', 'R$ 12', 'Espresso, leite vaporizado e espuma.'],
  ['Coado artesanal', 'cafes', 'R$ 9', 'Filtrado na hora, notas de caramelo.'],
  ['Brigadeiro gourmet', 'doces', 'R$ 7', 'Chocolate 50% cacau.'],
  ['Bolo de cenoura', 'doces', 'R$ 10', 'Com cobertura de chocolate.'],
  ['Pão de queijo', 'salgados', 'R$ 8', 'Receita mineira, 3 unidades.'],
  ['Misto quente', 'salgados', 'R$ 14', 'Pão artesanal, queijo e presunto.']
];

let cat = 'todos';

function render() {
  const q = $('#busca').value.toLowerCase().trim();

  const l = itens.filter(i =>
    (cat === 'todos' || i[1] === cat) &&
    (i[0] + i[3]).toLowerCase().includes(q)
  );

  $('#itens').innerHTML = l.length
    ? l.map(i => `
      <article class="card">
        <svg viewBox="0 0 120 90" aria-hidden="true">
          <use href="#xic"></use>
        </svg>
        <span class="tag">${i[1]}</span>
        <h3>${i[0]}</h3>
        <p>${i[3]}</p>
        <span class="price">${i[2]}</span>
      </article>
    `).join('')
    : '<p>Nenhum item encontrado.</p>';
}

$('#busca').oninput = render;

$$('[role="tab"]').forEach(b => {
  b.onclick = () => {
    cat = b.dataset.cat;

    $$('[role="tab"]').forEach(x => {
      x.setAttribute('aria-selected', x === b);
    });

    render();
  };
});

render();

/* Carrossel */

const S = $$('.slide');
let k = 0;
let tm = null;

S.forEach((_, i) => {
  const d = document.createElement('button');

  d.className = 'dot alt';
  d.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
  d.onclick = () => go(i);

  $('#dots').append(d);
});

function go(i) {
  k = (i + S.length) % S.length;

  S.forEach((s, j) => {
    s.classList.toggle('on', j === k);
  });

  $$('.dot').forEach((d, j) => {
    d.setAttribute('aria-current', j === k);
  });
}

function stop() {
  clearInterval(tm);
  tm = null;

  $('#pp').textContent = 'Retomar';
  $('#pp').setAttribute('aria-label', 'Retomar rotação automática');
}

function play() {
  tm = setInterval(() => go(k + 1), 5000);

  $('#pp').textContent = 'Pausar';
  $('#pp').setAttribute('aria-label', 'Pausar rotação automática');
}

$('#prev').onclick = () => go(k - 1);
$('#next').onclick = () => go(k + 1);

$('#pp').onclick = () => {
  tm ? stop() : play();
};

$('#car').addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') go(k - 1);
  if (e.key === 'ArrowRight') go(k + 1);
});

go(0);

if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
  play();
}

/* Formulários */

$('#form').onsubmit = e => {
  e.preventDefault();

  const m = $('#fmsg');

  const ok =
    $('#nome').value.trim() &&
    /^\S+@\S+\.\S+$/.test($('#email').value) &&
    $('#msg').value.trim();

  m.className = ok ? 'msg' : 'msg err';

  m.textContent = ok
    ? 'Mensagem enviada! Responderemos em até 2 dias úteis.'
    : 'Preencha nome, e-mail válido e mensagem.';

  if (ok) {
    e.target.reset();
  }
};

$('#abrirLogin').onclick = () => $('#login').showModal();

$('#fechar').onclick = () => $('#login').close();

$('#fl').onsubmit = e => {
  e.preventDefault();

  const m = $('#lmsg');

  const ok =
    /^\S+@\S+\.\S+$/.test($('#lu').value) &&
    $('#lp').value.length >= 6;

  m.className = ok ? 'msg' : 'msg err';

  m.textContent = ok
    ? 'Login simulado com sucesso. Bem-vindo(a)!'
    : 'Informe e-mail válido e senha com 6+ caracteres.';
};
