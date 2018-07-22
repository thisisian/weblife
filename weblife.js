'use strict';

function InvalidArgumentException(message) {
    this.message = message;
    this.name = "InvalidArgumentException"
}

class RuleSet {
    constructor(ruleString) {
        this.ruleArray = this.parseRuleString(ruleString);
    }

    parseRuleString(ruleString) {
        let re = /^\s*b([0-8]+)\/s([0-8]+)\s*$/i;
        let ruleList = ruleString.match(re);
        let ruleArray =[[0, 0, 0, 0, 0, 0, 0, 0, 0],    // Birth
                        [0, 0, 0, 0, 0, 0, 0, 0, 0]];   // Survive
        if (ruleList == null) {
            throw new InvalidArgumentException("Invalid rulestring");
        }
        ruleList[1]
            .split("")
            .map(x => parseInt(x))
            .forEach( x => ruleArray[0][x] = 1 );
        ruleList[2]
            .split("")
            .map(x => parseInt(x))
            .forEach( x => ruleArray[1][x] = 1 );
        return ruleArray;
    }

    getRuleString() {
        let str = "b";
        for (let i = 0; i < this.ruleArray[0].length; ++i) {
            if (this.ruleArray[0][i] === 1)
                str += i;
        }
        str += "/s";
        for (let i = 0; i < this.ruleArray[1].length; ++i) {
            if (this.ruleArray[1][i] === 1)
                str += i;
        }
        console.log(str);
        return str;
    }
}

class Engine {
    constructor(cols, rows, ruleString, density) {
        this.cols = cols;
        this.rows = rows;
        this.rules = new RuleSet(ruleString);
        this.cells = new Uint8ClampedArray(new ArrayBuffer(cols * rows));
        this.buff = new Uint8ClampedArray(new ArrayBuffer(cols * rows));
        this.generateSoup(density);
    }

    step() {
        let i;
        for (i = 0; i < this.cols * this.rows; ++i) {
            this.buff[i] = this.evaluateCell(i);
        }
        let temp = this.buff;
        this.buff = this.cells;
        this.cells = temp;
    }

    generateSoup(density) {
        let i;
        for (i = 0; i < this.rows*this.cols; ++i) {
            if (Math.random() < density) {
                this.cells[i] = 1;
            } else {
                this.cells[i] = 0;
            }
        }
    }

    evaluateCell(arrayIndex) {
        let currentState = this.getCellIndex(arrayIndex);
        let sum = this.sumNeighbors(arrayIndex);
        if (currentState === 0) {
            return this.rules.ruleArray[0][sum];
        } else if (currentState === 1) {
            return this.rules.ruleArray[1][sum];
        } else {
            console.log("evaluateCell: invalid inital state");
        }
    }

    sumNeighbors(arrayIndex) {
        let coords = this.getCoordinates(arrayIndex);
        let x = coords[0];
        let y = coords[1];
        return this.getCell([x+1, y+1]) +
               this.getCell([x, y+1]) +
               this.getCell([x-1, y+1]) +
               this.getCell([x-1, y]) +
               this.getCell([x+1, y]) +
               this.getCell([x+1, y-1]) +
               this.getCell([x, y-1]) +
               this.getCell([x-1, y-1]);
    }

    setCell(coords, state) {
        this.cells[this.getArrayIndex(coords)] = state;
    }

    toggleCell(coords) {
        if (this.cells[this.getArrayIndex(coords)] === 1) {
            this.cells[this.getArrayIndex(coords)] = 0;
        } else {
            this.cells[this.getArrayIndex(coords)] = 1;
        }
    }

    getCell(coords) {
        return this.cells[this.getArrayIndex(coords)]
    }

    getCellIndex(index){
        return this.cells[index];
    }

    // Returns the array index corresponding to coordinates
    getArrayIndex(coords) {
        let x = (coords[0] % this.cols + this.cols) % this.cols;
        let y = (coords[1] % this.rows + this.rows) % this.rows;
        return x + y * this.cols;
    }

    getCoordinates(arrayIndex) {
        return [arrayIndex % this.cols, floor(arrayIndex / this.cols)];
    }

    getCols() {
        return this.cols;
    }

    getRows() {
        return this.rows;
    }

    printGrid() {
        var str = "";
        var i;
        for (i = 0; i < this.rows*this.cols; ++i) {
            if (i % this.cols == 0) {
                str += "\n"
            }
            if (this.getCellIndex(i) === 1)
                str += "1";
            else
                str += "0";
        }
        console.log(str);
    }
}

class Display  {
    constructor (engine) {
        this.engine = engine;
        this.cellSize = undefined;
        this.top = undefined;
        this.left = undefined;
        this.cols = undefined;
        this.rows = undefined;
        this.canvas = document.getElementById("theGrid");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("click", (event) => {
            let coords = this.findCoord(event);
            this.engine.toggleCell(coords);
            console.log(this.engine.evaluateCell(this.engine.getArrayIndex(coords)))
            this.update();
        }, false);

        this.loadEngine(this.engine);
        this.update();
    }

    // Finds coordinates of click location
    findCoord(event) {
        let x = floor((event.pageX - this.left) / this.cellSize);
        let y = floor((event.pageY - this.top) / this.cellSize);
        return [x,y];
    }

    loadEngine(engine) {
        this.engine = engine;
        this.cols = this.engine.getCols();
        this.rows = this.engine.getRows();
        let maxHeight = 0.5 * window.innerHeight;
        let maxWidth = 0.7 * window.innerWidth;
        if (false) { //TODO: Fix this
            this.canvas.width = maxWidth;
            this.canvas.height = (this.rows / this.cols)* maxWidth;
            this.cellSize = this.canvas.width / this.cols;
        } else {
            this.canvas.height = maxHeight;
            this.canvas.width = (this.cols / this.rows) * maxHeight;
            this.cellSize = this.canvas.height / this.rows;
        }
        this.top = this.canvas.offsetTop;
        this.left = this.canvas.offsetLeft;
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var xpos = 0, ypos = 0;
        var i;
        this.ctx.strokeStyle = "#E0E0E0";
        for (i = 0; i < this.cols*this.rows; i++) {
            if (i % this.cols === 0 && i !== 0) {
                ypos += this.cellSize;
                xpos = 0;
            }
            if (this.engine.getCellIndex(i) === 1) {
                this.ctx.fillRect(xpos, ypos, this.cellSize, this.cellSize);
            }
            if (this.cellSize > 5) {
                this.ctx.strokeRect(xpos, ypos, this.cellSize, this.cellSize);
            }
            xpos += this.cellSize;
        }
    }
}

let ui = {
    interval: undefined,
    engine: undefined,
    display: undefined,

    init : function () {
        this.engine = new Engine(10, 10, "b3/s23", 0.5);
        this.display = new Display(this.engine);
    },

    newMap : function () {
        let width = parseInt(document.getElementById("width").value);
        let height = parseInt(document.getElementById("height").value);
        let density = parseFloat(document.getElementById("density").value);
        let rules = this.engine.rules.getRuleString();

        this.engine =  new Engine(width, height, rules, density);
        this.display = new Display(this.engine);
    },

    step : function () {
        this.engine.step();
        this.display.update();
    },

    play : function () {
        clearInterval(this.interval);
        this.interval = setInterval(this.engine.step(), 100);
        document.getElementById("playStatus").innerHTML = "&#9654;";
    },

    pause : function () {
        clearInterval(this.interval);
        document.getElementById("playStatus").innerHTML = "&#9646;&#9646;";
    },

    updateRules : function () {
        let ruleString = document.getElementById("rulesInput").value;

    },

    sendError : function (input) {
        document.getElementById("status").innerHTML = input;
        console.log(input);
    },
};

function floor(x) {
    return x | 0;
}

