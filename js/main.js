// Banco em memória
const db = {
  hqs: [],
  _nextId: 1,

  getAllHqs() {
    return this.hqs;
  },

  // Adiciona e devolve a criada
  addHq(hq) {
    const nova = { id: this._nextId++, ...hq, createdAt: new Date().toISOString() };
    this.hqs.push(nova);
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

  // Remove todas as HQs
  clearHqs() {
    this.hqs = [];
  }
};
