/*
 * Ponto de entrada da agenda. Guarda o estado da tela e liga os eventos
 * da interface às regras. Como é um módulo ES, nada daqui vai para o
 * escopo global do navegador.
 */
import { hoje, chaveDeHoje, deslocarMes, lerChave, nomeDoDiaDaSemana, formatarDataExtensa } from './datas.js';
import { renderizarCalendario } from './ui/calendario.js';

const estado = {
  ano: 0,
  mes: 0,
  chaveSelecionada: '',
};

const elementos = {
  calendario: {
    titulo: document.querySelector('#titulo-mes'),
    grade: document.querySelector('#grade-dias'),
  },
  tituloDia: document.querySelector('#titulo-dia'),
  botaoAnterior: document.querySelector('#mes-anterior'),
  botaoSeguinte: document.querySelector('#mes-seguinte'),
  botaoHoje: document.querySelector('#mes-hoje'),
};

function renderizar() {
  renderizarCalendario(elementos.calendario, {
    ano: estado.ano,
    mes: estado.mes,
    chaveSelecionada: estado.chaveSelecionada,
    compromissosPorDia: new Map(),
  });
  elementos.tituloDia.textContent = `${nomeDoDiaDaSemana(estado.chaveSelecionada)}, ${formatarDataExtensa(estado.chaveSelecionada)}`;
}

function navegar(passo) {
  Object.assign(estado, deslocarMes(estado.ano, estado.mes, passo));
  renderizar();
}

function irParaHoje() {
  const { ano, mes } = hoje();
  Object.assign(estado, { ano, mes, chaveSelecionada: chaveDeHoje() });
  renderizar();
}

// Selecionar um dia de outro mês (as células apagadas) leva o calendário até ele
function selecionarDia(chave) {
  const { ano, mes } = lerChave(chave);
  Object.assign(estado, { ano, mes, chaveSelecionada: chave });
  renderizar();
}

function registrarEventos() {
  elementos.botaoAnterior.addEventListener('click', () => navegar(-1));
  elementos.botaoSeguinte.addEventListener('click', () => navegar(1));
  elementos.botaoHoje.addEventListener('click', irParaHoje);

  // Um único ouvinte na grade em vez de um por dia
  elementos.calendario.grade.addEventListener('click', (evento) => {
    const celula = evento.target.closest('.celula');
    if (celula) selecionarDia(celula.dataset.chave);
  });
}

registrarEventos();
irParaHoje();
