/*
 * Regras dos compromissos: validação, criação, edição, exclusão e consultas.
 * As funções não alteram a lista recebida, sempre devolvem uma lista nova.
 * Isso deixa claro no app.js o momento em que o estado muda.
 */
import { categoriaExiste, CATEGORIA_PADRAO } from './categorias.js';

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

// Remove espaços sobrando e garante que todo compromisso tenha os mesmos campos
function normalizar(dados) {
  return {
    titulo: (dados.titulo ?? '').trim(),
    data: dados.data ?? '',
    inicio: dados.inicio ?? '',
    fim: dados.fim ?? '',
    descricao: (dados.descricao ?? '').trim(),
    categoria: dados.categoria || CATEGORIA_PADRAO,
  };
}

function gerarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/*
 * Devolve um objeto com uma mensagem por campo inválido.
 * Objeto vazio significa que está tudo certo.
 * Horários no formato "HH:MM" podem ser comparados como texto,
 * porque "08:30" < "14:00" também vale em ordem alfabética.
 */
export function validarCompromisso(dados) {
  const { titulo, data, inicio, fim, categoria } = normalizar(dados);
  const erros = {};

  if (!titulo) {
    erros.titulo = 'Informe um título para o compromisso.';
  }
  if (!data) {
    erros.data = 'Escolha a data do compromisso.';
  } else if (!FORMATO_DATA.test(data)) {
    erros.data = 'Use uma data válida no formato dd/mm/aaaa.';
  }
  if (fim && !inicio) {
    erros.inicio = 'Preencha o início para poder definir o término.';
  } else if (inicio && fim && fim < inicio) {
    erros.fim = `O término precisa ser igual ou depois do início (${inicio}).`;
  }
  if (!categoriaExiste(categoria)) {
    erros.categoria = 'Escolha uma das categorias.';
  }

  return erros;
}

export function temErros(erros) {
  return Object.keys(erros).length > 0;
}

export function adicionarCompromisso(lista, dados) {
  return [...lista, { id: gerarId(), ...normalizar(dados) }];
}

export function atualizarCompromisso(lista, id, dados) {
  return lista.map((item) => (item.id === id ? { id, ...normalizar(dados) } : item));
}

export function removerCompromisso(lista, id) {
  return lista.filter((item) => item.id !== id);
}

export function buscarCompromisso(lista, id) {
  return lista.find((item) => item.id === id);
}

// Compromissos sem horário aparecem primeiro, depois pela hora de início
function compararPorHorario(a, b) {
  return a.inicio.localeCompare(b.inicio) || a.titulo.localeCompare(b.titulo, 'pt-BR');
}

export function agruparPorDia(lista) {
  const porDia = new Map();
  [...lista].sort(compararPorHorario).forEach((item) => {
    const doDia = porDia.get(item.data) ?? [];
    doDia.push(item);
    porDia.set(item.data, doDia);
  });
  return porDia;
}
