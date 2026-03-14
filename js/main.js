// Banco em memória
const db = {
  hqs: [],
  _nextId: 1,

  getAllHqs() {
    return this.hqs;
  },

  // Adiciona e devolve a criada. Nova HQ fica no início da lista (primeira da lista).
  addHq(hq) {
    const nova = { id: this._nextId++, ...hq, createdAt: new Date().toISOString() };
    this.hqs.unshift(nova);
    return nova;
  },

  getHqById(id) {
    return this.hqs.find(hq => hq.id === Number(id));
  },

  // retorna false se não existir
  removeHq(id) {
    const index = this.hqs.findIndex(hq => hq.id === Number(id));
    if (index === -1) return false;
    this.hqs.splice(index, 1);
    return true;
  },

  updateHq(id, data) {
    const hq = this.getHqById(id);
    if (!hq) return false;
    Object.keys(data).forEach(function (key) {
      if (data[key] !== undefined) hq[key] = data[key];
    });
    return true;
  },

  clearHqs() {
    this.hqs = [];
  }
};

// Dados das HQs default (últimas 4 na ordem: id 6=Wonder Woman, 7=Amazing Fantasy, 8=Captain America, 9=Spider-Man #316)
const hqsIniciais = [
  {
    titulo: 'Fantastic Four #1',
    descricao: 'Primeira aparição do Quarteto Fantástico. Reed, Sue, Ben e Johnny ganham poderes em uma missão espacial.',
    anoPublicacao: 1961,
    roteirista: 'Stan Lee',
    desenhista: 'Jack Kirby',
    imagemCaminho: 'assets/images/hqs/fantastic-four.webp'
  },
  {
    titulo: 'Demolidor: O Homem Sem Medo',
    descricao: 'Matt Murdock, o Demolidor, combate o crime em Hell\'s Kitchen com seus sentidos apurados.',
    anoPublicacao: 1979,
    roteirista: 'Frank Miller',
    desenhista: 'Frank Miller',
    imagemCaminho: 'assets/images/hqs/demolidor-o-homem-sem-medo.jpeg'
  },
  {
    titulo: 'Journey Into Mystery #83',
    descricao: 'Primeira aparição do Thor. O deus nórdico é banido para a Terra e adota a identidade do médico Donald Blake.',
    anoPublicacao: 1962,
    roteirista: 'Stan Lee',
    desenhista: 'Jack Kirby',
    imagemCaminho: 'assets/images/hqs/journey-into-mystery-83-thor.jpg'
  },
  {
    titulo: 'Tales of Suspense #39',
    descricao: 'Primeira aparição do Homem de Ferro. Tony Stark cria a armadura para escapar de seus captores.',
    anoPublicacao: 1963,
    roteirista: 'Stan Lee',
    desenhista: 'Don Heck',
    imagemCaminho: 'assets/images/hqs/tales-of-suspense-iron-man.jpeg'
  },
  {
    titulo: 'Detective Comics #27',
    descricao: 'Primeira aparição do Batman. Bruce Wayne estreia como o Cavaleiro das Trevas em Gotham City.',
    anoPublicacao: 1939,
    roteirista: 'Bill Finger',
    desenhista: 'Bob Kane',
    imagemCaminho: 'assets/images/hqs/detective-comic-27.webp'
  },
  // Ordem ao preencher: id 6, 7, 8, 9
  {
    titulo: 'Sensation Comics / Wonder Woman',
    descricao: 'Primeira aparição da Mulher-Maravilha. Diana de Themyscira entra no mundo dos homens.',
    anoPublicacao: 1941,
    roteirista: 'William Moulton Marston',
    desenhista: 'H.G. Peter',
    imagemCaminho: 'assets/images/hqs/sensation_comics_wonder_woman.jpg'
  },
  {
    titulo: 'Amazing Fantasy #15',
    descricao: 'Primeira aparição do Homem-Aranha. Peter Parker ganha seus poderes após a picada de uma aranha radioativa.',
    anoPublicacao: 1962,
    roteirista: 'Stan Lee',
    desenhista: 'Steve Ditko',
    imagemCaminho: 'assets/images/hqs/amazing-fantasy-15.jpg'
  },
  {
    titulo: 'Captain America #1',
    descricao: 'Primeira aparição do Capitão América. Steve Rogers enfrenta os nazistas na Segunda Guerra Mundial.',
    anoPublicacao: 1941,
    roteirista: 'Joe Simon',
    desenhista: 'Jack Kirby',
    imagemCaminho: 'assets/images/hqs/captain-america-1-1941.jpeg'
  },
  {
    titulo: 'The Amazing Spider-Man #316',
    descricao: 'O Nascimento de Venom. Eddie Brock e o simbionte se unem para enfrentar o Homem-Aranha.',
    anoPublicacao: 1988,
    roteirista: 'David Michelinie',
    desenhista: 'Todd McFarlane',
    imagemCaminho: 'assets/images/hqs/the-amazing-spiderman-316-o-nascimento-de-venom-1988.webp'
  }
];

// Converte arquivo em base64 para salvar no banco
function arquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
}

// Converte URL da imagem em base64 (data URL)
function urlParaBase64(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
}

// Preenche o banco com as 3 HQs iniciais; só roda se o banco estiver vazio
async function initHqsIniciais() {
  if (db.getAllHqs().length > 0) return;
  for (const hq of hqsIniciais) {
    const imagem = await urlParaBase64(hq.imagemCaminho).catch(() => '');
    db.addHq({
      titulo: hq.titulo,
      descricao: hq.descricao,
      anoPublicacao: hq.anoPublicacao,
      roteirista: hq.roteirista || '',
      desenhista: hq.desenhista || '',
      imagem
    });
  }
}

// Retorna as últimas N HQs (por id/ordem de inclusão; até 6 para o painel)
function getUltimasHqs(n) {
  var todas = db.getAllHqs();
  return todas.slice(0, n || 6);
}

// Retorna top 3 roteiristas (mais HQs)
function getTop3Roteiristas() {
  var todas = db.getAllHqs();
  var contagem = {};
  todas.forEach(function (hq) {
    var r = (hq.roteirista || '').trim();
    if (r) contagem[r] = (contagem[r] || 0) + 1;
  });
  return Object.entries(contagem)
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, 3)
    .map(function (e) { return e[0]; });
}

// Retorna top 3 desenhistas (mais HQs)
function getTop3Desenhistas() {
  var todas = db.getAllHqs();
  var contagem = {};
  todas.forEach(function (hq) {
    var d = (hq.desenhista || '').trim();
    if (d) contagem[d] = (contagem[d] || 0) + 1;
  });
  return Object.entries(contagem)
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, 3)
    .map(function (e) { return e[0]; });
}

// Atualiza todos os blocos do painel inicial
function atualizaPainelInicial() {
  var elUltimas = document.getElementById('lista-ultimas-hqs');
  var elUltimasMais = document.getElementById('lista-ultimas-hqs-mais');
  var elVerMaisCtn = document.getElementById('ultimas-ver-mais-ctn');
  var elVerMaisBtn = document.getElementById('ultimas-ver-mais-btn');
  if (elUltimas) {
    var todasUltimas = getUltimasHqs(6);
    var primeiras3 = todasUltimas.slice(0, 3);
    var proximas3 = todasUltimas.slice(3, 6);
    elUltimas.innerHTML = primeiras3.map(function (hq) {
      return '<li>' + escapeHtml(hq.titulo) + ' – ' + (hq.anoPublicacao || '') + '</li>';
    }).join('');
    if (primeiras3.length === 0) elUltimas.innerHTML = '<li class="text-muted">Nenhuma HQ cadastrada.</li>';
    if (elUltimasMais) {
      elUltimasMais.innerHTML = proximas3.map(function (hq) {
        return '<li>' + escapeHtml(hq.titulo) + ' – ' + (hq.anoPublicacao || '') + '</li>';
      }).join('');
    }
    if (elVerMaisCtn && elVerMaisBtn) {
      if (proximas3.length > 0) {
        elVerMaisCtn.classList.remove('d-none');
        elVerMaisBtn.textContent = 'Ver mais';
        var collapseEl = document.getElementById('ultimas-hqs-collapse');
        if (collapseEl && window.bootstrap) {
          var col = bootstrap.Collapse.getInstance(collapseEl);
          if (col) col.hide();
        }
      } else {
        elVerMaisCtn.classList.add('d-none');
      }
    }
  }

  var elRoteiristas = document.getElementById('lista-top-roteiristas');
  if (elRoteiristas) {
    var roteiristas = getTop3Roteiristas();
    elRoteiristas.innerHTML = roteiristas.map(function (nome) {
      return '<li>' + escapeHtml(nome) + '</li>';
    }).join('');
    if (roteiristas.length === 0) elRoteiristas.innerHTML = '<li class="text-muted">Nenhum dado.</li>';
  }

  var elDesenhistas = document.getElementById('lista-top-desenhistas');
  if (elDesenhistas) {
    var desenhistas = getTop3Desenhistas();
    elDesenhistas.innerHTML = desenhistas.map(function (nome) {
      return '<li>' + escapeHtml(nome) + '</li>';
    }).join('');
    if (desenhistas.length === 0) elDesenhistas.innerHTML = '<li class="text-muted">Nenhum dado.</li>';
  }
}

function escapeHtml(texto) {
  if (!texto) return '';
  var div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// --- Acervo: filtros, grade e paginação (10 por página) ---

var ACERVO_POR_PAGINA = 4;
var ACERVO_ANO_FALLBACK = 1930;
var acervoEstado = {
  paginaAtual: 1,
  filtros: { busca: '', roteirista: '', desenhista: '', anoMin: ACERVO_ANO_FALLBACK }
};

function getAnoMinAcervo() {
  var hqs = db.getAllHqs();
  var anos = hqs.map(function (hq) { return hq.anoPublicacao; }).filter(function (a) { return a != null && !isNaN(parseInt(a, 10)); });
  if (anos.length === 0) return ACERVO_ANO_FALLBACK;
  return Math.min.apply(null, anos);
}

function getAnoMaxAcervo() {
  return new Date().getFullYear();
}

function syncRangeAnoBounds() {
  var anoEl = document.getElementById('acervo-ano');
  var anoValorSpan = document.getElementById('acervo-ano-valor');
  if (!anoEl) return;
  var anoMin = getAnoMinAcervo();
  var anoMax = getAnoMaxAcervo();
  anoEl.setAttribute('min', anoMin);
  anoEl.setAttribute('max', anoMax);
  var val = parseInt(anoEl.value, 10);
  if (!isNaN(val)) {
    if (val < anoMin) anoEl.value = anoMin;
    else if (val > anoMax) anoEl.value = anoMax;
  } else {
    anoEl.value = anoMin;
  }
  if (anoValorSpan) anoValorSpan.textContent = anoEl.value;
}
var modalHqIdAtual = null;
var IMAGEM_SEM_CAPA = 'assets/images/hqs/sem-capa.jpg';

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getOpcoesRoteiristas() {
  var hqs = db.getAllHqs();
  var set = new Set();
  hqs.forEach(function (hq) {
    var r = (hq.roteirista || '').trim();
    if (r) set.add(r);
  });
  return Array.from(set).sort();
}

function getOpcoesDesenhistas() {
  var hqs = db.getAllHqs();
  var set = new Set();
  hqs.forEach(function (hq) {
    var d = (hq.desenhista || '').trim();
    if (d) set.add(d);
  });
  return Array.from(set).sort();
}

function filtrarHqs(filtros) {
  var lista = db.getAllHqs();

  var busca = (filtros.busca || '').trim();
  if (busca) {
    var regex = new RegExp(escapeRegex(busca), 'i');
    lista = lista.filter(function (hq) {
      return regex.test(hq.titulo || '') || regex.test(hq.descricao || '');
    });
  }

  if (filtros.roteirista) {
    lista = lista.filter(function (hq) { return (hq.roteirista || '').trim() === filtros.roteirista; });
  }
  if (filtros.desenhista) {
    lista = lista.filter(function (hq) { return (hq.desenhista || '').trim() === filtros.desenhista; });
  }

  var anoMin = parseInt(filtros.anoMin, 10);
  if (!isNaN(anoMin)) {
    lista = lista.filter(function (hq) { return (hq.anoPublicacao || 0) >= anoMin; });
  }

  return lista;
}

function paginar(lista, pagina, porPagina) {
  var total = lista.length;
  var totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  var pagAtual = Math.max(1, Math.min(pagina, totalPaginas));
  var inicio = (pagAtual - 1) * porPagina;
  var itens = lista.slice(inicio, inicio + porPagina);
  return { itens: itens, totalPaginas: totalPaginas, paginaAtual: pagAtual, total: total };
}

function renderizarFiltrosAcervo() {
  var selR = document.getElementById('acervo-roteirista');
  var selD = document.getElementById('acervo-desenhista');
  if (!selR || !selD) return;

  var valorR = selR.value;
  var valorD = selD.value;

  selR.innerHTML = '<option value="">Todos</option>';
  getOpcoesRoteiristas().forEach(function (r) {
    var opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r;
    if (r === valorR) opt.selected = true;
    selR.appendChild(opt);
  });

  selD.innerHTML = '<option value="">Todos</option>';
  getOpcoesDesenhistas().forEach(function (d) {
    var opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    if (d === valorD) opt.selected = true;
    selD.appendChild(opt);
  });
}

function renderizarCardsAcervo(hqs) {
  var container = document.getElementById('acervo-cards');
  if (!container) return;
  container.innerHTML = '';
  container.classList.remove('acervo-vazio');

  if (!hqs || hqs.length === 0) {
    container.classList.add('acervo-vazio');
    var col = document.createElement('div');
    col.className = 'col-12 acervo-nenhum-resultado';
    col.textContent = 'Nenhum resultado encontrado.';
    container.appendChild(col);
    return;
  }

  hqs.forEach(function (hq) {
    var col = document.createElement('div');
    col.className = 'col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2';
    var card = document.createElement('div');
    card.className = 'card h-100 cartao-hq';

    var img = document.createElement('img');
    img.className = 'card-img-top cartao-hq__img';
    img.alt = escapeHtml(hq.titulo);
    img.src = hq.imagem || '';
    img.style.backgroundColor = '#f7f8fa';
    card.appendChild(img);

    var body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';
    var roteiristaDesenhista = [hq.roteirista, hq.desenhista].filter(Boolean).join(' • ') || '—';
    body.innerHTML =
      '<h6 class="card-title cartao-hq__titulo">' + escapeHtml(hq.titulo) + '</h6>' +
      '<p class="card-text text-muted cartao-hq__texto mb-1">' + escapeHtml(hq.anoPublicacao) + '</p>' +
      '<p class="card-text text-muted cartao-hq__texto mb-2">' + escapeHtml(roteiristaDesenhista) + '</p>' +
      '<div class="mt-auto text-end">' +
      '<button class="btn btn-outline-primary btn-sm btn-detalhes-hq" type="button" data-hq-id="' + hq.id + '">Detalhes</button>' +
      '</div>';
    card.appendChild(body);

    col.appendChild(card);
    container.appendChild(col);
  });
}

function renderizarPaginacaoAcervo(totalPaginas, paginaAtual) {
  var nav = document.getElementById('acervo-paginacao');
  if (!nav) return;
  nav.innerHTML = '';

  var ul = document.createElement('ul');
  ul.className = 'pagination pagination-sm mb-0';

  for (var i = 1; i <= totalPaginas; i++) {
    var li = document.createElement('li');
    li.className = 'page-item' + (i === paginaAtual ? ' active' : '');
    var a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = i;
    a.setAttribute('data-pagina', i);
    if (totalPaginas > 1) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var p = parseInt(this.getAttribute('data-pagina'), 10);
        if (!isNaN(p)) {
          acervoEstado.paginaAtual = p;
          atualizarAcervo();
        }
      });
    } else {
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
    li.appendChild(a);
    ul.appendChild(li);
  }

  nav.appendChild(ul);
}

var ACERVO_LOADING_MS = 500;

function mostrarLoadingAcervo() {
  var container = document.getElementById('acervo-cards');
  var nav = document.getElementById('acervo-paginacao');
  if (container) {
    container.innerHTML = '<div class="col-12 d-flex flex-column align-items-center justify-content-center py-5 acervo-loading"><div class="spinner-border" role="status" style="width: 3rem; height: 3rem;"><span class="visually-hidden">Carregando...</span></div><p class="mt-2 mb-0 text-muted">Carregando...</p></div>';
    container.classList.remove('acervo-vazio');
  }
  if (nav) nav.innerHTML = '';
}

function atualizarAcervo() {
  mostrarLoadingAcervo();
  setTimeout(function () {
    syncRangeAnoBounds();
    var lista = filtrarHqs(acervoEstado.filtros);
    var resultado = paginar(lista, acervoEstado.paginaAtual, ACERVO_POR_PAGINA);

    acervoEstado.paginaAtual = resultado.paginaAtual;
    var elContagem = document.getElementById('acervo-itens-encontrados');
    if (elContagem) {
      var n = lista.length;
      elContagem.textContent = n === 0 ? 'Nenhum resultado encontrado' : (n === 1 ? '1 item encontrado' : n + ' itens encontrados');
    }
    renderizarCardsAcervo(resultado.itens);
    renderizarPaginacaoAcervo(resultado.totalPaginas, resultado.paginaAtual);
  }, ACERVO_LOADING_MS);
}

function initAcervo() {
  renderizarFiltrosAcervo();
  syncRangeAnoBounds();
  var anoEl = document.getElementById('acervo-ano');
  acervoEstado.filtros.busca = (document.getElementById('acervo-busca') && document.getElementById('acervo-busca').value) || '';
  acervoEstado.filtros.roteirista = (document.getElementById('acervo-roteirista') && document.getElementById('acervo-roteirista').value) || '';
  acervoEstado.filtros.desenhista = (document.getElementById('acervo-desenhista') && document.getElementById('acervo-desenhista').value) || '';
  acervoEstado.filtros.anoMin = (anoEl && !isNaN(parseInt(anoEl.value, 10))) ? parseInt(anoEl.value, 10) : getAnoMinAcervo();
  acervoEstado.paginaAtual = 1;
  atualizarAcervo();
}

function bindAcervoEventos() {
  var busca = document.getElementById('acervo-busca');
  var selR = document.getElementById('acervo-roteirista');
  var selD = document.getElementById('acervo-desenhista');
  var anoRange = document.getElementById('acervo-ano');
  var anoValor = document.getElementById('acervo-ano-valor');

  function aplicarFiltros() {
    acervoEstado.filtros.busca = (busca && busca.value) ? busca.value.trim() : '';
    acervoEstado.filtros.roteirista = (selR && selR.value) || '';
    acervoEstado.filtros.desenhista = (selD && selD.value) || '';
    acervoEstado.filtros.anoMin = (anoRange && !isNaN(parseInt(anoRange.value, 10))) ? parseInt(anoRange.value, 10) : getAnoMinAcervo();
    acervoEstado.paginaAtual = 1;
    if (anoValor && anoRange) anoValor.textContent = anoRange.value;
    atualizarAcervo();
  }

  if (busca) busca.addEventListener('input', aplicarFiltros);
  if (selR) selR.addEventListener('change', aplicarFiltros);
  if (selD) selD.addEventListener('change', aplicarFiltros);
  if (anoRange) {
    anoRange.addEventListener('input', aplicarFiltros);
    anoRange.addEventListener('change', aplicarFiltros);
  }

  var containerCards = document.getElementById('acervo-cards');
  if (containerCards) {
    containerCards.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-detalhes-hq');
      if (!btn) return;
      var id = btn.getAttribute('data-hq-id');
      if (id) abrirModalDetalhes(id);
    });
  }
}

// --- Modal detalhes/edição HQ ---

function getFormModalCampos() {
  return {
    titulo: document.getElementById('modal-hq-titulo'),
    descricao: document.getElementById('modal-hq-descricao'),
    ano: document.getElementById('modal-hq-ano'),
    roteirista: document.getElementById('modal-hq-roteirista'),
    desenhista: document.getElementById('modal-hq-desenhista'),
    imagem: document.getElementById('modal-hq-imagem'),
    imagemFile: document.getElementById('modal-hq-imagem-file'),
    digital: document.getElementById('modal-hq-digital')
  };
}

function preencherFormModal(hq) {
  var c = getFormModalCampos();
  var semCapa = IMAGEM_SEM_CAPA;
  if (!hq) {
    if (c.titulo) c.titulo.value = '';
    if (c.descricao) c.descricao.value = '';
    if (c.ano) c.ano.value = '';
    if (c.roteirista) c.roteirista.value = '';
    if (c.desenhista) c.desenhista.value = '';
    if (c.imagem) {
      c.imagem.src = semCapa;
      c.imagem.alt = 'Sem capa';
    }
    if (c.imagemFile) c.imagemFile.value = '';
    if (c.digital) c.digital.checked = false;
    return;
  }
  if (c.titulo) c.titulo.value = hq.titulo || '';
  if (c.descricao) c.descricao.value = hq.descricao || '';
  if (c.ano) c.ano.value = hq.anoPublicacao || '';
  if (c.roteirista) c.roteirista.value = hq.roteirista || '';
  if (c.desenhista) c.desenhista.value = hq.desenhista || '';
  if (c.imagem) {
    c.imagem.src = hq.imagem || semCapa;
    c.imagem.alt = escapeHtml(hq.titulo || '');
  }
  if (c.imagemFile) c.imagemFile.value = '';
}

function setModalModoLeitura(leitura) {
  var c = getFormModalCampos();
  var readonly = !!leitura;
  [c.titulo, c.descricao, c.ano, c.roteirista, c.desenhista].forEach(function (el) {
    if (el) el.readOnly = readonly;
  });
  if (c.digital) c.digital.disabled = readonly;
  if (c.imagem) {
    c.imagem.classList.toggle('capa-editavel', !readonly);
  }
  document.getElementById('modal-hq-botoes-leitura').classList.toggle('d-none', !readonly);
  document.getElementById('modal-hq-botoes-edicao').classList.toggle('d-none', readonly);
  var btnExcluir = document.getElementById('modal-hq-btn-excluir');
  if (btnExcluir) btnExcluir.classList.toggle('d-none', readonly || modalHqIdAtual == null);
  var label = document.getElementById('modal-hq-label');
  if (label) {
    if (readonly) label.textContent = 'Detalhes da HQ';
    else label.textContent = modalHqIdAtual == null ? 'Adicionar HQ' : 'Editar HQ';
  }
}

function abrirModalDetalhes(id) {
  var hq = db.getHqById(id);
  if (!hq) return;
  modalHqIdAtual = hq.id;
  preencherFormModal(hq);
  setModalModoLeitura(true);
  var modalEl = document.getElementById('modal-hq');
  if (modalEl && window.bootstrap) {
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function abrirModalAdicionar() {
  modalHqIdAtual = null;
  preencherFormModal(null);
  setModalModoLeitura(false);
  var modalEl = document.getElementById('modal-hq');
  if (modalEl && window.bootstrap) {
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function obterDadosFormModal() {
  var c = getFormModalCampos();
  return {
    titulo: (c.titulo && c.titulo.value) ? c.titulo.value.trim() : '',
    descricao: (c.descricao && c.descricao.value) ? c.descricao.value.trim() : '',
    anoPublicacao: (c.ano && c.ano.value) ? parseInt(c.ano.value, 10) : null,
    roteirista: (c.roteirista && c.roteirista.value) ? c.roteirista.value.trim() : '',
    desenhista: (c.desenhista && c.desenhista.value) ? c.desenhista.value.trim() : ''
  };
}

function validarFormModal() {
  var c = getFormModalCampos();
  var valido = true;
  [c.titulo, c.descricao, c.ano, c.roteirista, c.desenhista].forEach(function (el) {
    if (!el) return;
    var preenchido = el.value != null && String(el.value).trim() !== '';
    if (!preenchido) {
      el.classList.add('is-invalid');
      valido = false;
    } else {
      el.classList.remove('is-invalid');
    }
  });
  return valido;
}

function bindModalHqEventos() {
  var btnEditar = document.getElementById('modal-hq-btn-editar');
  var btnCancelar = document.getElementById('modal-hq-btn-cancelar');
  var btnExcluir = document.getElementById('modal-hq-btn-excluir');
  var btnSalvar = document.getElementById('modal-hq-btn-salvar');
  var imgCapa = document.getElementById('modal-hq-imagem');
  var inputFile = document.getElementById('modal-hq-imagem-file');
  var botoesEdicao = document.getElementById('modal-hq-botoes-edicao');

  if (imgCapa && inputFile && botoesEdicao) {
    imgCapa.addEventListener('click', function () {
      if (!botoesEdicao.classList.contains('d-none')) {
        inputFile.click();
      }
    });
    inputFile.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file || !imgCapa) return;
      var reader = new FileReader();
      reader.onload = function () {
        imgCapa.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnEditar) {
    btnEditar.addEventListener('click', function () {
      setModalModoLeitura(false);
    });
  }
  if (btnCancelar) {
    btnCancelar.addEventListener('click', function () {
      if (modalHqIdAtual == null) {
        var modalEl = document.getElementById('modal-hq');
        if (modalEl && window.bootstrap) bootstrap.Modal.getInstance(modalEl).hide();
        return;
      }
      var hq = db.getHqById(modalHqIdAtual);
      preencherFormModal(hq);
      setModalModoLeitura(true);
    });
  }
  if (btnExcluir) {
    btnExcluir.addEventListener('click', function () {
      if (modalHqIdAtual == null) return;
      var modalConfirm = document.getElementById('modal-confirmar-exclusao');
      if (modalConfirm && window.bootstrap) bootstrap.Modal.getOrCreateInstance(modalConfirm).show();
    });
  }
  var btnConfirmarExclusao = document.getElementById('modal-confirmar-exclusao-btn');
  if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener('click', function () {
      if (modalHqIdAtual == null) return;
      var id = modalHqIdAtual;
      var modalConfirm = document.getElementById('modal-confirmar-exclusao');
      var modalHq = document.getElementById('modal-hq');
      if (modalConfirm && window.bootstrap) bootstrap.Modal.getInstance(modalConfirm).hide();
      if (modalHq && window.bootstrap) bootstrap.Modal.getInstance(modalHq).hide();
      db.removeHq(id);
      modalHqIdAtual = null;
      atualizarAcervo();
      atualizaPainelInicial();
      renderizarFiltrosAcervo();
      mostrarModalSucesso('HQ excluída com sucesso.');
    });
  }
  if (btnSalvar) {
    btnSalvar.addEventListener('click', function () {
      if (!validarFormModal()) return;
      var dados = obterDadosFormModal();
      var c = getFormModalCampos();
      function concluirSalvar(imagem) {
        dados.imagem = imagem || '';
        if (modalHqIdAtual == null) {
          db.addHq(dados);
          atualizarAcervo();
          atualizaPainelInicial();
          renderizarFiltrosAcervo();
          var modalEl = document.getElementById('modal-hq');
          if (modalEl && window.bootstrap) bootstrap.Modal.getInstance(modalEl).hide();
          mostrarModalSucesso('HQ adicionada com sucesso.');
        } else {
          salvarEdicaoHq(dados);
        }
      }
      function usarSemCapa() {
        urlParaBase64(IMAGEM_SEM_CAPA).then(concluirSalvar).catch(function () { concluirSalvar(''); });
      }
      if (c.imagemFile && c.imagemFile.files && c.imagemFile.files[0]) {
        arquivoParaBase64(c.imagemFile.files[0]).then(concluirSalvar);
      } else if (modalHqIdAtual != null) {
        var hq = db.getHqById(modalHqIdAtual);
        if (hq && hq.imagem) {
          dados.imagem = hq.imagem;
          concluirSalvar(hq.imagem);
        } else {
          usarSemCapa();
        }
      } else {
        usarSemCapa();
      }
    });
  }

  var botoesAdicionar = document.querySelectorAll('.acervo-btn-adicionar');
  botoesAdicionar.forEach(function (btn) { btn.addEventListener('click', abrirModalAdicionar); });
}

function salvarEdicaoHq(dados) {
  if (modalHqIdAtual == null) return;
  db.updateHq(modalHqIdAtual, dados);
  atualizarAcervo();
  atualizaPainelInicial();
  setModalModoLeitura(true);
  preencherFormModal(db.getHqById(modalHqIdAtual));
  mostrarModalSucesso('HQ atualizada com sucesso.');
}

function mostrarModalSucesso(mensagem) {
  var container = document.getElementById('acervo-alert-container');
  if (!container) return;
  container.innerHTML = '';
  var msg = mensagem || 'Operação realizada com sucesso.';
  var alertEl = document.createElement('div');
  alertEl.className = 'alert alert-success alert-dismissible fade show mb-0';
  alertEl.setAttribute('role', 'alert');
  alertEl.innerHTML = msg + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>';
  container.appendChild(alertEl);
  var acervoSection = document.getElementById('acervo');
  if (acervoSection) acervoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(function () {
    if (alertEl.parentNode) {
      var bsAlert = bootstrap.Alert.getOrCreateInstance(alertEl);
      if (bsAlert) bsAlert.close();
    }
  }, 5000);
}

// Alterna texto "Ver mais" / "Ver menos" no collapse das últimas HQs
function bindUltimasVerMais() {
  var collapseEl = document.getElementById('ultimas-hqs-collapse');
  var btn = document.getElementById('ultimas-ver-mais-btn');
  if (collapseEl && btn) {
    collapseEl.addEventListener('show.bs.collapse', function () { btn.textContent = 'Ver menos'; });
    collapseEl.addEventListener('hidden.bs.collapse', function () { btn.textContent = 'Ver mais'; });
  }
}

// Inicialização ao carregar a página
if (typeof window !== 'undefined') {
  initHqsIniciais().then(function () {
    atualizaPainelInicial();
    bindUltimasVerMais();
    renderizarFiltrosAcervo();
    bindAcervoEventos();
    bindModalHqEventos();
    atualizarAcervo();
  });
}
