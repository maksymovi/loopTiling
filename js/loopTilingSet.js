const defaultColor = [7, 0, 0]
const maxColor = [7, 0, 100]
const selectColor = [100, 100, 50]

class loopTilingMatrix {
    /**
     * @constructor
     * @param {number} rows number of rows in first matrix
     * @param {number} columns number of columns in first matrix
     * @param {Element} div div in which to put this matrix
     * @param {number} cacheSize length of one cache block
     * @param {number} offset offset from start of cache in matrix, defaults to 1 
     */
    constructor(rows, columns, div, cacheSize, offset= 0) {
        this.colorMatrix = []; //easier to keep the matrix colors in an array than extract from the document every time and convert to hsl
        this.matrix = [];
        let defColorString = this.hslCondense(defaultColor);
        this.rows = rows;
        this.columns = columns;
        for (let i = 0; i < rows; i++) {
            let divRow = [];
            let colorRow = [];
            let newRow = document.createElement("div");
            newRow.classList.add("matrix-row")
            for (let j = 0; j < columns; j++) {
                let newCell = document.createElement("div");
                newCell.classList.add("matrix-cell");
                newCell.style.backgroundColor = defColorString;
                //add cache border coloring
                if(offset == 0)
                {
                    newCell.style.borderLeft = "1px solid blue";
                }
                if(offset == cacheSize - 1)
                {
                    newCell.style.borderRight = "1px solid blue";
                }
                newRow.appendChild(newCell);
                colorRow.push(defaultColor.slice());
                divRow.push(newCell);
                offset = (offset + 1) % cacheSize;
            }
            div.appendChild(newRow);
            this.matrix.push(divRow);
            this.colorMatrix.push(colorRow);
        }
    }
    /**
     * Decodes an HSL string into values
     * @private
     * @param {string} hslStr hsl string to decode
     * @returns {number[]} 3-tuple list containing hsl values
     */
    hslExtract(hslStr) {
        //https://www.30secondsofcode.org/js/s/to-hsl-array
        return hslStr.match(/\d+/g).map(Number);
    }
    /**
     * Format hsl array into string
     * @private
     * @param {number[]} arr hsl 3-tuple to be converted into hsl string 
     * @returns {string} hsl formatted string
     */
    hslCondense(arr) {
        return "hsl(" + String(arr[0]) + "," + String(arr[1]) + "%," + String(arr[2]) + "%)"
    }

    /** Sets the color of a cell
     * 
     * @param {number} r row to set
     * @param {number} c column to set
     * @param {number[]} color color to set to, in hsl
     */
    setColor(r, c, color) {
        this.matrix[r][c].style.backgroundColor = this.hslCondense(color);
        this.colorMatrix[r][c] = color;

    }
    /**
     * 
     * @param {number} r row of matrix element to color
     * @param {number} c column of matrix element to color
     * @param {number[]} color color to add to the cell color, in hsl
     */
    addColor(r, c, color) {
        let cellColor = this.colorMatrix[r][c];


        // Turn "hsv(h,s%,l%)" into [h,s,v]
        //let cellColorArr = this.hslExtract(cellColor);
        //let colorArr = this.hslExtract(color);



        //let newColor = [];
        for (let i = 0; i < 3; i++) {
            cellColor[i] += color[i];
        }



        //TODO: possibly check if color is out of bounds

        this.colorMatrix[r][c] = cellColor;
        this.matrix[r][c].style.backgroundColor = this.hslCondense(cellColor);
    }
    /**
     * Gets the color of a matrix cell
     * @param {number} r row to access
     * @param {number} c column to access
     * @returns {number[]} 3-tuple containing values in hsl
     */
    getColor(r, c) {
        return this.colorMatrix[r][c];
    }
}

/**
 * Tracks cache hits and misses
 */
class cacheTracker {
    /** 
     * @constructor
     * @param {number} cacheSize 
     */
    constructor(cacheSize)
    {
        self.cacheSize = cacheSize;
        self.cacheOrder = [];
        self.cacheHits = 0;
        self.cacheMisses = 0;
    }

    //TODO: possibly correct this to differentiate full and less full cache for efficiency
    /**
     * 
     * @param {*} value thing we are caching, ie cache lines
     * @returns {boolean} True if cache hit, false if cache miss
     */
    access(value)
    {
        //array is oldest first, lru last
        let index = self.cacheOrder.indexOf(value); //check if already in array
        if(index == -1) //cache miss
        {
            //append to end, shift if above max
            if(self.cacheOrder.length >= cacheSize)
            {
                self.cacheOrder.shift();
            }
            self.cacheOrder.push(value);
            self.cacheMisses++;
            return false; //miss returns false
        }
        else
        {   //cache hit
            //correct lru status
            for(let i = index; i < self.cacheOrder.length - 1; i++)
            {
                self.cacheOrder[i] = self.cacheOrder[i+1];
            }
            self.cacheOrder[self.cacheOrder.length - 1] = value;
            self.cacheHits++;
            return true; //hit returns true
        }
    }
    /**
     * Get number of cache hits
     * @returns {number} number of cache hits
     */
    getCacheHits()
    {
        return self.cacheHits;
    }

    /**
     * Get number of cache misses
     * @returns {number} number of cache misses
     */
    getCacheMisses()
    {
        return self.cacheMisses;
    }
}


class loopTilingSet {
    /**
     * 
     * @param {Generator} algorithmGenerator algorithm generator returns a generator which returns a 3-tuple, row, col of the result matrix and an index
     * @param {number} stepPeriod time in miliseconds to step
     * @param {number} mat1height height of first matrix multiplied
     * @param {number} common width of first matrix and height of second matrix
     * @param {number} mat2width width of second matrix multiplied
     * @param {Element} div div to stuff everything into
     */
    constructor(algorithmGenerator, stepPeriod, mat1height, common, mat2width, div, cacheStorage=16, cacheSize = 16, offset = 0) {


        //matrix creation formatting

        const matTemplate = document.getElementById("loop-tiling-template");
        let clone = matTemplate.content.cloneNode(true);

        clone = clone.children[0];


        let mat1Div = clone.children[0];
        let mat2Div = clone.children[2];
        let resultDiv = clone.children[4];

        this.mat1 = new loopTilingMatrix(common, mat1height, mat1Div, cacheSize, offset);
        this.mat2 = new loopTilingMatrix(mat2width, common, mat2Div, cacheSize, offset);
        this.result = new loopTilingMatrix(mat2width, mat1height, resultDiv, cacheSize, offset);

        div.appendChild(clone);

        //save stuff that needs to be saved

        this.algorithmGenerator = algorithmGenerator;
        this.stepPeriod = stepPeriod;
        this.mat1height = mat1height;
        this.common = common;
        this.mat2width = mat2width;
        this.cacheSize = cacheSize;
        this.offset = offset;
        //setup cache trackers, common cache tracker for all arrays
        this.cacheTrack = cacheTracker(cacheStorage);



        //spawn thread to deal with loop tiling

        this.iterateMultiplication()

    }
    /** Sleeps for a certain amount of time when paired with an await
     * @private
     * @param {number} ms Time in milliseconds to sleep for
     * @returns Promise resolving after a certain amoutn of ms
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * @async
     * @private
     * Iterates matrix multiplication, internal function, should not need to be called
     */
    async iterateMultiplication() {

        let colorDelta = []
        for (let i = 0; i < 3; i++)
            //change color of result cell by a delta every time to reach a final maxColor value
            colorDelta[i] = Math.floor((maxColor[i] - defaultColor[i]) / this.common);

        for (let value of this.algorithmGenerator) {
            let [row, col, index] = value;
            //save old colors to process later
            let mat1Color = this.mat1.getColor(row, index);
            let mat2Color = this.mat2.getColor(index, col);

            let resultColor = this.result.getColor(row, col)

            this.mat1.setColor(row, index, selectColor);
            this.mat2.setColor(index, col, selectColor);

            //mat1Color[2]++;
            //mat2Color[2]++;
            for (let i = 0; i < 3; i++)
                resultColor[i] += colorDelta[i]; //changing color of result.
            
            await this.sleep(this.stepPeriod);


            this.mat1.setColor(row, index, mat1Color);

            this.mat2.setColor(index, col, mat2Color);

            this.result.setColor(row, col, resultColor);

        }
    }
}

function* standardMatrixMultGenerator(mat1height, mat2width, common) {
    for (let i = 0; i < mat1height; i++) {
        for (let j = 0; j < mat2width; j++) {
            for (let k = 0; k < common; k++) {
                yield [i, j, k];
            }
        }
    }
    return null;
}

function* looptilingMatrixMultGenerator(mat1height, mat2width, common, blockSize) {
    for (let ii = 0; ii < mat1height; ii += blockSize) {
        for (let jj = 0; jj < mat2width; jj += blockSize) {
            for (let kk = 0; kk < common; kk += blockSize) {
                for (let i = ii; i < Math.min(mat1height, ii + blockSize); i++) {
                    for (let j = jj; j < Math.min(mat2width, jj + blockSize); j++) {
                        for (let k = kk; k < Math.min(common, kk + blockSize); k++) {
                            yield [i, j, k]
                        }
                    }
                }
            }
        }
    }
    return

}

function matrixTest() {
    let div = document.getElementById("looptiling");

    let mat1height = 32;
    let mat2width = 32;
    let common = 32;

    generator = standardMatrixMultGenerator(mat1height, mat2width, common)
    //generator = looptilingMatrixMultGenerator(mat1height, mat2width, common, 6);
    let lts = new loopTilingSet(generator, 16.6666667, mat1height, common, mat2width, div);


}

matrixTest();