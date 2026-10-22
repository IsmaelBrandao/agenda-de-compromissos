// Mensagem curta de confirmação no rodapé da tela, lida também por leitores de tela
const DURACAO_EM_MS = 3500;

export function criarAviso(elemento) {
  let temporizador;

  return function avisar(mensagem) {
    clearTimeout(temporizador);
    elemento.textContent = mensagem;
    elemento.classList.add('aviso--visivel');
    temporizador = setTimeout(() => elemento.classList.remove('aviso--visivel'), DURACAO_EM_MS);
  };
}
