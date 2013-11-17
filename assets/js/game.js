// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d"); // use this context to draw on the canvas
canvas.width = 480;
canvas.height = 224;
var wrapper = document.getElementsByClassName("game")[0];
wrapper.appendChild(canvas);

// Initial variables
var fps = 60;
var mapDim = 7;
var map = [];
var blockSize = 32;
var playerSize = 16;
var numMoves;
var canMove;

function loadMap(mapId) {
    map.length = mapDim;
    for (var i = 0; i < mapDim; i++) {
	map[i] = initArray(mapDim, 0);
    }
    
    // Use info from the loaded map
    switch(mapId) {
    case 1:
	map[0][0] = 1;
	map[1][0] = 1;
	map[5][0] = 1;
	map[6][0] = 1;

	map[0][1] = 1;
	map[6][1] = 1;

	map[0][5] = 1;
	map[6][5] = 1;

	map[0][6] = 1;
	map[1][6] = 1;
	map[5][6] = 1;
	map[6][6] = 1;

	win.x = 3;
	win.y = 3;
	break;
    }

    player.x = 0;
    player.y = 0;
}

function initArray(length, value) {
    var arr = [];
    arr.length = length;
    for (var i = 0; i < length; i++) {
	arr[i] = value;
    }
    return arr;
}

// Game objects
var player = {
    x: 0,
    y: 0
};

var win = {
    x: 0,
    y: 0
};


// Handle keyboard input
var keysUp = [];
var keysUsed = [32, 37, 38, 39, 40];

addEventListener("keydown", function(e) {
    for (var i = 0; i < keysUsed.length; i++) {
	if (e.keyCode == keysUsed[i]) { // Don't want to affect other keys like F5
	    e.preventDefault(); // To prevent scrolling with arrow keys and spacebar
	}
    }
}, false);

addEventListener("keyup", function(e) {
    keysUp[e.keyCode] = true;
    // e.preventDefault(); // This does nothing with keyup event
}, false);

// Reset
function reset() {
    numMoves = 0;
    loadMap(1);
    canMove = true;
    clearKeys(); // To get rid of any leftover input from last game
}

function clearKeys() { // No longer prone to multiple input
    for (var i = 0; i < keysUsed.length; i++) {
	delete keysUp[keysUsed[i]];
    }
}

function update() {
    if (canMove) {
	if (38 in keysUp) { // Up arrow key
	    checkSides(0, -1);
	    clearKeys();
	}
	if (40 in keysUp) { // Down arrow key
	    checkSides(0, 1);
	    clearKeys();
	}
	if (37 in keysUp) { // Left arrow key
	    checkSides(-1, 0);
	    clearKeys();
	}
	if (39 in keysUp) { // Right arrow key
	    checkSides(1, 0);
	    clearKeys();
	}
    }

    if (32 in keysUp) { // Hit the spacebar to reset the game
	stopGame();
	startGame();
	clearKeys();
    }
}

function checkSides(dx, dy) {
    if (dx !== 0) {
	var nx = player.x + dx;
	if (!(nx < 0 || nx >= mapDim)) {
	    if (map[nx][player.y] == 1) {
		player.x = nx;
	    } else {
		slideBlock(dx, 0);
	    }
	    numMoves++;
	}
    } else if (dy !== 0) {
	var ny = player.y + dy;
	if (!(ny < 0 || ny >= mapDim)) {
	    if (map[player.x][ny] == 1) {
		player.y = ny;
	    } else {
		slideBlock(0, dy);
	    }
	    numMoves++;
	}
    }
}

function slideBlock(dx, dy) {
    if (dx !== 0) {
	var nx = player.x + dx;
	var py = player.y;
	var cx;
	while (map[nx][py] == 0 && nx > 0 && nx < mapDim - 1) {
	    nx += dx;
	}

	if ((nx == 0 || nx == mapDim - 1) && map[nx][py] == 0) {
	    cx = nx;
	} else {
	    cx = nx - dx;
	}

	map[player.x][py] = 0;
	map[cx][py] = 1;
	player.x = cx;

    } else if (dy !== 0) {
	var ny = player.y + dy;
	var px = player.x; 
	while (map[px][ny] == 0 && ny > 0 && ny < mapDim - 1) {
	    ny += dy;
	}

	if ((ny == 0 || ny == mapDim - 1) && map[px][ny] == 0) {
	    cy = ny;
	} else {
	    cy = ny - dy;
	}

	map[px][player.y] = 0;
	map[px][cy] = 1;
	player.y = cy;
    }
}

// Draw everything over again
// Stuff remains on the screen
// Coordinate is top-left corner
function render() {
    // Background
    ctx.fillStyle = "rgb(180, 180, 180)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Map
    drawMap();

    // Player
    var offset = (blockSize - playerSize) / 2;
    ctx.fillStyle = "rgb(180, 180, 0)";
    ctx.fillRect(player.x * blockSize + offset, player.y * blockSize + offset, playerSize, playerSize);

    // Win spot
    var offset2 = (blockSize - 8) / 2;
    ctx.fillStyle = "rgb(180, 0, 0)";
    ctx.fillRect(win.x * blockSize + offset2, win.y * blockSize + offset2, 8, 8);

    // Move counter
    var movesText = "Moves: " + numMoves;
    ctx.fillStyle = "white";
    ctx.fillText(movesText, 224 + 4, 16);
    
    // Checks for game over here since render comes after update
    if (gameOver()) {
	stopGame();
	drawWinMessage();
    }
}

function drawMap() {
    for (var i = 0; i < mapDim; i++) {
	for (var j = 0; j < mapDim; j++) {
	    if (map[i][j] == 1) {
		ctx.fillStyle = "rgb(0, 0, 128)";
		ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize);
		ctx.strokeStyle = "rgb(255, 255, 255)";
		ctx.strokeRect(i * blockSize, j * blockSize, blockSize, blockSize);
	    }
	}
    }
}


function gameOver() {
    return player.x == win.x && player.y == win.y;
}

function run() {
    update();
    render();
}

var intervalId;

function startGame() {
    reset();
    if (typeof intervalId == "undefined") intervalId = setInterval(run, 1000 / fps);
}

function stopGame() {
    canMove = false;
    //clearInterval(intervalId); // This is for ending the game, no more loops
}

function drawWinMessage() {
    var winText = "Congratulations! You won in " + numMoves + " moves.";
    ctx.fillStyle = "white";
    ctx.fillText(winText, 224 + 4, 32);
}

startGame();
