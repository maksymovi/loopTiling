/*
Code for matrix multiplication visualization by Maksym Prokopovych
*/



const defaultColor = [0, 70, 40]
const maxColor = [0, 100, 100]
const selectColor = [100, 100, 50]

class loopTilingMatrix
{
    /**
     * @constructor
     * @param {number} rows number of rows in first matrix
     * @param {number} columns number of columns in first matrix
     * @param {Element} div div in which to put this matrix
     * @param {number} cacheSize length of one cache block
     * @param {number} offset offset from start of cache in matrix, defaults to 1 
     */
    constructor(rows, columns, div, cacheSize, offset = 0)
    {
        this.colorMatrix = []; //easier to keep the matrix colors in an array than extract from the document every time and convert to hsl
        this.matrix = [];
        let defColorString = this.hslCondense(defaultColor);
        this.rows = rows;
        this.columns = columns;
        this.cacheSize = cacheSize;
        for (let i = 0; i < rows; i++)
        {
            let divRow = [];
            let colorRow = [];
            let newRow = document.createElement("div");
            newRow.classList.add("matrix-row")
            for (let j = 0; j < columns; j++)
            {
                let newCell = document.createElement("div");
                newCell.classList.add("matrix-cell");
                newCell.style.backgroundColor = defColorString;

                if (offset == 0)
                {
                    newCell.style.borderLeft = "1px solid blue";
                }
                if (offset == cacheSize - 1)
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
        div.appendChild(document.createElement("p")); //Text below the matrix if needed
    }
    /**
     * Decodes an HSL string into values
     * @private
     * @param {string} hslStr hsl string to decode
     * @returns {number[]} 3-tuple list containing hsl values
     */
    hslExtract(hslStr)
    {
        //https://www.30secondsofcode.org/js/s/to-hsl-array
        return hslStr.match(/\d+/g).map(Number);
    }
    /**
     * Format hsl array into string
     * @private
     * @param {number[]} arr hsl 3-tuple to be converted into hsl string 
     * @returns {string} hsl formatted string
     */
    hslCondense(arr)
    {
        return "hsl(" + String(arr[0]) + "," + String(arr[1]) + "%," + String(arr[2]) + "%)"
    }

    /**
     * Sets the color of a cell
     * @param {number} r row to set
     * @param {number} c column to set
     * @param {number[]} color color to set to, in hsl
     */
    setColor(r, c, color)
    {
        this.matrix[r][c].style.backgroundColor = this.hslCondense(color);
        this.colorMatrix[r][c] = color;

    }
    /**
     * Adds a 3-tuple to this cell's hsl color 3-tuple
     * @param {number} r row of matrix element to color
     * @param {number} c column of matrix element to color
     * @param {number[]} color color to add to the cell color, in hsl
     */
    addColor(r, c, color)
    {
        let cellColor = this.colorMatrix[r][c];


        // Turn "hsv(h,s%,l%)" into [h,s,v]
        //let cellColorArr = this.hslExtract(cellColor);
        //let colorArr = this.hslExtract(color);



        //let newColor = [];
        for (let i = 0; i < 3; i++)
        {
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
    getColor(r, c)
    {
        return this.colorMatrix[r][c];
    }
}

/**
 * Tracks cache hits and misses
 */
class cacheTracker
{
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
        if (index == -1) //cache miss
        {
            //append to end, shift if above max
            if (self.cacheOrder.length >= cacheSize)
            {
                self.cacheOrder.shift();
            }
            self.cacheOrder.push(value);
            self.cacheMisses++;
            return false; //miss returns false
        } else
        { //cache hit
            //correct lru status
            for (let i = index; i < self.cacheOrder.length - 1; i++)
            {
                self.cacheOrder[i] = self.cacheOrder[i + 1];
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


class loopTilingSet
{
    /**
     * 
     * @param {Generator} algorithmGenerator algorithm generator returns a generator which returns a 3-tuple, row, col of the result matrix and an index
     * @param {number} stepPeriod time in milliseconds to step
     * @param {number} mat1height height of first matrix multiplied
     * @param {number} common width of first matrix and height of second matrix
     * @param {number} mat2width width of second matrix multiplied
     * @param {Element} div div to stuff everything into
     * @param {number} cacheLineCount how many cache lines we can store
     * @param {number} cacheLineSize size of one cache line in cells
     * @param {number} offset number of cells from start of cache line
     */
    constructor(algorithmGenerator, stepPeriod, mat1height, common, mat2width, div, cacheLineCount = 16, cacheLineSize = 16, offset = 0)
    {


        //matrix creation formatting

        const matTemplate = document.getElementById("loop-tiling-template");
        let clone = matTemplate.content.cloneNode(true);

        clone = clone.children[0];

        let matrixDivs = clone.children[0];
        let valueDivs = clone.children[1];


        this.mat1Div = matrixDivs.children[0];
        this.mat2Div = matrixDivs.children[2];
        this.resultDiv = matrixDivs.children[4];
        this.cacheMissDiv = valueDivs.children[0];
        this.cacheHitDiv = valueDivs.children[1];
        this.hitRatioDiv = valueDivs.children[2];

        this.mat1 = new loopTilingMatrix(mat1height, common, this.mat1Div, cacheLineSize, offset);
        this.mat2 = new loopTilingMatrix(common, mat2width, this.mat2Div, cacheLineSize, offset);
        this.result = new loopTilingMatrix(mat1height, mat2width, this.resultDiv, cacheLineSize, offset);


        div.innerHTML = ""; //clear the div
        div.appendChild(clone);

        //save stuff that needs to be saved

        this.algorithmGenerator = algorithmGenerator;
        this.stepPeriod = stepPeriod;
        this.mat1height = mat1height;
        this.common = common;
        this.mat2width = mat2width;
        this.cacheLineSize = cacheLineSize;
        this.offset = offset % cacheLineSize; //offset must be less than cacheSize
        //setup cache trackers, common cache tracker for all arrays
        this.cacheTrack = new cacheTracker(cacheLineCount);
        //using ints for cache of all three matricies, need a constant difference to make sure they never overlap
        //perhaps its better to use a cache tracker for each its better to have one common amount of cache being accessed.
        this.cacheStep = 2 * Math.pow(Math.max(this.mat1height, this.mat2width, this.common), 2);
        this.mat1Misses = 0;
        this.mat2Misses = 0;
        this.resultMisses = 0;
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.cacheHitRatio = 1.0;

        div.addEventListener("click", () => this.run(), {once: true}); //hacky way to log onclick
    }
    /** Sleeps for a certain amount of time when paired with an await
     * @private
     * @param {number} ms Time in milliseconds to sleep for
     * @returns Promise resolving after a certain amount of ms
     */
    sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * @async
     * Runs matrix multiplication visualization
     */
    async run()
    {
        let colorDelta = []
        for (let i = 0; i < 3; i++)
            //change color of result cell by a delta every time to reach a final maxColor value
            colorDelta[i] = Math.floor((maxColor[i] - defaultColor[i]) / this.common);

        for (let value of this.algorithmGenerator)
        {
            let [row, col, index] = value;
            //first we do the cache hit stuff
            //execute reads/writes
            this.mat1Misses += this.cacheTrack.access(Math.floor((this.offset + row * this.mat1.columns + index) / this.cacheLineSize)) ? 0 : 1;
            this.mat2Misses += this.cacheTrack.access(Math.floor((this.offset + index * this.mat2.columns + col + this.cacheStep) / this.cacheLineSize)) ? 0 : 1;
            this.resultMisses += this.cacheTrack.access(Math.floor((this.offset + row * this.result.columns + col + 2 * this.cacheStep) / this.cacheLineSize)) ? 0 : 1;


            this.cacheHits = this.cacheTrack.getCacheHits();
            this.cacheMisses = this.cacheTrack.getCacheMisses();
            this.cacheHitRatio = this.cacheHits / (this.cacheHits + this.cacheMisses);

            if (this.stepPeriod >= 0) //negative sleep implies only simulation, thus only draw the html in this case
            {
                //save old colors to process later
                let mat1Color = this.mat1.getColor(row, index);
                let mat2Color = this.mat2.getColor(index, col);
                //set colors temporarily to the "select colors"
                this.mat1.setColor(row, index, selectColor);
                this.mat2.setColor(index, col, selectColor);


                this.cacheMissDiv.innerHTML = "Cache Misses: " + this.cacheMisses.toString();
                this.cacheHitDiv.innerHTML = "Cache Hits: " + this.cacheHits.toString();
                this.hitRatioDiv.innerHTML = "Cache Hit Ratio: " + this.cacheHitRatio.toFixed(5);
                this.mat1Div.lastChild.innerHTML = "Matrix 1 Misses: " + this.mat1Misses.toString();
                this.mat2Div.lastChild.innerHTML = "Matrix 2 Misses: " + this.mat2Misses.toString();
                this.resultDiv.lastChild.innerHTML = "Result Matrix Misses: " + this.resultMisses.toString();


                //in case we want to draw the set instantly
                if (this.stepPeriod > 0)
                    await this.sleep(this.stepPeriod);

                //restore colors, have new color be added to result
                this.mat1.setColor(row, index, mat1Color);
                this.mat2.setColor(index, col, mat2Color);
                this.result.addColor(row, col, colorDelta);

            }

        }
        //TODO: add click to restart simulation possibly
        return this.cacheHitRatio;
    }
}

/**
 * Generator for various loop tiling operation orders
 * @generator
 * @param {number} mat1height Height of matrix 1 and result matrix
 * @param {number} mat2width Width of matrix 2 and result matrix
 * @param {number} common Width of matrix 1 and height of matrix 2, common as it is shared between them
 * @param {number} blockSize1 First tile size parameter, tune from 1 to mat1height
 * @param {number} blockSize2 Second tile size parameter, tune from 1 to mat2width
 * @param {number} blockSize3 Third tile size parameter, tune from 1 to common
 * @returns a 3-tuple containing the row, column and "index" to compute in the result matrix
 */
function* matrixMultGen(mat1height, mat2width, common, blockSize1, blockSize2, blockSize3)
{
    for (let ii = 0; ii < mat1height; ii += blockSize1)
    {
        for (let jj = 0; jj < mat2width; jj += blockSize2)
        {
            for (let kk = 0; kk < common; kk += blockSize3)
            {
                for (let i = ii; i < Math.min(mat1height, ii + blockSize1); i++)
                {
                    for (let j = jj; j < Math.min(mat2width, jj + blockSize2); j++)
                    {
                        for (let k = kk; k < Math.min(common, kk + blockSize3); k++)
                        {
                            yield [i, j, k]
                        }
                    }
                }
            }
        }
    }
    return
}


/**
 * Brute forces to get the best tiling given these parameters
 * @param {number} mat1height 
 * @param {number} mat2width 
 * @param {number} common 
 * @param {number} cacheLineCount 
 * @param {number} cacheLineSize 
 * @param {number} offset 
 * @returns 2-tuple, first containing hit rate, second containing an array with optimal params to matrixMultGen
 */
function getBestTiling(mat1height, mat2width, common, cacheLineCount, cacheLineSize, offset = 0)
{
    currentMax = 0.0;
    maxSettings = [0, 0, 0];
    //avoids cache collisions as in loopTilingSet
    let cacheStep = 2 * Math.pow(Math.max(mat1height, mat2width, common), 2);
    for (let i = 1; i <= mat1height; i++)
    {
        for (let j = 1; j <= mat2width; j++)
        {
            for (let k = 1; k <= common; k++)
            {
                let generator = matrixMultGen(mat1height, mat2width, common, i, j, k);
                //run loop tiling calculation
                let cacheTrack = new cacheTracker(cacheLineCount);
                for (let vals of generator)
                {
                    let [row, col, index] = vals;
                    cacheTrack.access(Math.floor((offset + row * common + index) / cacheLineSize));
                    cacheTrack.access(Math.floor((offset + index * mat2width + col + cacheStep) / cacheLineSize));
                    cacheTrack.access(Math.floor((offset + row * mat2width + col + 2 * cacheStep) / cacheLineSize));
                }
                let hitRatio = cacheTrack.getCacheHits()/(cacheTrack.getCacheMisses() + cacheTrack.getCacheHits());
                if (currentMax <= hitRatio) //check if better than previous best
                {
                    console.log( currentMax == hitRatio ? [hitRatio, [i, j, k]].toString() + " is equal to last" : ("Bumped with " + [hitRatio, [i, j, k]].toString()));
                    currentMax = hitRatio;
                    maxSettings = [i, j, k];
                    
                    
                }
                delete cacheTrack;
            }
        }
    }
    return [currentMax, maxSettings];
}

/**
 * Example on how to create visualize matrix multiplication
 */
 function matrixMultExample()
 {
     let div = document.getElementById("looptiling");
 
     let mat1height = 50;
     let mat2width = 50;
     let common = 50;
 
     generator = matrixMultGen(mat1height, mat2width, common, 8, 10, 1);
     let lts = new loopTilingSet(generator, 1, mat1height, common, mat2width, div, 30, 8);
 
    //lts.run;
 }



/**
 * Example of how to find optimal tiling
 */
function bestTilingExample()
{
    let mat1height = 14;
    let mat2width = 14;
    let common = 14;
    let cacheLineCount = 20;
    let cacheLineSize = 8;
    let offset = 0;
    let ret = getBestTiling(mat1height, mat2width, common, cacheLineCount, cacheLineSize, offset);
    console.log(ret);
}

//matrixMultExample();
//bestTilingExample();


let div = document.getElementById("looptiling");
 
let mat1height = 50;
let mat2width = 50;
let common = 50;

generator = matrixMultGen(mat1height, mat2width, common, 8, 10, 1);
let lts = new loopTilingSet(generator, 1, mat1height, common, mat2width, div, 30, 8);
