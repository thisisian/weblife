'use strict';

function InvalidArgumentException(message) {
    this.message = message;
    this.name = "InvalidArgumentException";
}

/**
 * Class for storing rule array and parsing rule strings.
 */
class RuleSet {
    /**
     * Builds a rule set from given rule string in B/S format.
     *
     * @param {string} ruleString Rule for which to build rule set from.
     * Takes B/S format
     * (see http://www.conwaylife.com/w/index.php?title=Rulestring)
     */
    constructor(ruleString) {
        this.ruleArray = this.parseRuleString(ruleString);
    }

    /**
     * Parses ruleString and returns a rule array for determining
     * next generation of cells.
     *
     * @param {string} ruleString Rule string in B/S notation
     * @returns {} Resulting rule array
     */
    parseRuleString(ruleString) {
        let re = /^\s*b([0-8]+)\/s([0-8]+)\s*$/i;
        let ruleList = ruleString.match(re);
        let ruleArray =[[0, 0, 0, 0, 0, 0, 0, 0, 0],    // Birth
                        [0, 0, 0, 0, 0, 0, 0, 0, 0]];   // Survive
        if (ruleList === null) {
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

    /**
     * Returns rule string in B/S format.
     * @returns {string} Rule string in B/S format.
     */
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

/**
 * Class holding methods relating to evaluation of cell grid and
 * determining next generation.
 */
class Engine {
    /**
     * Create an engine instance.
     *
     * @param numCols Number of columns in cell grid.
     * @param numRows Number of rows in cell grid.
     * @param ruleString Initial rule string governing generational behavior.
     * @param density Density of initial, random pattern.
     */
    constructor(numCols, numRows, ruleString, density) {
        this.cols = numCols;
        this.rows = numRows;
        this.rules = new RuleSet(ruleString);
        this.cells = new Uint8ClampedArray(new ArrayBuffer(numCols * numRows));
        this.buff = new Uint8ClampedArray(new ArrayBuffer(numCols * numRows));
        this.generateSoup(density);
    }

    /**
     * Steps the engine to the next generation.
     */
    step() {
        let i;
        for (i = 0; i < this.cols * this.rows; ++i) {
            this.buff[i] = this.nextState(i);
        }
        let temp = this.buff;
        this.buff = this.cells;
        this.cells = temp;
    }

    /**
     * Generates a random pattern of given density.
     * @param density Density of pattern where 0.0 < density < 1.0
     */
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

    /**
     * Evaluates given cell's state and returns value of new
     * state in next generation.
     * @param arrayIndex Index of cell to be evaluated.
     * @returns {number} New state of cell.
     */
    nextState(arrayIndex) {
        let currentState = this.getCellStateFromIndex(arrayIndex);
        let sum = this.sumNeighbors(arrayIndex);
        if (currentState === 0) {
            return this.rules.ruleArray[0][sum];
        } else if (currentState === 1) {
            return this.rules.ruleArray[1][sum];
        } else {
            console.log("nextState: invalid initial state");
        }
    }

    /**
     * Sums the states of the Moore neighbors of cell at given index
     *
     * @param arrayIndex Index of cell whose neighbors will be summed.
     * @returns {number} Sum of states of neighbors
     */
    sumNeighbors(arrayIndex) {
        let coords = this.indexToCoord(arrayIndex);
        let x = coords[0];
        let y = coords[1];
        return this.getCellState([x+1, y+1]) +
               this.getCellState([x, y+1]) +
               this.getCellState([x-1, y+1]) +
               this.getCellState([x-1, y]) +
               this.getCellState([x+1, y]) +
               this.getCellState([x+1, y-1]) +
               this.getCellState([x, y-1]) +
               this.getCellState([x-1, y-1]);
    }

    /**
     * Set cell at given coordinates to a given state.
     * @param coords Coordinate of cell to change.
     * @param state State to change cell to.
     */
    setCell(coords, state) {
        this.cells[this.coordToIndex(coords)] = state;
    }

    /**
     * Updates the engine's rule set.
     *
     * @param ruleString {string} String to be parsed to
     * generate new rule set from.
     */
    setRules(ruleString) {
        this.rules = new RuleSet(ruleString);
    }

    /**
     * Toggles cell at coordinate location on/off.
     * @param coords {[number,number]} x, y coordinate of cell to be toggled
     */
    toggleCell(coords) {
        if (this.cells[this.coordToIndex(coords)] === 1) {
            this.cells[this.coordToIndex(coords)] = 0;
        } else {
            this.cells[this.coordToIndex(coords)] = 1;
        }
    }

    /**
     * Returns cell state at given coordinates. Respects toroid plane.
     *
     * @param coords Coordinates of cell to get state from.
     * @returns {number} State of cell.
     */
    getCellState(coords) {
        return this.cells[this.coordToIndex(coords)];
    }

    /**
     * Returns cell state at given index in cell array.
     *
     * @param index Index of cell to get state from.
     * @returns {number} State of cell.
     */
    getCellStateFromIndex(index){
        return this.cells[index];
    }


    /**
     * Returns array index corresponding to given coordinates.
     *
     * @param coords Coordinates to translate to array index.
     * @returns {number} Array index of given coordinates.
     */
    coordToIndex(coords) {
        let x = (coords[0] % this.cols + this.cols) % this.cols;
        let y = (coords[1] % this.rows + this.rows) % this.rows;
        return x + y * this.cols;
    }

    /**
     * Translates an cell grid index to coordinates.
     * @param arrayIndex Index to translate.
     * @returns {[number,number]} x/y coordinates of index.
     */
    indexToCoord(arrayIndex) {
        return [arrayIndex % this.cols, floor(arrayIndex / this.cols)];
    }

    /**
     * Returns the number of columns of cell grid.
     * @returns {number} Number of columns of cell grid.
     */
    getCols() {
        return this.cols;
    }

    /**
     * Returns the number of rows of cell grid.
     * @returns {number} Number of rows of cell grid.
     */
    getRows() {
        return this.rows;
    }

    /**
     * Prints the cell grid to the console.
     */
    printGrid() {
        let str = "";
        let i;
        for (i = 0; i < this.rows*this.cols; ++i) {
            if (i % this.cols === 0) {
                str += "\n";
            }
            if (this.getCellStateFromIndex(i) === 1)
                str += "1";
            else
                str += "0";
        }
        console.log(str);
    }
}

/**
 * Class holding methods relating to display of cell grid.
 */
class Display {
    /**
     * Constructs a display object for given engine.
     *
     * @param engine Engine which is being displayed.
     */
    constructor (engine) {
        this.engine = engine;
        this.cellSize = undefined;
        this.top = undefined;
        this.left = undefined;
        this.cols = undefined;
        this.rows = undefined;
        this.canvas = document.getElementById("display");
        this.container = document.getElementById("displayContainer")
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("click", (event) => {
            let coords = this.findCoord(event);
            this.engine.toggleCell(coords);
            this.update();
        }, false);

        this.updateGeometry();
        this.update();
    }

    /**
     * Returns x,y coordinates of click event on display grid.
     * @param clickEvent Click event.
     * @returns {[number,number]} x,y coordinate of clicked cell
     */
    findCoord(clickEvent) {
        let x = floor((clickEvent.pageX - this.left) / this.cellSize);
        let y = floor((clickEvent.pageY - this.top) / this.cellSize);
        return [x,y];
    }

    /**
     * Updates display from engine state
     */
    update() {
        let xpos = 0, ypos = 0;
        let i;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "#E0E0E0";
        for (i = 0; i < this.cols*this.rows; i++) {
            if (i % this.cols === 0 && i !== 0) {
                ypos += this.cellSize;
                xpos = 0;
            }
            if (this.engine.getCellStateFromIndex(i) === 1) {
                this.ctx.fillRect(xpos, ypos, this.cellSize, this.cellSize);
            }
            if (this.cellSize > 5) {
                this.ctx.strokeRect(xpos, ypos, this.cellSize, this.cellSize);
            }
            xpos += this.cellSize;
        }
    }

    /**
     * Updates geometry of display on page
     */
    updateGeometry() {
        this.cols = this.engine.getCols();
        this.rows = this.engine.getRows();
        let maxWidth = displayContainer.clientWidth;
        let maxHeight = displayContainer.clientHeight;
        console.log("maxWidth: " + maxWidth + "maxHeight" + maxHeight);
        let displayAspectRatio = this.cols / this.rows;
        let containerAspectRatio = maxWidth / maxHeight;
        if (displayAspectRatio > containerAspectRatio) { 
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
}

/**
 * Object holding methods which are called by web page.
 * Holds current engine and display objects as well.
 */
let ui = {
    PLAYBACK_SPEED: 20,
    interval: undefined,
    engine: undefined,
    display: undefined,

    init : function () {
        this.engine = new Engine(10, 10, "b3/s23", 0.5);
        this.display = new Display(this.engine);
        return this;
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
        this.interval = setInterval(() => {
                this.engine.step();
                this.display.update();
            }, this.PLAYBACK_SPEED);
        document.getElementById("playStatus").innerHTML = "&#9654;";
    },

    pause : function () {
        clearInterval(this.interval);
        document.getElementById("playStatus").innerHTML = "&#9646;&#9646;";
    },

    setRules : function () {
        let ruleString = document.getElementById("rulesInput").value;
        try {
            this.engine.setRules(ruleString);
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    },

    sendError : function (input) {
        document.getElementById("status").innerHTML = input;
        console.log(input);
    },

    resizeDisplay: function() {
        this.display.updateGeometry();
        this.display.update();
    }
};

function floor(x) {
    return x | 0;
}

function init() {
    ui.init();
    window.onresize = () => {ui.resizeDisplay()};
}
