let head = 1; // post 1
let tail = 1; // post 1
let concurrency = 2; // default
let delay = 0; // milliseconds

// buttons panel (top)
const queueButton = document.getElementById('queueButton');
const concurrencyPlus = document.getElementById('concurrencyPlus');
const concurrencyMinus = document.getElementById('concurrencyMinus');
const delayPlus = document.getElementById('delayPlus');
const delayMinus = document.getElementById('delayMinus');
const clearButton = document.getElementById('clear');

// posts panel (middle)
const posts = document.getElementById('posts');

// info panel (bottom)
const concurrencyCount = document.getElementById('concurrencyCount');
const delayCount = document.getElementById('delayCount');
const queue = document.getElementById('queue');
const running = document.getElementById('running');
const complete = document.getElementById('complete');

queueButton.addEventListener('click', addToQueue);
concurrencyPlus.addEventListener('click', incrementConcurrency);
concurrencyMinus.addEventListener('click', decrementConcurrency);
delayPlus.addEventListener('click', incrementDelay);
delayMinus.addEventListener('click', decrementDelay);
clearButton.addEventListener('click', clear);


// QUEUE/DEQUEUE
function addToQueue() {
  const post = document.createElement('span');
  post.innerText = `${tail}`;
  queue.append(post);
  tail++;
  dequeue();
}

function dequeue() {

  // while can dequeue
  while (canDequeue()) {
    // fetch post
    setTimeout(fetchPost, delay, head, delay);

    // increment head
    head++;

    // move to running
    moveToRunning();
  }
}

function canDequeue() {
  // if fetches in queue, and running is < concurrency
  return queue.children.length && (running.children.length < concurrency);
}

function moveToRunning() {
  running.append( queue.firstElementChild );
}

function fetchPost(headPassedToSetTimeout) {
  fetch('https://api.chucknorris.io/jokes/random')
    .then(res => res.json())
    .then(joke => {
      const post = document.createElement('p');
      post.innerText = joke.value;
      posts.prepend(post);

      // move head to complete
      moveToComplete(headPassedToSetTimeout);

      // dequeue if possible
      dequeue();
    })
    .catch(err => console.log(err.message));
}

function moveToComplete(headPassedToSetTimeout) {
  for (let i = 0; i < running.children.length; i++) {
    // if innerText is same as original head passed to setTimeout
    if (running.children[i].innerText === headPassedToSetTimeout.toString()) {
      const nbsp = complete.firstChild
      nbsp.after( running.children[i] );
      break;
    }
  }
}


// CONCURRENCY
function incrementConcurrency() {
  concurrency++;
  concurrencyCount.innerText = concurrency;
  dequeue();
}

function decrementConcurrency() {
  if (concurrency > 1) {
    concurrency--;
    concurrencyCount.innerText = concurrency;
  }
}


// DELAY
function incrementDelay() {
  delay += 1000;
  delayCount.innerText = delay / 1000;
}

function decrementDelay() {
  if (delay > 0) {
    delay -= 1000;
    delayCount.innerText = delay / 1000;
  }
}


// CLEAR
function clear() {
  head = 1;
  tail = 1;
  posts.innerText = '';
  concurrency = 2; // default
  concurrencyCount.innerText = 2;
  delay = 0;
  delayCount.innerText = 0;

  queue.innerText = '\xa0';
  running.innerText = '\xa0';
  complete.innerHTML = '\xa0';
}