var request = { 
	"Grid" : "",
	"Rules" : "b3/s23",
        "Density" : "0.5",
        "Width" : "10",
        "Height" : "10",
        "New" : "0",
}

var response = {
    Pbm : "",
    Error: "",
}

var grid = {
    cols : 12,
    rows : 10,
    cells : "000000000000000000000000000100000000000010000000001110000000000000000000000000000000000000000000000000000000000000000000",
    update: function(input) {
        split = input.split(" ");
        cols = parseInt(split[0]);
        rows = parseInt(split[1]);
        cells = split[2].trim();
        if (this.cells.length != this.cols * this.rows) {
            error("grid.update: Invalid map!");
            return "error";
        }
        this.cols = cols;
        this.rows = rows;
        this.cells = cells;
    },
}

var display = {
    cellSize : 30,
    canvas : 0,
    ctx : 0,
    top : 0,
    left : 0,
    init : function() {
        var maxHeight = 0.5 * window.innerHeight;
        var maxWidth = 0.7 * window.innerWidth;
        if ((grid.cols/grid.rows) > (maxWidth/maxHeight)) {
            this.canvas.width = maxWidth;
            this.canvas.height = (grid.rows/grid.cols) * maxWidth;
            this.cellSize = this.canvas.width / grid.cols;
        } else {
            this.canvas.height = maxHeight;
            this.canvas.width = (grid.cols/grid.rows) * maxHeight ;
            this.cellSize = this.canvas.height / grid.rows;
        }
        this.top = this.canvas.offsetTop;
        this.left = this.canvas.offsetLeft;
        console.log(this.top)
        console.log(this.left)
    },
    update : function() {
        display.init();
        var xpos = 0, ypos = 0;
        this.ctx.strokeStyle = "#E0E0E0";
        for (i = 0; i < grid.cols * grid.rows; i++) {
            if (i % grid.cols == 0 && i != 0) {
                ypos += this.cellSize;
                xpos = 0;
            }
            if (grid.cells[i] == '1') {
                this.ctx.fillRect(xpos, ypos, this.cellSize, this.cellSize)
            }
            this.ctx.strokeRect(xpos, ypos, this.cellSize, this.cellSize);
            xpos += this.cellSize
        }
    },
}


function init() {
    display.canvas = document.getElementById("theGrid");
    display.ctx = display.canvas.getContext("2d");
    document.getElementById("gridInput").innerText = "000000000000\n000000000000\n000100000000\n000010000000\n001110000000\n000000000000\n000000000000\n000000000000\n000000000000\n000000000000\n";
    window.onresize = display.update()
    display.canvas.addEventListener('click', function toggle(event) {
        console.log(event.pageX)
        var x = ftoi((event.pageX - display.left)/display.cellSize)
        var y = ftoi((event.pageY - display.top)/display.cellSize)
        var i = y*grid.cols + x
        console.log("x: " + String(x) + " y: " + String(x))
        console.log(grid.cells[i])
        if (grid.cells[i] == '1') {
            grid.cells = strReplace(grid.cells, i, '0');
        } else {
            grid.cells = strReplace(grid.cells, i, '1');
        }
        console.log(grid.cells)
        display.update(grid);
    }, false);
    display.update(grid);
}

var interval;
function play() {
    clearInterval(interval);
    interval = setInterval(step, 100);
    document.getElementById("playStatus").innerHTML = "&#9654;"
    
}


function sendRequest() {
    json = JSON.stringify(request);
    console.log(json);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response.Pbm = this.responseText;
            console.log("Reply:" + this.responseText)
            grid.update(response.Pbm);
            display.update(grid);
        }
    }
    xhttp.open("POST", "relay.cgi", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(json);
}

function error(input) {
    document.getElementById("status").innerHTML = input;
    console.log(input);
}

function ftoi(x) {
    return x | 0
}

// Replace character i in string s with character c
function strReplace(s, i, c) {
    return s.substr(0, i) + c + s.substr(i+1);
}

function mapToPbm(map) {
    var i, cols = 0
    var grid = "";
    map = map.trim()
    for (i = 0; i < map.length; i++) {
        if (map[i] != '\n') {
            grid = grid + map[i]
        } else {
            if (cols == 0) {
                cols = i;
            }
        }
    }
    grid = grid.trim();
    var rows = ftoi(grid.length/cols);
    if (rows * cols != grid.length) {
        error("Invalid map!");
        return "error";
    }
    return String(cols) + " " + String(rows) + " " + grid
}

function loadBitmap() {
    pbm = mapToPbm(document.getElementById("gridInput").value);
    if (pbm != "error") {
        console.log(grid.update(pbm))
    if (grid.update(pbm) != "error")
        display.init();
        display.update(grid);
    }
}

function soup() {
    request.Width = document.getElementById("randW").value;
    request.Height = document.getElementById("randH").value;
    request.Density = document.getElementById("randD").value;
    request.New = "1";
    sendRequest();
    request.New = "0";
}

function updRules() {
    error("");
    rules = document.getElementById("rulesInput").value;
    regexp = /^\s*b[0-8]+\/s[0-8]+\s*$/i;
    if (regexp.test(rules)) {
	request.Rules = document.getElementById("rulesInput").value;
    } else {
        error("Invalid rulestring!");
    }
}

function pause() {
    clearInterval(interval);
    document.getElementById("playStatus").innerHTML = "&#9646;&#9646;"
}

function step() {
    request.Grid = String(grid.cols) + " " + String(grid.rows) + " " + String(grid.cells);
    sendRequest();
}
