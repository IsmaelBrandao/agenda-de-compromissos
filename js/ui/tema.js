/*
 * Tema claro e escuro. Sem escolha salva, a página acompanha o tema do
 * sistema. Depois que a pessoa clica no botão, a escolha fica guardada.
 */
const CHAVE_DO_TEMA = 'agenda:tema';
const TEMAS = ['claro', 'escuro'];
const preferenciaEscura = window.matchMedia('(prefers-color-scheme: dark)');

function lerTemaSalvo() {
  try {
    const tema = localStorage.getItem(CHAVE_DO_TEMA);
    return TEMAS.includes(tema) ? tema : null;
  } catch {
    return null;
  }
}

function salvarTema(tema) {
  try {
    localStorage.setItem(CHAVE_DO_TEMA, tema);
  } catch {
    // Sem localStorage o tema só não é lembrado na próxima visita
  }
}

function temaDoSistema() {
  return preferenciaEscura.matches ? 'escuro' : 'claro';
}

function aplicarTema(tema, botao) {
  document.documentElement.dataset.tema = tema;
  const outro = tema === 'escuro' ? 'claro' : 'escuro';
  botao.setAttribute('aria-label', `Usar tema ${outro}`);
  botao.title = `Usar tema ${outro}`;
}

export function iniciarTema(botao) {
  aplicarTema(lerTemaSalvo() ?? temaDoSistema(), botao);

  botao.addEventListener('click', () => {
    const novoTema = document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    salvarTema(novoTema);
    aplicarTema(novoTema, botao);
  });

  preferenciaEscura.addEventListener('change', () => {
    if (!lerTemaSalvo()) aplicarTema(temaDoSistema(), botao);
  });
}
