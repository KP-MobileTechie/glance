export interface Quote { text: string; author: string; }

export const QUOTES: Quote[] = [
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'Programs must be written for people to read.', author: 'Harold Abelson' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'The function of good software is to make the complex appear simple.', author: 'Grady Booch' },
  { text: 'Deleted code is debugged code.', author: 'Jeff Sickel' },
  { text: 'A little progress each day adds up to big results.', author: 'Anonymous' },
  { text: 'Focus is about saying no.', author: 'Steve Jobs' },
  { text: 'You do not rise to the level of your goals, you fall to the level of your systems.', author: 'James Clear' },
];

export function quoteOfDay(date: Date): Quote {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return QUOTES[((dayIndex % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
