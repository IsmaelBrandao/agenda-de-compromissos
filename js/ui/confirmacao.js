/*
 * Janela de confirmação feita com <dialog>, no lugar do confirm() do navegador.
 * perguntar() devolve uma Promise que resolve true só quando a pessoa confirma.
 * Fechar com Esc ou clicar fora conta como cancelar.
 */
export function criarConfirmacao(dialogo) {
  const texto = dialogo.querySelector('[data-texto]');

  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });

  return function perguntar(mensagem) {
    texto.textContent = mensagem;
    dialogo.returnValue = '';
    dialogo.showModal();

    return new Promise((resolver) => {
      dialogo.addEventListener('close', () => resolver(dialogo.returnValue === 'confirmar'), { once: true });
    });
  };
}
