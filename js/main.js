/**
 * Central de Quadrinhos – main.js
 * Lógica do painel: banco em memória, painel inicial, acervo (filtros, busca, paginação), modal HQ e inicialização.
 */

// ========== BANCO EM MEMÓRIA ==========

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

// Dados iniciais (seed). Ordem de inclusão: primeiros 5, depois id 6–9 = Wonder Woman, Amazing Fantasy, Captain America, Spider-Man #316.
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

// ========== UTILITÁRIOS: IMAGENS E INICIALIZAÇÃO DO BANCO ==========

/** Converte File em data URL (base64) para persistir a capa no banco. */
function arquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
}

/** Converte URL da imagem (ex.: seed) em data URL. */
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

/** Preenche o banco com hqsIniciais; só executa se o banco estiver vazio. */
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

// ========== PAINEL INÍCIO (últimas HQs, tops, collapse Ver mais) ==========

/** Retorna as últimas N HQs (ordem de inclusão; usado no bloco "Últimas HQs cadastradas"). */
function getUltimasHqs(n) {
  var todas = db.getAllHqs();
  return todas.slice(0, n || 6);
}

/** Retorna os 3 roteiristas com mais HQs cadastradas. */
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

/** Retorna os 3 desenhistas com mais HQs cadastradas. */
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

/** Atualiza listas do painel inicial: últimas HQs (3 + collapse com mais 3), top roteiristas e top desenhistas. */
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

/** Escapa HTML para exibição segura em texto. */
function escapeHtml(texto) {
  if (!texto) return '';
  var div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ========== ACERVO: FILTROS, BUSCA INTELIGENTE, GRADE E PAGINAÇÃO ==========

var ACERVO_POR_PAGINA = 6;
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

/** Escapa caracteres especiais para uso em RegExp (busca segura). */
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Lista única de roteiristas do banco (para o select do filtro). */
function getOpcoesRoteiristas() {
  var hqs = db.getAllHqs();
  var set = new Set();
  hqs.forEach(function (hq) {
    var r = (hq.roteirista || '').trim();
    if (r) set.add(r);
  });
  return Array.from(set).sort();
}

/** Lista única de desenhistas do banco (para o select do filtro). */
function getOpcoesDesenhistas() {
  var hqs = db.getAllHqs();
  var set = new Set();
  hqs.forEach(function (hq) {
    var d = (hq.desenhista || '').trim();
    if (d) set.add(d);
  });
  return Array.from(set).sort();
}

/** Campos de texto da HQ em que a busca inteligente procura (todos os campos textuais do banco). */
var CAMPOS_BUSCA_HQ = ['titulo', 'descricao', 'roteirista', 'desenhista'];

/** Aplica filtros (busca em todos os campos de texto, roteirista, desenhista, ano mín.) e retorna a lista filtrada. */
function filtrarHqs(filtros) {
  var lista = db.getAllHqs();

  var busca = (filtros.busca || '').trim();
  if (busca) {
    var regex = new RegExp(escapeRegex(busca), 'i');
    lista = lista.filter(function (hq) {
      return CAMPOS_BUSCA_HQ.some(function (campo) {
        var valor = hq[campo];
        return valor != null && regex.test(String(valor).trim());
      });
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

/** Divide a lista em páginas; retorna { itens, totalPaginas, paginaAtual, total }. */
function paginar(lista, pagina, porPagina) {
  var total = lista.length;
  var totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  var pagAtual = Math.max(1, Math.min(pagina, totalPaginas));
  var inicio = (pagAtual - 1) * porPagina;
  var itens = lista.slice(inicio, inicio + porPagina);
  return { itens: itens, totalPaginas: totalPaginas, paginaAtual: pagAtual, total: total };
}

/** Preenche os selects de roteirista e desenhista com opções vindas do banco. */
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

/** Remove instâncias de Popover dos cards antes de limpar a grade (evita vazamento ao re-renderizar). */
function disposePopoversAcervo() {
  var container = document.getElementById('acervo-cards');
  if (!container || !window.bootstrap || !window.bootstrap.Popover) return;
  container.querySelectorAll('.cartao-hq').forEach(function (el) {
    var inst = bootstrap.Popover.getInstance(el);
    if (inst) inst.dispose();
  });
}

/** Renderiza os cards das HQs na grade #acervo-cards (ou mensagem de vazio). Popover ao passar o mouse no card. */
function renderizarCardsAcervo(hqs) {
  var container = document.getElementById('acervo-cards');
  if (!container) return;
  disposePopoversAcervo();
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

    /* Popover ao passar o mouse no card: título + descrição da HQ */
    if (window.bootstrap && window.bootstrap.Popover) {
      var descricao = (hq.descricao || '').trim();
      if (descricao.length > 200) descricao = descricao.substring(0, 200) + '…';
      var conteudoPopover = descricao ? escapeHtml(descricao) : 'Sem descrição.';
      conteudoPopover += '<br><small class="text-muted">Clique em Detalhes para ver ou editar.</small>';
      new bootstrap.Popover(card, {
        trigger: 'hover',
        title: escapeHtml(hq.titulo),
        content: conteudoPopover,
        html: true,
        container: 'body'
      });
    }
  });
}

/** Renderiza os links de paginação em #acervo-paginacao. */
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

/** Exibe spinner de carregamento na área de cards (simulação). */
function mostrarLoadingAcervo() {
  var container = document.getElementById('acervo-cards');
  if (container) {
    container.innerHTML = '<div class="col-12 d-flex flex-column align-items-center justify-content-center acervo-loading"><div class="spinner-border" role="status" style="width: 3rem; height: 3rem;"><span class="visually-hidden">Carregando...</span></div><p class="mt-2 mb-0 text-muted">Carregando...</p></div>';
    container.classList.remove('acervo-vazio');
  }
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

/** Inicializa estado dos filtros e primeira renderização do acervo. */
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

/** Liga eventos dos filtros, range (com debounce), e clique em "Detalhes" nos cards. */
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
    var timeoutAnoRange;
    function aplicarFiltrosAnoDebounced() {
      if (anoValor && anoRange) anoValor.textContent = anoRange.value;
      aplicarFiltros();
    }
    anoRange.addEventListener('input', function () {
      if (anoValor && anoRange) anoValor.textContent = anoRange.value;
      clearTimeout(timeoutAnoRange);
      timeoutAnoRange = setTimeout(aplicarFiltrosAnoDebounced, 300);
    });
    anoRange.addEventListener('change', function () {
      if (anoValor && anoRange) anoValor.textContent = anoRange.value;
      clearTimeout(timeoutAnoRange);
      timeoutAnoRange = setTimeout(aplicarFiltrosAnoDebounced, 300);
    });
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

// ========== MODAL HQ (detalhes, edição, adicionar, excluir) ==========

/** Referências aos elementos do formulário do modal HQ. */
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

/** Preenche os campos do modal com os dados da HQ (ou limpa se hq for null). */
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

/** Alterna o modal entre modo leitura (detalhes) e modo edição/adicionar. */
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

/** Abre o modal em modo leitura para a HQ com o id informado. */
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

/** Abre o modal em modo adicionar (nova HQ). */
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

/** Lê os valores atuais do formulário do modal e retorna objeto para salvar no banco. */
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

/** Valida campos obrigatórios do modal; retorna true se válido e remove/adiciona is-invalid. */
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

/** Liga eventos do modal: capa, editar, cancelar, excluir, salvar e botões Adicionar. */
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

/** Persiste edição da HQ atual no banco e atualiza interface + alert. */
function salvarEdicaoHq(dados) {
  if (modalHqIdAtual == null) return;
  db.updateHq(modalHqIdAtual, dados);
  atualizarAcervo();
  atualizaPainelInicial();
  setModalModoLeitura(true);
  preencherFormModal(db.getHqById(modalHqIdAtual));
  mostrarModalSucesso('HQ atualizada com sucesso.');
}

// ========== ALERTAS, TOASTS E UI AUXILIAR ==========

/** Exibe um Toast de sucesso (ao salvar ou deletar HQ). Alguns após 5s ou ao fechar. */
function mostrarToast(mensagem) {
  var container = document.getElementById('toast-container');
  if (!container || !window.bootstrap || !window.bootstrap.Toast) return;
  var msg = mensagem || 'Operação realizada com sucesso.';
  var toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-bg-success border-0';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  toastEl.innerHTML =
    '<div class="d-flex">' +
      '<div class="toast-body">' + escapeHtml(msg) + '</div>' +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>' +
    '</div>';
  container.appendChild(toastEl);
  toastEl.addEventListener('hidden.bs.toast', function () {
    if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
  });
  var toast = new bootstrap.Toast(toastEl, { delay: 5000 });
  toast.show();
}

/** Exibe notificação de sucesso (Toast + scroll para o acervo). Usado ao adicionar, editar ou excluir HQ. */
function mostrarModalSucesso(mensagem) {
  mostrarToast(mensagem);
  var acervoSection = document.getElementById('acervo');
  if (acervoSection) acervoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Alterna o texto do botão "Ver mais" / "Ver menos" conforme o collapse das últimas HQs. */
function bindUltimasVerMais() {
  var collapseEl = document.getElementById('ultimas-hqs-collapse');
  var btn = document.getElementById('ultimas-ver-mais-btn');
  if (collapseEl && btn) {
    collapseEl.addEventListener('show.bs.collapse', function () { btn.textContent = 'Ver menos'; });
    collapseEl.addEventListener('hidden.bs.collapse', function () { btn.textContent = 'Ver mais'; });
  }
}

// ========== INICIALIZAÇÃO ==========
// Carrega seed (se banco vazio), atualiza painel inicial, bind de eventos e primeira renderização do acervo.

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
