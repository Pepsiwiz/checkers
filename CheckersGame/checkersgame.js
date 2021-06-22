/**
 * Гра в шашки
 * Виконали студенти 3-го курсу
 * групи ІВ-83
 * Куровський А.О. та Бондаренко М.О.
 * 
 */

 
var AI_DELAY = 1100;

  
var ID_EMPTY = {"id": 0, "html": ""};
var ID_BLACK = {"id": 1, "html": "<div class=\"c b\"/>"};
var ID_BLACK_KING = {"id": 2, "html": "<div class=\"c bk\"/>"};
var ID_WHITE = {"id": 3, "html": "<div class=\"c w\"/>"};
var ID_WHITE_KING = {"id": 4, "html": "<div class=\"c wk\"/>"};

 
var over = false;
var htmlBoard = document.getElementById('board');
var htmlOptions = document.getElementById('options');
var game = load(htmlBoard,htmlOptions);
var timeOut = null, timeOut2 = null;

 
function load(board, options, isP1AI, isP2AI) {
	if (!board || !board.innerHTML || !options || !options.innerHTML) {return new Game([],false,false);}
	if (timeOut) {clearTimeout(timeOut);}
	if (timeOut2) {clearTimeout(timeOut2);}
	over = false;
	
	
	board.innerHTML = '';
	var squares = [], n = 0;
	for (var y=0; y<8; y++) {
		for (var x=0; x<8; x++) {
			if (x%2==y%2) {continue;}
			var style = 'left: '+(x*12.5)+'%; top: '+(y*12.5)+'%;';
			var id = 'p'+x+''+y;
			board.innerHTML += '<div class="s" style="'+style+'" id="'+id+'" onclick="clickEvent('+n+');"/>';
			var checker = ID_EMPTY;
			if (y < 3) {checker = ID_BLACK;}
			else if (y > 4) {checker = ID_WHITE;}
			var square = new Square(x,y, checker);
			squares.push(square);
			n++;
		}
	}
	
	
	var isP1AI = document.getElementById('p1ai'), isP2AI = document.getElementById('p2ai');
	isP1AI = isP1AI? isP1AI.checked : false;
	isP2AI = isP2AI? isP2AI.checked : false;
	options.innerHTML = '<div class="btn" onclick="game = load(htmlBoard,htmlOptions);">Restart</div>' +
	'<b><input type="checkbox" id="p1ai"'+(isP1AI? 'checked ':'')+'>Player 1 is AI?</input>' +
	'<input type="checkbox" id="p2ai"'+(isP2AI? 'checked ':'')+
	'><span style="color: white; text-shadow: 0 0 3px black;">Player 2 is AI?</span></input></b>';
	htmlOptions.setAttribute('style','border-top: 5px solid black;');
	resize(board);
	
	
	var board = new Game(squares,isP1AI,isP2AI);
	if (isP1AI) {
		var aiMove = getAIMove(true, board);
		timeOut2 = setTimeout(function(aiMove) {move(aiMove.start, aiMove.end, game);}, AI_DELAY, aiMove);
	}
	
	return board;
}


function resize(board) {
	var optH = htmlOptions.offsetHeight;;
	optH = 45 > optH? 45 : optH;
	var h = window.innerHeight - optH, w = window.innerWidth;
	var size = (h > w)? w - 10 : h - 10;
	board.setAttribute('style', 'width: '+size+'px; height: '+size+'px; max-width: 98%; max-height: 95%;');
}


function keyPress(e){

	
	var keynum;
	if(window.event) {                   
		keynum = e.keyCode;
	} else if(e.which){                   
		keynum = e.which;
	}
	var key = String.fromCharCode(keynum);
	
	
	if (key == 'r') { 
		game = load(htmlBoard,htmlOptions);
	}
}


function clickEvent(index) {
	if (over) {return;}
	
	
	if ((game.isP1Turn && game.isP1AI) || (!game.isP1Turn && game.isP2AI)) {return;}
	
	
	if (index < 0 || index >= game.squares.length) {return;}
	
	
	if (!game.selected) {
		game.selected = game.squares[index];
		game.squares[index].setSelected(true);
		return;
	}
	
	
	if (!game.isValid(game.selected,game.squares[index],false)) {
		game.selected.setSelected(false);
		game.selected = game.squares[index];
		game.selected.setSelected(true);
		return;
	}
	
	
	move(game.selected,game.squares[index],game);
}


function move(start, end, board) {
	if (!start || !end) {return false;}
	if (timeOut) {
		clearTimeout(timeOut);
		timeOut = null;
	}
	
	
	var endID = start.id;
	if (start.isBlackChecker() && end.y == 7) {
		endID = ID_BLACK_KING;
	} else if (start.isWhiteChecker() && end.y == 0) {
		endID = ID_WHITE_KING;
	}
	end.setID(endID);
	start.setID(ID_EMPTY);
	var dist = start.dist(end), isSkip = Math.abs(dist.dx) == 2, otherSkip = false;
	if (isSkip) {
		var middle = board.get(start.x + dist.dx/2, start.y + dist.dy/2);
		middle.setID(ID_EMPTY);
		otherSkip = end.getSkips(board).length > 0;
	}
	
	
	var isAI = (board.isP1Turn && board.isP1AI) || (!board.isP1Turn && board.isP2AI);
	if (otherSkip) {
		start.setSelected(false);
		if (!isAI) {end.setSelected(true);}
		else {timeOut2 = setTimeout(function(aiMove) {move(aiMove.start, aiMove.end, board);}, AI_DELAY, getAISkip(end,board));}
		board.selected = end;
		timeOut = setTimeout(switchPlayer, 3000, start, end, board);
	} else {
		switchPlayer(start,end,board);
	}
	
	return true;
}


function switchPlayer(start, end, board) {

	
	board.selected = null;
	start.setSelected(false);
	end.setSelected(false);
	
	
	board.isP1Turn = !board.isP1Turn;
	htmlOptions.setAttribute('style','border-top: 5px solid '+(board.isP1Turn? 'black;':'white;'));
	var isAI = (board.isP1Turn && board.isP1AI) || (!board.isP1Turn && board.isP2AI);
	if (isAI) {
		var aiMove = getAIMove(board.isP1Turn, board);
		if (aiMove) {
			timeOut2 = setTimeout(function(aiMove) {move(aiMove.start, aiMove.end, board);}, AI_DELAY, aiMove);
		} else {gameover();}
	}
	
	
	if (board.isGameOver()) {
		gameover();
	}
}

/** Переводит игру в режим "gameover", не позволяя пользователю взаимодействовать
* с доской и помещает текст GAME OVER в центр доски */
function gameover() {
	htmlBoard.innerHTML += '<span style="position: absolute; left: 50%; top: 50%; color: red;'+
	'transform: translate(-50%,-50%); font-weight: bold; font-size: 2em; background: rgba(235,235,235,0.9);'+
	'border-radius: 7px; text-align: center; padding: 5px;">GAME OVER!!!</span>';
	over = true;
}


function Game(squares, isP1AI, isP2AI) {
	this.squares = squares;
	this.isP1AI = isP1AI;
	this.isP2AI = isP2AI;
	this.isP1Turn = true;
	this.selected = null;

	
	this.get = function(x, y) {
		
		
		if (x%2 == y%2) {return null;}
		if (x < 0 || x > 7 || y < 0 || y > 7) {return null;}
		
		
		var index = y*4 + Math.floor(x/2);
		return index >= 0 && index < squares.length? this.squares[index] : null;
	}

	
	
	this.getAdjacent = function(square) {
		if (!square) {return [];}
		var x = square.x, y = square.y;
		return [this.get(x-1,y-1), this.get(x+1,y-1), this.get(x-1,y+1), this.get(x+1,y+1)];
	}

	
	this.isValid = function(start, end, ignoreTurn) {
		if (!start || !end || start.isEmpty() || !end.isEmpty()) {return false;}
		var dist = start.dist(end);
		
		
		var isKing = start.isKing();
		var isWhiteChecker = start.isWhiteChecker();
		if (!ignoreTurn && (isWhiteChecker ^ !game.isP1Turn)) { 
			return false;
		}
		if (!isKing) {
			if (isWhiteChecker && dist.dy > 0) {
				return false;
			} else if (!isWhiteChecker && dist.dy < 0) {
				return false;
			}
		}
		
		
		var isSkip = Math.abs(dist.dx) == 2;
		if (Math.abs(dist.dx) != Math.abs(dist.dy) || Math.abs(dist.dx) > 2 || Math.abs(dist.dx) == 0) {
			return false;
		}
		var middle = isSkip? game.get(start.x + dist.dx/2, start.y + dist.dy/2) : null;
		if (middle && !middle.isEnemy(start)) {
			return false;
		}
		
		
		var skipsAvail = false;
		var checkers = game.isP1Turn? game.getBlackCheckers() : game.getWhiteCheckers();
		for (var i=0; i<checkers.length; i++) {
			if (checkers[i].getSkips(game).length > 0) {
				skipsAvail = true;
				break;
			}
		}
		if (skipsAvail && start.getSkips(game).length == 0) {
			return false; 
		} else if (skipsAvail && !isSkip) {
			return false; 
		}
		
		return true;
	}

	
	this.isGameOver = function() {
		
		
		if (!squares || squares.length == 0) {return true;}
		var b = this.getBlackCheckers(), w = this.getWhiteCheckers();
		if (b.length == 0 || w.length == 0) {return true;}
		
		
		var checkers = this.isP1Turn? b : w;
		var move = false;
		for (var i=0; i<checkers.length; i++) {
			if (checkers[i].getMoves(true, this).length > 0) {
				move = true;
				break;
			}
		}
		
		return !move;
	}

	
	this.getBlackCheckers = function() {
		var checkers = [];
		for (var i=0; i<squares.length; i++) {
			if (squares[i].isBlackChecker()) {checkers.push(squares[i]);}
		}
		return checkers;
	}

	
	this.getWhiteCheckers = function() {
		var checkers = [];
		for (var i=0; i<squares.length; i++) {
			if (squares[i].isWhiteChecker()) {checkers.push(squares[i]);}
		}
		return checkers;
	}

	
	this.print = function() {
		var obj = '', n=0;
		for (var y=0; y<8; y++) {
			for (var x=0; x<8; x++) {
				if (x%2 == y%2) {obj += '_'; continue;}
				obj += squares[n++].id.id + '_';
			}
			obj += '\n';
		}
		return obj;
	}

	
	this.copy = function() {
		var points = [];
		for (var i=0; i<this.squares.length; i++) {
			points.push(this.squares[i].copy());
		}
		return new Game(points,this.isP1AI==true,this.isP2AI==true);
	}
}


function Square(x, y, id) {
	this.x = x; this.y = y;

	
	this.isEmpty = function() {return this.id.id == ID_EMPTY.id;}

	
	this.isKing = function() {
		return this.id.id == ID_BLACK_KING.id || this.id.id == ID_WHITE_KING.id;
	}

	
	this.isBlackChecker = function() {
		return this.id.id == ID_BLACK.id || this.id.id == ID_BLACK_KING.id;
	}

	
	this.isWhiteChecker = function() {
		return this.id.id == ID_WHITE.id || this.id.id == ID_WHITE_KING.id;
	}

	
	this.dist = function(endSquare) {
		if (!endSquare) {return {"dx": null, "dy": null};}
		var dx = endSquare.x - x, dy = endSquare.y - y;
		return {"dx": dx, "dy": dy};
	}

	
	this.isEnemy = function(test) {
		if (this.isEmpty() || test.isEmpty()) {return false;}
		if (this.isBlackChecker()) {return test.isWhiteChecker();}
		return test.isBlackChecker();
	}

	
	
	this.setSelected = function(selected) {
		var obj = document.getElementById('p'+x+''+y);
		if (selected) {
			var skipsAvail = false, right = !this.isEmpty() && (game.isP1Turn ^ this.isWhiteChecker());
			right = right && this.getMoves(false, game).length > 0;
			if (right) {
				var checkers = game.isP1Turn? game.getBlackCheckers() : game.getWhiteCheckers();
				for (var i=0; i<checkers.length; i++) {
					if (checkers[i].getSkips(game).length > 0) {
						skipsAvail = true;
						break;
					}
				}
				if (skipsAvail && this.getSkips(game).length == 0) {
					right = false;
				}
			}
			obj.style.backgroundColor = right? '#00FF00' : 'red';
		} else {
			obj.style.backgroundColor = 'black';
		}
	}

	
	this.setID = function(id) {
		this.id = id;
		var obj = document.getElementById('p'+x+''+y);
		obj.innerHTML = id.html;
	}
	this.setID(id);

	/**Получает доступные ходы, включая возможные скачки. Если доступен скачок,
	* обычные ходы не проверяются, так как скачок должен быть сделан. Возвращает
	* массив с конечным местоположением каждого хода, или пустой массив, если ходов не существует. */
	this.getMoves = function(ignoreTurn, board) {
		if (this.isEmpty()) {return [];}
		var moves = [];
		var possibleMoves = [board.get(x-2,y-2),board.get(x+2,y-2),board.get(x-2,y+2),board.get(x+2,y+2),
		board.get(x-1,y-1),board.get(x+1,y-1),board.get(x-1,y+1),board.get(x+1,y+1)];
		for (var i=0; i<possibleMoves.length; i++) {
			var m = possibleMoves[i];
			if (!m) {continue;}
			if (board.isValid(this,m,ignoreTurn)) {
				moves.push(m);
			}
			if (i == possibleMoves.length/2 && moves.length > 0) {
				break; 
			}
		}
		
		return moves;
	}

	/**Получает скачки, доступные шашке в этом квадрате. Если ни один скачок не
	* доступны, то возвращается пустой массив. Возвращает массив с конечным
	* местоположением каждого скачка. */
	this.getSkips = function(board) {
		if (this.isEmpty()) {return [];}
		var skips = [], white = this.isWhiteChecker(), king = this.isKing();
		var possibleMoves = [board.get(x-2,y-2),board.get(x+2,y-2),board.get(x-2,y+2),board.get(x+2,y+2)]
		for (var i=0; i<possibleMoves.length; i++) {
			var m = possibleMoves[i];
			if (!m || !m.isEmpty()) {continue;}
			var dist = this.dist(m);
			var enemy = this.isEnemy(board.get(this.x + dist.dx/2, this.y + dist.dy/2));
			if (king) {
				if (enemy) {skips.push(m);}
			} else {
				if (white) {
					if (enemy && dist.dy < 0) {skips.push(m);}
				} else {
					if (enemy && dist.dy > 0) {skips.push(m);}
				}
			}
		}
		return skips;
	}

	
	this.copy = function() {
		var cID = {"id": this.id.id, "html": this.id.html};
		return new Square(this.x, this.y, cID);
	}
}

/* -------------------- НАЧАЛО КОДА ИИ -------------------- */

/* Весовые коэффициенты для каждого сценария
 * Ключи:
 * W = весомость
 * S = безопасный
 * US = небезопасный
 * K = король
 */
var W_S_S = 10;
var W_US_S = 50;
var W_S_US = -25;
var W_US_US = -25;
var W_SKIP_ON_NEXT_MOVE = 25;
var W_ENEMY_SKIP_AFTER = -10;
var W_BECOMES_K = 75;
var W_GETS_STUCK = -10;
var W_OTHER_S = 40;


function Move(start, end, weight) {
	this.start = start;
	this.end = end;
	this.weight = weight;
}


function getAIMove(forBlackChecker, board) {
	var moves = [], checkers = forBlackChecker? board.getBlackCheckers() : board.getWhiteCheckers();
	if (checkers.length == 0) {
		return null;
	}
	
	
	var n = checkers.length;
	for (var i=0; i<n; i++) {
		var skips = checkers[i].getSkips(board);
		if (skips.length > 0) {
			for (var j=0; j<skips.length; j++) {
				var move = new Move(checkers[i], skips[j], 0);
				moves.push(move);
			}
		}
	}
	if (moves.length == 0) { 
		for (var i=0; i<n; i++) {
			var singleMoves = checkers[i].getMoves(true, board);
			for (var j=0; j<singleMoves.length; j++) {
				var move = new Move(checkers[i], singleMoves[j], 0);
				moves.push(move);
			}
		}
	}
	if (moves.length == 0) {return null;} 
	
	
	var max = 0;
	for (var i=0; i<moves.length; i++) {
		moves[i].weight = getWeight(moves[i], board);
		if (moves[i].weight > moves[max].weight) {
			max = i;
		}
	}
	
	
	var bestMoves = [];
	for (var i=0; i<moves.length; i++) {
		if (moves[i].weight == moves[max].weight) {
			bestMoves.push(moves[i]);
		}
	}
	var index = Math.floor(Math.random()*bestMoves.length);
	
	return bestMoves[index];
}


function getAISkip(square, board) {
	if (!square) {return null;}
	var moves = [], skips = square.getSkips(board);
	if (skips.length > 0) {
		for (var j=0; j<skips.length; j++) {
			var move = new Move(square, skips[j], 0);
			moves.push(move);
		}
	} else {return null;}
	
	
	var max = 0;
	for (var i=0; i<moves.length; i++) {
		moves[i].weight = getWeight(moves[i], board);
		if (moves[i].weight > moves[max].weight) {
			max = i;
		}
	}
	
	
	var bestMoves = [];
	for (var i=0; i<moves.length; i++) {
		if (moves[i].weight == moves[max].weight) {
			bestMoves.push(moves[i]);
		}
	}
	var index = Math.floor(Math.random()*bestMoves.length);
	
	return bestMoves[index];
}



function getWeight(move, board) {
	var weight = 0, after = board.copy();
	var start = after.get(move.start.x, move.start.y);
	var end = after.get(move.end.x, move.end.y);
	if (start.isEmpty()) {return weight;}
	var white = start.isWhiteChecker();
	
	
	var endID = start.id, newKing = false;
	if (start.isBlackChecker() && end.y == 7 && !start.isKing()) {
		endID = ID_BLACK_KING;
		newKing = true;
	} else if (start.isWhiteChecker() && end.y == 0 && !start.isKing()) {
		endID = ID_WHITE_KING;
		newKing = true;
	}
	end.id = endID;
	start.id = ID_EMPTY;
	var dist = start.dist(end), isSkip = Math.abs(dist.dx) == 2;
	if (isSkip) {
		var middle = after.get(start.x + dist.dx/2, start.y + dist.dy/2);
		middle.id = ID_EMPTY;
	}
	
	
	var safeBefore = isSafe(move.start, board);
	var safeAfter = isSafe(end, after);
	if (safeBefore && safeAfter) {
		weight += W_S_S;
	} else if (!safeBefore && safeAfter) {
		weight += W_US_S;
	} else if (safeBefore && !safeAfter) {
		weight += W_S_US;
	} else {weight += W_US_US;}
	
	
	var skipsAfter = end.getSkips(after).length > 0;
	if (skipsAfter) { 
		weight += W_SKIP_ON_NEXT_MOVE;
	}
	var movesAfter = end.getMoves(true, after);
	if (movesAfter.length == 0) { 
		weight += W_GETS_STUCK;
	}
	if (newKing) { 
		weight += W_BECOMES_K;
	}
	
	
	var safeCount = [0, 0];
	for (var i=0; i<2; i++) {
		var ignore = i == 0? start : end;
		var b = i == 0? board : after;
		var checkers = white? b.getWhiteCheckers() : b.getBlackCheckers();
		for (var j=0; j<checkers.length; j++) {
			var p = checkers[j];
			if (p.x != ignore.x || p.y != ignore.y) {
				if (isSafe(p, b)) {safeCount[i] ++;}
			}
		}
	}
	weight += ((safeCount[1] - safeCount[0])*W_OTHER_S);
	
	return weight;
}


function isSafe(square, board) {
	if (!square || !board || square.isEmpty()) {return true;}
	var adj = board.getAdjacent(square);
	
	
	var x = square.x, y = square.y;
	for (var i=0; i<adj.length; i++) {
		var s = adj[i];
		if (!s) {continue;}
		if (square.isEnemy(s)) {
			var skips = s.getSkips(board);
			for (var j=0; j<skips.length; j++) {
				var d = s.dist(skips[j]);
				if (x == s.x + d.dx/2 && y == s.y + d.dy/2) {
					return false; 
				}
			}
		}
	}
	
	return true;
}