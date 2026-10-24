import { html, render } from 'lit-html/lit-html'
import sum from './sum'

console.log('Result of sum(1, 2)', sum(1, 2))

class Greeting {
  constructor(a) {
    this.message = 'Hello ' + a
    console.log(this.message)
  }
}

const greeting = new Greeting('world!')

render(
  html`<br /><br />
    ${greeting.message}, 1 + 2 = ${sum(1, 2)}!`,
  document.body
)
