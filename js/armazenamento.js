/*
 * Persistência no localStorage. Os compromissos ficam guardados como um
 * array em JSON debaixo de uma única chave.
 */
const CHAVE_DOS_COMPROMISSOS = 'agenda:compromissos';

export function carregarCompromissos() {
  try {
    const texto = localStorage.getItem(CHAVE_DOS_COMPROMISSOS);
    const dados = texto ? JSON.parse(texto) : [];
    return Array.isArray(dados) ? dados : [];
  } catch {
    // JSON corrompido ou localStorage bloqueado: começa com a agenda vazia
    // em vez de quebrar a página inteira
    return [];
  }
}

// Retorna false quando o navegador recusa a gravação (cota cheia ou modo restrito)
export function salvarCompromissos(compromissos) {
  try {
    localStorage.setItem(CHAVE_DOS_COMPROMISSOS, JSON.stringify(compromissos));
    return true;
  } catch {
    return false;
  }
}
