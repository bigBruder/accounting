export function formatAmount(amount: number): string {
  return amount.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ₴';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getTodayISO(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}
