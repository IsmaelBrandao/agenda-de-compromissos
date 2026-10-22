/*
 * Regras de calendário.
 *
 * As datas dos compromissos são guardadas como texto no formato "AAAA-MM-DD".
 * Não usamos new Date("2026-10-22") para ler esse texto porque o JavaScript
 * interpreta esse formato como meia-noite em UTC. No fuso de Fortaleza (UTC-3)
 * isso vira 21h do dia anterior e o compromisso apareceria no dia errado.
 * Por isso as funções abaixo sempre montam a data com new Date(ano, mes, dia),
 * que usa o fuso local.
 *
 * Os meses seguem o padrão do objeto Date: 0 = janeiro ... 11 = dezembro.
 */

const NOMES_DOS_MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const NOMES_DOS_DIAS = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
];

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const FEVEREIRO = 1;
const DIAS_NA_SEMANA = 7;

// Bissexto: divisível por 4, exceto anos de virada de século que não são
// divisíveis por 400. Assim 2024 e 2000 são bissextos, mas 1900 e 2100 não.
export function ehAnoBissexto(ano) {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

export function diasNoMes(ano, mes) {
  if (mes === FEVEREIRO && ehAnoBissexto(ano)) {
    return 29;
  }
  return DIAS_POR_MES[mes];
}

// Retorna o dia da semana do dia 1 do mês (0 = domingo ... 6 = sábado)
export function primeiroDiaDaSemana(ano, mes) {
  return new Date(ano, mes, 1).getDay();
}

function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

export function paraChave(ano, mes, dia) {
  return `${ano}-${doisDigitos(mes + 1)}-${doisDigitos(dia)}`;
}

export function lerChave(chave) {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return { ano, mes: mes - 1, dia };
}

export function hoje() {
  const agora = new Date();
  return {
    ano: agora.getFullYear(),
    mes: agora.getMonth(),
    dia: agora.getDate(),
  };
}

export function chaveDeHoje() {
  const { ano, mes, dia } = hoje();
  return paraChave(ano, mes, dia);
}

// Soma (ou subtrai) meses. O Date resolve a virada de ano sozinho:
// new Date(2026, 12, 1) vira janeiro de 2027.
export function deslocarMes(ano, mes, passo) {
  const data = new Date(ano, mes + passo, 1);
  return { ano: data.getFullYear(), mes: data.getMonth() };
}

/*
 * Monta as células da grade do mês, de domingo a sábado.
 * A grade começa no domingo da semana do dia 1 e termina no sábado da
 * semana do último dia, então pode incluir alguns dias do mês anterior
 * e do seguinte. Cada célula indica se pertence ao mês exibido.
 */
export function montarGradeDoMes(ano, mes) {
  const deslocamentoInicial = primeiroDiaDaSemana(ano, mes);
  const totalDeDias = diasNoMes(ano, mes);
  const semanas = Math.ceil((deslocamentoInicial + totalDeDias) / DIAS_NA_SEMANA);
  const celulas = [];

  for (let indice = 0; indice < semanas * DIAS_NA_SEMANA; indice += 1) {
    // Dia 1 menos o deslocamento: valores <= 0 caem no mês anterior e
    // valores acima do total caem no mês seguinte, o Date ajusta os dois casos.
    const data = new Date(ano, mes, 1 - deslocamentoInicial + indice);
    celulas.push({
      ano: data.getFullYear(),
      mes: data.getMonth(),
      dia: data.getDate(),
      chave: paraChave(data.getFullYear(), data.getMonth(), data.getDate()),
      doMesExibido: data.getMonth() === mes,
    });
  }

  return celulas;
}

export function nomeDoMes(mes) {
  return NOMES_DOS_MESES[mes];
}

export function nomeDoDiaDaSemana(chave) {
  const { ano, mes, dia } = lerChave(chave);
  return NOMES_DOS_DIAS[new Date(ano, mes, dia).getDay()];
}

// "22 de outubro de 2026"
export function formatarDataExtensa(chave) {
  const { ano, mes, dia } = lerChave(chave);
  return `${dia} de ${nomeDoMes(mes)} de ${ano}`;
}
