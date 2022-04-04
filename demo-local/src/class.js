import sum from './sum';

console.log('Result of sum(1, 2)', sum(1, 2));

class Greeting {
  constructor(a) {
    this.message = 'Hello ' + a;
    console.log(this.message);
  }
}

const greeting = new Greeting('world!');
