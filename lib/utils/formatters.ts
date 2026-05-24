// Formatar valor em Real Brasileiro
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

// Formatar data em português
export function formatarData(data: string): string {
  if (!data) return '—';
  // Handle date-only strings like "2024-01-15" to avoid timezone shift
  const dataParts = data.split('T')[0].split('-');
  if (dataParts.length === 3) {
    const date = new Date(
      parseInt(dataParts[0]),
      parseInt(dataParts[1]) - 1,
      parseInt(dataParts[2])
    );
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(data));
}

// Verificar se preço está desatualizado (> 30 dias)
export function precoDesatualizado(dataAtualizacao: string): boolean {
  if (!dataAtualizacao) return false;
  const data = new Date(dataAtualizacao);
  const agora = new Date();
  const diffDias = Math.floor((agora.getTime() - data.getTime()) / (1000 * 60 * 60 * 24));
  return diffDias > 30;
}

// Calcular percentual de diferença em relação ao menor preço
export function calcularPercentualDiferenca(preco: number, menorPreco: number): number {
  if (menorPreco === 0) return 0;
  return Math.round(((preco - menorPreco) / menorPreco) * 100);
}

// Parsear input de moeda (aceita "250", "250,50", "R$ 250,50")
export function parsearMoeda(input: string): number {
  const limpo = input.replace(/[R$\s.]/g, '').replace(',', '.');
  const numero = parseFloat(limpo);
  return isNaN(numero) ? 0 : numero;
}

// Calcular quantos dias atrás foi atualizado
export function diasDesdeAtualizacao(dataAtualizacao: string): number {
  if (!dataAtualizacao) return 0;
  const data = new Date(dataAtualizacao);
  const agora = new Date();
  return Math.floor((agora.getTime() - data.getTime()) / (1000 * 60 * 60 * 24));
}
