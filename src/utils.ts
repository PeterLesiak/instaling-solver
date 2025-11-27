export type Miliseconds = number & { __brand: 'miliseconds' };

export function delay(duration: Miliseconds): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

export function randomLetter() {
  return String.fromCharCode(randomInt('a'.charCodeAt(0), 'z'.charCodeAt(0)));
}
