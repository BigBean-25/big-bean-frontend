// Bengaluru business-date helpers.
// The cafe operates on Asia/Kolkata calendar days — never derive "today"
// from the browser/server's UTC date, which can roll over at the wrong moment.
export function todayInBengaluru(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
