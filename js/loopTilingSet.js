



class loopTilingMatrix
{
    /**
     * 
     * @param {number} rows number of rows in first matrix
     * @param {number} columns number of columns in first matrix
     * @param {Element} div div in which to put this matrix
     */
    constructor(rows, columns, div, defaultColor = [7, 0, 0])
    {
        this.colorMatrix = []; //easier to keep the matrix colors in an array than extract from the document every time and convert to hsl
        this.matrix = []; 
        let defColorString = this.hslCondense(defaultColor);
        this.rows = rows;
        this.columns = columns;
        for(let i = 0; i < rows; i++)
        {
            let divRow = [];
            let colorRow = [];
            let newRow = document.createElement("div");
            newRow.classList.add("matrix-row")
            for(let j = 0; j < columns; j++)
            {
                let newCell = document.createElement("div");
                newCell.classList.add("matrix-cell");
                newCell.style.backgroundColor = defColorString;
                newRow.appendChild(newCell);
                colorRow.push(defaultColor);
                divRow.push(newCell);
            }
            div.appendChild(newRow);
            this.matrix.push(divRow);
            this.colorMatrix.push(colorRow);
        }
    }

    hslExtract(hslStr)
    {
        //https://www.30secondsofcode.org/js/s/to-hsl-array
        return hslStr.match(/\d+/g).map(Number);
    }

    hslCondense(arr)
    {
        return "hsl(" + String(arr[0]) + "," + String(arr[1]) + "%," + String(arr[2]) + "%)"
    }

    /** Sets the color of a cell
     * 
     * @param {number} r row to set
     * @param {number} c column to set
     * @param {number} color color to set to
     */
    setColor(r, c, color)
    {
        this.matrix[r][c].style.backgroundColor = this.hslCondense(color);

    }
    addColor(r, c, color)
    {
        let cellColor = this.colorMatrix[r][c];


        // Turn "hsv(h,s%,l%)" into [h,s,v]
        //let cellColorArr = this.hslExtract(cellColor);
        //let colorArr = this.hslExtract(color);

        

        //let newColor = [];
        for(let i = 0; i < 3; i++)
        {
            cellColor[i] += color[i]; 
        }
        
        

        //TODO: possibly check if color is out of bounds

        this.colorMatrix[r][c] = cellColor;
        this.matrix[r][c].style.backgroundColor = this.hslCondense(cellColor);
    }

    getColor(r, c)
    {
        return this.colorMatrix[r][c];
    }
}



class loopTilingSet
{
    /**
     * 
     * @param {Generator} algorithmGenerator algorithm generator returns a generator which returns a 3-tuple, row, col of the result matrix and an index
     * @param {number} stepPeriod time in miliseconds to step
     * @param {number} mat1height height of first matrix multiplied
     * @param {number} common width of first matrix and height of second matrix, width and height of the result matrix
     * @param {number} mat2width width of second matrix multiplied
     * @param {Element} div div to stuff everything into
     * @param {list} workingColor a 3-tuple of HSL colors
     */
    constructor(algorithmGenerator, stepPeriod, mat1height, common, mat2width, div, workingColor)
    {

        const matTemplate = document.getElementById("loop-tiling-template");
        let clone = matTemplate.content.cloneNode(true);
        

        let mat1Div = clone.children[0];
        let mat2Div = clone.children[2];
        let resultDiv = clone.children[4];

        let mat1 = new loopTilingMatrix(common, mat1height, mat1Div);
        let mat2 = new loopTilingMatrix(mat2width, common, mat2Div);
        let result = new loopTilingMatrix(common, common, resultDiv);

        div.appendChild(clone);


        this.algorithmGenerator = algorithmGenerator;


        this.stepPeriod = stepPeriod;

    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    async iterateMultiplication()
    {

        const selectColor = [350, 100, 50]

        for(let value of this.algorithmGenerator)
        {
            let [row, col, index] = value;
            //save old colors to process later
            let mat1Color = this.mat1.getColor(row, col + index);
            let mat2Color = this.mat2.getColor(col + index, row);

            let resultColor = this.result.getColor(row, col)

            this.mat1.setColor(row, col + index, selectColor);
            this.mat2.setColor(col + index, row, selectColor);

            //mat1Color[2]++;
            //mat2Color[2]++;
            resultColor[2]++; //increment value to make it deeper
            await this.sleep(this.stepPeriod);


            this.mat1.setColor(row, col + index, mat1Color);

            this.mat2.setColor(col + index, row, mat2Color);

            this.result.setColor(row, col, resultColor);
            
        }
    }
}

function* matrixMultGenerator(mat1height, mat2width, common)
{
    for(let i = 0; i < mat1height; i++)
    {
        for(let j = 0; j < cols; j++ )
    }
}

function matrixTest()
{
    let div = document.getElementById("looptiling");

    let lts = new loopTilingSet()
}

