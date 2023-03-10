let boardState = [
  [null, null, null],
  [null, null, null],
  [null, null, null]
]

// let boardState = [
//   ['0', '0', 'X'],
//   [null, 'X', '0'],
//   [null, null, '0']
// ]

const format = b => {
  return b.reduce((a, e) => {
    return a + e.map(i => i === null ? ' ' : i) + '\n';
  }, "");

}

let current = 'X';

const board = document.querySelector(".board");

board.addEventListener('click', onClick);

function win(c, board) {
  return board[0][0] === c && board[0][1] === c && board[0][2] === c ||
    board[1][0] === c && board[1][1] === c && board[1][2] === c ||
    board[2][0] === c && board[2][1] === c && board[2][2] === c ||
    board[0][0] === c && board[1][0] === c && board[2][0] === c ||
    board[0][1] === c && board[1][1] === c && board[2][1] === c ||
    board[0][2] === c && board[1][2] === c && board[2][2] === c ||
    board[0][0] === c && board[1][1] === c && board[2][2] === c ||
    board[0][2] === c && board[1][1] === c && board[2][0] === c;
}

function winState(board) {
  if (win('X', board)) return 1;
  if (win('0', board)) return -1;
  const hasEmpty = board.some(r => r.some(e => e === null));
  if (hasEmpty) return null;
  return 0;
}

function getRandomInt(min = 0, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAI(board_, side) {
  const board = structuredClone(board_);
  const empty = board.reduce((a, line, lineIndex) => {
    const l = line.reduce((acc, e, index) => {
      return e ? acc : [...acc, [lineIndex, index]];
    }, []);
    return a.concat(l);
  }, []);

  if (empty.length === 0) {
    return board;
  }

  const index = getRandomInt(0, empty.length - 1);
  const [r, c] = empty[index];
  board[r][c] = side;
  return board;
}

const semiRandomAI = (board_, side) => {
  const board = structuredClone(board_);

  for (let r = 0; r < 3; r++) {
    const row = board[r];
    if (row.filter(e => e === side).length === 2) {
      const c = row.indexOf(null);
      board[r][c] = side;
      return board;
    }
  }


  for (let c = 0; c < 3; c++) {
    if (board[0, c] === board[1, c] === side) {
      board[2][c] = side;
      return board;
    }
    if (board[1][c] === board[2, c] === side) {
      board[0][c] = side;
      return board;
    }
    if (board[0][c] === board[2, c] === side) {
      board[1][c] = side;
      return board;
    }
  }
  return randomAI(board_, side);
}


const cleverAI = (board_, side) => {
  const board = structuredClone(board_);
  let bestScore = Infinity;
  let move;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        board[i][j] = side;
        let score = minmax(board, 0, true, side);
        console.log(format(board));
        console.log(score)
        board[i][j] = null;

        if (score < bestScore) {
          bestScore = score;
          move = {i, j};
        }
      }
    }
  }

  if (move) {
    board[move.i][move.j] = side;
  }

  return board;
}

function minmax(board, depth, isMaximazing, side) {
  let result = winState(board);
  if (result !== null) {
    return result;
  }

  if (isMaximazing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          board[i][j] = 'X';
          let score = minmax(board, depth + 1, !isMaximazing, side === 'X' ? '0' : 'X');
          board[i][j] = null;
          bestScore = Math.max(bestScore, score);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          board[i][j] = '0';
          let score = minmax(board, depth + 1, !isMaximazing, side === 'X' ? '0' : 'X');
          board[i][j] = null;
          bestScore = Math.min(bestScore, score);
        }
      }
    }
    return bestScore;
  }
}

render()

function onClick(e) {
  const r = e.target.dataset.r;
  const c = e.target.dataset.c;
  boardState[r][c] = 'X';
  boardState = cleverAI(boardState, '0');
  render();

  if (win('X', boardState)) console.log('X win!');
  if (win('0', boardState)) console.log('0 win!');
}

function render() {
  const squares = document.querySelector('.board').querySelectorAll('div');
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      squares[i * 3 + j].innerText = boardState[i][j]
    }
  }
}




