function ruleSet (ruleString) {
    this.ruleArray = this.parseRuleString(ruleString);

    parseRuleString(ruleString) {
        // Confirm correct format, fail if its wrong
        // return array
    }

}

function dimentions (cols, rows) {
    this.dimentions = [cols, rows];
}

function engine (cols, rows, ruleString) {
    this.cols = cols;
    this.rows = rows;
    this.rules = new RuleSet(ruleString);
    this.cells = Array(cols * rows);

    step: function () {
        // TODO
        // this function should call the necessary functions to deal with
        // stepping the grid from one state to the next
    },

    generateSoup: function (density) {
        // TODO
        // should iterate thru cell array and fill a square with density
    },

    getCells: function() {
        return this.cells;
    }

    getCols: function() {
        return this.cols;
    }


}

function display (cols, rows, cellSize) {

    this.cellSize = cellSize;
    this.jtop = 0;
    this.left = 0;
    this.canvas = document.getElementById("theGrid");
    this.ctx = this.canvas.getContext("2d");

    resize(cols, rows);

    resize: function (cols, rows) {
        let maxHeight = 0.5 * window.innerHeight;
            this.canvas.width = maxWidth;
            this.canvas.height = (grid.rows / grid.cols) * maxWidth;
            this.cellSize = this.canvas.width / grid.cols;
        } else {
            this.canvas.height = maxHeight;
            this.gridDisplay.width = (grid.cols / grid.rows) * maxHeight;
            this.cellSize = this.gridDisplay.height / grid.rows;
        }
        this.top = this.gridDisplay.offsetTop;
        this.left = this.gridDisplay.offsetLeft;
    },

    update: function () {
        gridDisplay.init();
        var xpos = 0, ypos = 0;
        this.ctx.strokeStyle = "#E0E0E0";
        for (i = 0; i < grid.cols * grid.rows; i++) {
            if (i % grid.cols === 0 && i !== 0) {
                ypos += this.cellSize;
                xpos = 0;
            }
            if (grid.cells[i] === "1") {
                this.ctx.fillRect(xpos, ypos, this.cellSize, this.cellSize);
            }
            this.ctx.strokeRect(xpos, ypos, this.cellSize, this.cellSize);
            xpos += this.cellSize;
        }
    },

};

let ui = {
    interval: undefined;

    function sendError(input) {
        document.getElementById("status").innerHTML = input;
        console.log(input);
    }
    init : function () {
    };
    ,
    step : function () {
    }
    ,
    let interval;
    play : function () {
        clearInterval(interval);
        interval = setInterval(step, 100);
        document.getElementById("playStatus").innerHTML = "&#9654;";
    }
    ,
    pause : function () {
        clearInterval(interval);
        document.getElementById("playStatus").innerHTML = "&#9646;&#9646;";
    }

    updateRules : function () {
        rules = document.getElementById("rulesInput").value;
        // TODO: Finish
    }
}

// Gets called on page load
function init() {
    window.onresize = gridDisplay.update();
    gridDisplay.canvas.addEventListener("click", function toggle(event) {
        let x = ftoi((event.pageX - gridDisplay.left) / gridDisplay.cellSize);
        let y = ftoi((event.pageY - gridDisplay.top) / gridDisplay.cellSize);
        let i = y * grid.cols + x;
        if (grid.cells[i] === "1") {
            grid.cells = strReplace(grid.cells, i, "0");
        } else {
            grid.cells = strReplace(grid.cells, i, "1");
        }
        console.log(grid.cells);
        gridDisplay.update(grid);
    }, false);
    gridDisplay.update(grid);
}

function pause() {
}


function ftoi(x) {
    return x | 0;
}

function loadBitmap() {
    pbm = mapToPbm(document.getElementById("gridInput").value);
    if (pbm !== "error") {
        console.log(grid.update(pbm));
        if (grid.update(pbm) !== "error")
            gridDisplay.init();
        gridDisplay.update(grid);
    }
}

function updRules() {
}

