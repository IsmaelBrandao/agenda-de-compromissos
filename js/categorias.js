/*
 * Categorias disponíveis. A cor de cada uma fica no CSS
 * (seletor [data-categoria]), aqui só ficam o identificador e o nome exibido.
 */
export const CATEGORIAS = [
  { id: 'trabalho', nome: 'Trabalho' },
  { id: 'estudo', nome: 'Estudo' },
  { id: 'pessoal', nome: 'Pessoal' },
  { id: 'saude', nome: 'Saúde' },
];

export const CATEGORIA_PADRAO = 'pessoal';

export function categoriaExiste(id) {
  return CATEGORIAS.some((categoria) => categoria.id === id);
}

export function nomeDaCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)?.nome ?? '';
}
