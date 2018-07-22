var grid = {
    cols : 10,
    rows : 10,
    rules : [[]],
    cells : [[]],
    init : function() {
    },
    step : function() {
    },
    genSoup : function(rows, cols, density) {
    },

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
        display.canvas = document.getElementById("theGrid");
        display.ctx = display.canvas.getContext("2d");
    },
    resize : function() {
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

var ui = {
    interval : undefined;
    init : function() {
    },
    step : function() {
    },
    play : function() {
        clearInterval(interval);
        interval = setInterval(step, 100);
        document.getElementById("playStatus").innerHTML = "&#9654;"
    },
    pause : function() {
        clearInterval(interval);
        document.getElementById("playStatus").innerHTML = "&#9646;&#9646;"
    },
};


function init() {
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
function pause() {
}

function error(input) {
    document.getElementById("status").innerHTML = input;
    console.log(input);
}

function ftoi(x) {
    return x | 0
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

function updRules() {
    error("");
    rules = document.getElementById("rulesInput").value;
    regexp = /^\s*b[0-8]+\/s[0-8]+\s*$/i;
}
