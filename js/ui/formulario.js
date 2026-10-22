/*
 * Formulário de compromisso dentro de um <dialog>. Serve tanto para
 * cadastrar quanto para editar. A validação em si fica em compromissos.js;
 * aqui só exibimos as mensagens que ela devolve ao lado de cada campo.
 */
import { CATEGORIAS, CATEGORIA_PADRAO } from '../categorias.js';
import { criarElemento } from './dom.js';

const CAMPOS_VALIDADOS = ['titulo', 'data', 'inicio', 'fim', 'categoria'];

const TEXTOS = {
  novo: { titulo: 'Novo compromisso', botao: 'Salvar compromisso' },
  edicao: { titulo: 'Editar compromisso', botao: 'Salvar alterações' },
};

function criarOpcaoDeCategoria({ id, nome }) {
  const rotulo = criarElemento('label', 'categoria');
  const radio = criarElemento('input');
  radio.type = 'radio';
  radio.name = 'categoria';
  radio.value = id;
  rotulo.dataset.categoria = id;
  rotulo.append(radio, criarElemento('span', 'categoria__cor'), nome);
  return rotulo;
}

export function criarFormulario(dialogo, { aoEnviar }) {
  const formulario = dialogo.querySelector('form');
  const campos = formulario.elements;
  const titulo = dialogo.querySelector('#titulo-formulario');
  const botaoSalvar = dialogo.querySelector('#botao-salvar');
  let idEmEdicao = null;

  dialogo.querySelector('#opcoes-categoria').append(...CATEGORIAS.map(criarOpcaoDeCategoria));

  function mensagemDeErro(campo) {
    return dialogo.querySelector(`#erro-${campo}`);
  }

  function limparErro(campo) {
    mensagemDeErro(campo).hidden = true;
    mensagemDeErro(campo).textContent = '';
    if (campos[campo] instanceof HTMLElement) {
      campos[campo].removeAttribute('aria-invalid');
    }
  }

  function mostrarErros(erros) {
    CAMPOS_VALIDADOS.forEach(limparErro);
    Object.entries(erros).forEach(([campo, mensagem]) => {
      mensagemDeErro(campo).textContent = mensagem;
      mensagemDeErro(campo).hidden = false;
      if (campos[campo] instanceof HTMLElement) {
        campos[campo].setAttribute('aria-invalid', 'true');
      }
    });

    // Leva o foco ao primeiro campo com problema, na ordem do formulário
    const primeiro = CAMPOS_VALIDADOS.find((campo) => erros[campo]);
    const alvo = campos[primeiro];
    (alvo instanceof HTMLElement ? alvo : alvo?.[0])?.focus();
  }

  function preencher(dados) {
    campos.titulo.value = dados.titulo ?? '';
    campos.data.value = dados.data ?? '';
    campos.inicio.value = dados.inicio ?? '';
    campos.fim.value = dados.fim ?? '';
    campos.descricao.value = dados.descricao ?? '';
    campos.categoria.value = dados.categoria ?? CATEGORIA_PADRAO;
  }

  function abrir(modo, dados, id = null) {
    idEmEdicao = id;
    titulo.textContent = TEXTOS[modo].titulo;
    botaoSalvar.textContent = TEXTOS[modo].botao;
    CAMPOS_VALIDADOS.forEach(limparErro);
    preencher(dados);
    dialogo.showModal();
    campos.titulo.focus();
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(formulario));
    const erros = aoEnviar(dados, idEmEdicao);
    if (Object.keys(erros).length > 0) {
      mostrarErros(erros);
    } else {
      dialogo.close();
    }
  });

  // A mensagem de erro some assim que a pessoa corrige o campo
  formulario.addEventListener('input', (evento) => {
    const campo = evento.target.name;
    if (CAMPOS_VALIDADOS.includes(campo)) limparErro(campo);
    if (campo === 'inicio' || campo === 'fim') {
      limparErro('inicio');
      limparErro('fim');
    }
  });

  dialogo.addEventListener('click', (evento) => {
    // Clique no fundo escurecido (fora do formulário) também fecha
    if (evento.target === dialogo || evento.target.closest('[data-fechar]')) {
      dialogo.close();
    }
  });

  return {
    abrirNovo: (data) => abrir('novo', { data }),
    abrirEdicao: (compromisso) => abrir('edicao', compromisso, compromisso.id),
  };
}
