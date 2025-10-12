export function getNextWeek(ref: Date): Date {
  const nextWeek = new Date(ref);

  nextWeek.setDate(nextWeek.getDate() + ((1 + 7 - nextWeek.getDay()) % 7));

  return nextWeek;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
