/*
 * Ponto de entrada da agenda. Guarda o estado da tela e liga os eventos
 * da interface às regras. Como é um módulo ES, nada daqui vai para o
 * escopo global do navegador.
 */
import { hoje, chaveDeHoje, deslocarMes, lerChave, nomeDoDiaDaSemana, formatarDataExtensa } from './datas.js';
import { carregarCompromissos, salvarCompromissos } from './armazenamento.js';
import {
  validarCompromisso,
  temErros,
  adicionarCompromisso,
  atualizarCompromisso,
  agruparPorDia,
} from './compromissos.js';
import { renderizarCalendario } from './ui/calendario.js';
import { criarFormulario } from './ui/formulario.js';
import { criarAviso } from './ui/aviso.js';

const estado = {
  ano: 0,
  mes: 0,
  chaveSelecionada: '',
  compromissos: [],
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
  botaoNovo: document.querySelector('#botao-novo'),
};

const avisar = criarAviso(document.querySelector('#aviso'));

function renderizar() {
  renderizarCalendario(elementos.calendario, {
    ano: estado.ano,
    mes: estado.mes,
    chaveSelecionada: estado.chaveSelecionada,
    compromissosPorDia: agruparPorDia(estado.compromissos),
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

// Toda alteração na lista passa por aqui: atualiza o estado, grava e avisa
function aplicarAlteracao(novaLista, mensagem) {
  estado.compromissos = novaLista;
  const gravou = salvarCompromissos(novaLista);
  avisar(gravou ? mensagem : 'O navegador não deixou salvar. A alteração some ao recarregar a página.');
}

// Chamada pelo formulário. Devolve os erros para ele exibir, ou {} se salvou.
function salvarDoFormulario(dados, idEmEdicao) {
  const erros = validarCompromisso(dados);
  if (temErros(erros)) return erros;

  if (idEmEdicao) {
    aplicarAlteracao(atualizarCompromisso(estado.compromissos, idEmEdicao, dados), 'Alterações salvas.');
  } else {
    aplicarAlteracao(adicionarCompromisso(estado.compromissos, dados), 'Compromisso salvo.');
  }
  selecionarDia(dados.data);
  return {};
}

const formulario = criarFormulario(document.querySelector('#modal-compromisso'), {
  aoEnviar: salvarDoFormulario,
});

function registrarEventos() {
  elementos.botaoAnterior.addEventListener('click', () => navegar(-1));
  elementos.botaoSeguinte.addEventListener('click', () => navegar(1));
  elementos.botaoHoje.addEventListener('click', irParaHoje);
  elementos.botaoNovo.addEventListener('click', () => formulario.abrirNovo(estado.chaveSelecionada));

  // Um único ouvinte na grade em vez de um por dia
  elementos.calendario.grade.addEventListener('click', (evento) => {
    const celula = evento.target.closest('.celula');
    if (celula) selecionarDia(celula.dataset.chave);
  });
}

estado.compromissos = carregarCompromissos();
registrarEventos();
irParaHoje();
