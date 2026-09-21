export function getTipoLabel(tipo) {
  if (tipo === 'exercicio') return 'Exercício'
  if (tipo === 'teorica') return 'Teórica'
  return tipo
}

export function getTipoIcon(tipo) {
  if (tipo === 'exercicio') return 'mdi-code-braces'
  if (tipo === 'teorica') return 'mdi-book-open-page-variant'
  return 'mdi-help-circle-outline'
}

export function getTipoClass(tipo) {
  if (tipo === 'exercicio') return 'tipoExercicio'
  if (tipo === 'teorica') return 'tipoTeorica'
  return ''
}

export function getQuestionModoLabel(modo) {
  const map = {
    discursiva: 'Discursiva',
    multipla_escolha: 'Múltipla Escolha',
    verdadeiro_falso: 'Verdadeiro/Falso',
    programacao: 'Programação',
  }
  return map[modo] || 'Discursiva'
}
