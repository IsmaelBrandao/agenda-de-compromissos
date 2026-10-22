/*
 * Painel lateral com os compromissos do dia selecionado.
 * Os botões levam data-acao e o app.js trata os cliques num único ouvinte.
 */
import { chaveDeHoje, lerChave, nomeDoMes, nomeDoDiaDaSemana } from '../datas.js';
import { nomeDaCategoria } from '../categorias.js';
import { criarElemento } from './dom.js';

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// "Hoje, 22 de outubro" ou "Domingo, 25 de outubro"
function tituloDoDia(chave) {
  const { dia, mes } = lerChave(chave);
  const prefixo = chave === chaveDeHoje() ? 'Hoje' : capitalizar(nomeDoDiaDaSemana(chave));
  return `${prefixo}, ${dia} de ${nomeDoMes(mes)}`;
}

function criarHorario({ inicio, fim }) {
  const paragrafo = criarElemento('p', 'compromisso__horario');
  if (!inicio) {
    paragrafo.textContent = 'Sem horário';
    return paragrafo;
  }

  const horaInicio = criarElemento('time', '', inicio);
  horaInicio.dateTime = inicio;
  paragrafo.append(horaInicio);

  if (fim) {
    const horaFim = criarElemento('time', '', fim);
    horaFim.dateTime = fim;
    paragrafo.append(' às ', horaFim);
  }
  return paragrafo;
}

function criarBotao(texto, acao, rotulo, classeExtra = '') {
  const botao = criarElemento('button', `botao botao--pequeno ${classeExtra}`.trim(), texto);
  botao.type = 'button';
  botao.dataset.acao = acao;
  botao.setAttribute('aria-label', rotulo);
  return botao;
}

function criarItem(compromisso) {
  const item = criarElemento('li', 'compromisso');
  item.dataset.id = compromisso.id;
  item.dataset.categoria = compromisso.categoria;

  const categoria = criarElemento('p', 'compromisso__categoria');
  categoria.append(criarElemento('span', 'categoria__cor'), nomeDaCategoria(compromisso.categoria));

  const acoes = criarElemento('div', 'compromisso__acoes');
  acoes.append(
    criarBotao('Editar', 'editar', `Editar ${compromisso.titulo}`),
    criarBotao('Excluir', 'excluir', `Excluir ${compromisso.titulo}`, 'botao--perigo'),
  );

  item.append(criarHorario(compromisso), criarElemento('h3', 'compromisso__titulo', compromisso.titulo));
  if (compromisso.descricao) {
    item.append(criarElemento('p', 'compromisso__descricao', compromisso.descricao));
  }
  item.append(categoria, acoes);
  return item;
}

function criarVazio() {
  const item = criarElemento('li', 'dia__vazio');
  const botao = criarElemento('button', 'botao', 'Adicionar compromisso');
  botao.type = 'button';
  botao.dataset.acao = 'novo';
  item.append(criarElemento('p', '', 'Nenhum compromisso neste dia.'), botao);
  return item;
}

export function renderizarPainelDia(elementos, { chave, compromissos }) {
  elementos.titulo.textContent = tituloDoDia(chave);
  const itens = compromissos.length > 0 ? compromissos.map(criarItem) : [criarVazio()];
  elementos.lista.replaceChildren(...itens);
}
