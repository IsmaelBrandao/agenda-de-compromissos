/*
 * Ponto de entrada da agenda. Guarda o estado da tela e liga os eventos
 * da interface às regras. Como é um módulo ES, nada daqui vai para o
 * escopo global do navegador.
 */
import { hoje, chaveDeHoje, deslocarMes, lerChave } from './datas.js';
import { carregarCompromissos, salvarCompromissos } from './armazenamento.js';
import {
  validarCompromisso,
  temErros,
  adicionarCompromisso,
  atualizarCompromisso,
  removerCompromisso,
  buscarCompromisso,
  agruparPorDia,
} from './compromissos.js';
import { renderizarCalendario } from './ui/calendario.js';
import { renderizarPainelDia } from './ui/painelDia.js';
import { criarFormulario } from './ui/formulario.js';
import { criarAviso } from './ui/aviso.js';
import { criarConfirmacao } from './ui/confirmacao.js';

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
  painel: {
    titulo: document.querySelector('#titulo-dia'),
    lista: document.querySelector('#lista-dia'),
  },
  botaoAnterior: document.querySelector('#mes-anterior'),
  botaoSeguinte: document.querySelector('#mes-seguinte'),
  botaoHoje: document.querySelector('#mes-hoje'),
  botaoNovo: document.querySelector('#botao-novo'),
};

const avisar = criarAviso(document.querySelector('#aviso'));
const confirmar = criarConfirmacao(document.querySelector('#modal-confirmacao'));

function renderizar() {
  const compromissosPorDia = agruparPorDia(estado.compromissos);
  renderizarCalendario(elementos.calendario, {
    ano: estado.ano,
    mes: estado.mes,
    chaveSelecionada: estado.chaveSelecionada,
    compromissosPorDia,
  });
  renderizarPainelDia(elementos.painel, {
    chave: estado.chaveSelecionada,
    compromissos: compromissosPorDia.get(estado.chaveSelecionada) ?? [],
  });
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

async function excluir(id) {
  const compromisso = buscarCompromisso(estado.compromissos, id);
  const confirmou = await confirmar(`"${compromisso.titulo}" será apagado da agenda e não dá para desfazer.`);
  if (!confirmou) return;

  aplicarAlteracao(removerCompromisso(estado.compromissos, id), 'Compromisso excluído.');
  renderizar();
  // O botão clicado sumiu junto com o item, então o foco volta para o título do dia
  elementos.painel.titulo.focus();
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

  // Mesma ideia no painel: os botões dizem a ação e o item diz qual compromisso
  elementos.painel.lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;

    const id = botao.closest('[data-id]')?.dataset.id;
    const acoes = {
      novo: () => formulario.abrirNovo(estado.chaveSelecionada),
      editar: () => formulario.abrirEdicao(buscarCompromisso(estado.compromissos, id)),
      excluir: () => excluir(id),
    };
    acoes[botao.dataset.acao]();
  });
}

estado.compromissos = carregarCompromissos();
registrarEventos();
irParaHoje();
