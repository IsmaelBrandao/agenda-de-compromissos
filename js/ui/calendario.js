/*
 * Interface do calendário mensal: título do mês e grade de dias.
 * Só desenha o que recebe; quem decide o mês e o dia selecionado é o app.js.
 */
import { montarGradeDoMes, nomeDoMes, nomeDoDiaDaSemana, chaveDeHoje } from '../datas.js';
import { criarElemento } from './dom.js';

const MARCADORES_VISIVEIS = 2;

function textoDaQuantidade(quantidade) {
  if (quantidade === 0) return 'sem compromissos';
  return quantidade === 1 ? '1 compromisso' : `${quantidade} compromissos`;
}

function descreverCelula(celula, quantidade, ehHoje) {
  const partes = [
    `${celula.dia} de ${nomeDoMes(celula.mes)}`,
    nomeDoDiaDaSemana(celula.chave),
    textoDaQuantidade(quantidade),
  ];
  if (ehHoje) partes.unshift('Hoje');
  return partes.join(', ');
}

function criarMarcadores(compromissos) {
  const marcadores = criarElemento('span', 'celula__marcadores');

  compromissos.slice(0, MARCADORES_VISIVEIS).forEach((compromisso) => {
    const marcador = criarElemento('span', 'marcador', compromisso.titulo);
    marcador.dataset.categoria = compromisso.categoria;
    marcadores.append(marcador);
  });

  const restantes = compromissos.length - MARCADORES_VISIVEIS;
  if (restantes > 0) {
    marcadores.append(criarElemento('span', 'celula__mais', `+${restantes}`));
  }

  return marcadores;
}

function criarCelula(celula, { chaveSelecionada, chaveHoje, compromissosPorDia }) {
  const compromissos = compromissosPorDia.get(celula.chave) ?? [];
  const ehHoje = celula.chave === chaveHoje;
  const botao = criarElemento('button', 'celula');

  botao.type = 'button';
  botao.dataset.chave = celula.chave;
  botao.setAttribute('aria-label', descreverCelula(celula, compromissos.length, ehHoje));
  botao.setAttribute('aria-pressed', String(celula.chave === chaveSelecionada));
  botao.classList.toggle('celula--fora', !celula.doMesExibido);
  botao.classList.toggle('celula--hoje', ehHoje);
  botao.classList.toggle('celula--selecionada', celula.chave === chaveSelecionada);
  if (ehHoje) botao.setAttribute('aria-current', 'date');

  botao.append(criarElemento('span', 'celula__numero', celula.dia));
  if (compromissos.length > 0) {
    botao.append(criarMarcadores(compromissos));
  }

  return botao;
}

export function renderizarCalendario(elementos, { ano, mes, chaveSelecionada, compromissosPorDia }) {
  const contexto = { chaveSelecionada, chaveHoje: chaveDeHoje(), compromissosPorDia };
  const celulas = montarGradeDoMes(ano, mes).map((celula) => criarCelula(celula, contexto));

  elementos.titulo.replaceChildren(
    `${nomeDoMes(mes)} `,
    criarElemento('span', 'calendario__ano', ano),
  );
  elementos.grade.replaceChildren(...celulas);
}
