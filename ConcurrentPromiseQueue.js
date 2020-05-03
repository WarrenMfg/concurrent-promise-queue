const readline = require('readline');
const EventEmitter = require('events');
const logUpdate = require('log-update');
const chalk = require('chalk');

// initialize event emitter
const emitter = new EventEmitter();


// define class
class ConcurrentPromiseQueue {
  constructor(queue, concurrencyCount) {
    this.queue = queue;
    this.head = 0;
    this.concurrencyCount = concurrencyCount;
    this.running = {};
    this.complete = {};

    // move from running to complete once resolved
    emitter.on('resolved', (i) => {
      this.complete[i] = this.running[i];
      delete this.running[i];

      // visualize
      this.dataVis();

      // continue dequeueing
      this.dequeue();
    });
  }


  // refactor so that async function goes here
  delay(ms, i) {
    return new Promise(resolve => setTimeout(() => {
      // pass in your data
      resolve(i);
      // emit
      emitter.emit('resolved', i);
    }, ms));
  }


  // check if can dequeue
  canDequeue() {
    return Object.keys(this.queue).length && (Object.keys(this.running).length < this.concurrencyCount);
  }


  // dequeue
  dequeue() {
    const { queue, running, delay } = this;

    // check if can dequeue
    while (this.canDequeue()) {
      // dequeue
      const [ ms, i ] = queue[this.head];
      delete queue[this.head];

      // increment head
      this.head++;

      // invoke and add to running
      running[i] = delay(ms, i);

      // visualize
      this.dataVis();
    }
  }


  dataVis() {
    const { queue, running, complete } = this;
    logUpdate(chalk`
        {red Queue ➡ ${Object.keys(queue).map(() => 'Q')} }
      {yellow Running ➡ ${Object.keys(running).map(() => 'R')} }
    {green  Complete ➡ ${Object.keys(complete).map(() => 'C')} }
    `);
  }
}




// interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// questions
const questions = [
  'Maximum queue size? ',
  'Concurrency count? ',
  'Maximum delay? '
];


// answers
const answers = [];


// ask
const ask = (i) => {
  rl.question(questions[i], answer => {
    // add to answers array
    answers.push(answer.trim());
    // if more questions
    if (questions.length !== answers.length) {
      // ask
      ask(answers.length);

    // otherwise
    } else {
      rl.close();
      // make list
      makeList();
    }
  });
};

ask(0);


// make list
const list = {};

const makeList = () => {
  const [ queueSize, concurrencyCount, maxDelay ] = answers;

  for (let i = 0; i < Number(queueSize); i++) {
    const ms = Math.floor( Math.random() * (Number(maxDelay) + 1) ) * 1000;
    list[i] = [ ms, i ];
  }

  // make queue
  makeQueue(Number(concurrencyCount));
};


// make queue and dequeue
const makeQueue = (concurrencyCount) => {
  const concurrencyQueue = new ConcurrentPromiseQueue(list, concurrencyCount);
  console.log('\033c'); // clear terminal
  concurrencyQueue.dequeue();
};

