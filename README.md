# Central de Quadrinhos

Painel interativo para gerenciamento de um acervo de HQs (revistas em quadrinhos). Desenvolvido como atividade do curso de **Sistemas de Informação** da **Universidade de Mogi das Cruzes (UMC)**.

---

## Tecnologias

- **HTML5**  
- **CSS3** (variáveis de tema, layout responsivo)  
- **JavaScript** (vanilla)  
- **Bootstrap 5.3** (componentes e grid)  
- **Google Fonts** (Plus Jakarta Sans)

---

## Funcionalidades

### Layout e navegação
- Navbar fixa no topo com links (Início, Acervo)
- Menu lateral em Offcanvas (hambúrguer em telas pequenas)
- Container e grid responsivo (Breakpoints Bootstrap)
- Scrollspy no menu lateral (destaque do link da seção visível)

### Página Início
- Título “Central de Quadrinhos”
- **Últimas HQs cadastradas:** lista das 3 mais recentes; link “Ver mais” abre Collapse com mais 3 (total 6)
- **Top 3 roteiristas** e **Top 3 desenhistas** (por quantidade de HQs)
- **Destaques:** carrossel de imagens de HQs em P&B

### Acervo
- **Filtros:**  
  - Busca inteligente (Input Group + ícone): busca em título, descrição, roteirista e desenhista  
  - Roteirista e Desenhista: selects com opções dinâmicas (Float Labels)  
  - Ano (mín.): range (ano mais antigo do acervo até ano atual), com debounce
- Contagem de resultados (“X itens encontrados”); no mobile, na mesma linha do botão Adicionar
- **Grade de cards:** capa, título, ano, roteirista/desenhista, botão “Detalhes”
- **Paginação:** 4 itens por página
- **Loading:** spinner por 500 ms ao filtrar/paginar (simulação)
- **Popover:** ao passar o mouse no card, exibe título e descrição da HQ (até 200 caracteres)
- **Alert** de sucesso no topo do card do acervo (operação concluída)
- **Toasts** no canto inferior direito ao adicionar, editar ou excluir HQ

### Modal HQ (detalhes / editar / adicionar)
- Formulário: capa (clique para trocar na edição), título, descrição, roteirista, desenhista, ano, checkbox Digital
- Modos: apenas leitura (Fechar, Editar) e edição (Cancelar, Excluir, Salvar)
- Validação de campos obrigatórios
- Modal de confirmação antes de excluir
- Imagem “sem capa” quando não houver imagem

### Dados
- Banco em memória (array); novas HQs entram no topo da lista
- Seed: 9 HQs iniciais (imagens em `assets/images/hqs/`), carregadas apenas se o banco estiver vazio
- Ordem do seed: primeiras 5, depois Sensation Comics / Wonder Woman, Amazing Fantasy #15, Captain America #1, The Amazing Spider-Man #316 (ids 6–9)

---

## Estrutura do projeto

```
umc-painel-interativo/
├── index.html          # Página única (Início + Acervo + modais + toasts)
├── css/
│   └── style.css       # Estilos e tema (cores, cards, responsivo)
├── js/
│   └── main.js        # Lógica: banco, filtros, paginação, modal, toasts, popovers
├── assets/
│   └── images/        # Capas das HQs e imagens do carrossel
├── orientacoes.txt    # Enunciado da atividade
└── README.md
```

---

## Requisitos da atividade (Bootstrap)

O projeto atende aos requisitos da atividade: Navbar, Offcanvas, Container/Grid, botão Adicionar, Modal com formulário (inputs, select, checkbox, range), Input Group, Float Labels, validação, Cards com Detalhes, Collapse, Spinners, Alerts, Toasts, Dropdown (filtros), Pagination, Popovers, Scrollspy e Carousel.