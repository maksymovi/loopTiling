
/**
 * @description Basic sleep function
 * @param {number} ms 
 * @returns {Promise} timeOut
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

/**
 * 
 * @param {Element} matrixElement 
 * @param {number} rows
 * @param {columns}
 */


async function generateMatrix(matrixElement, rows, columns)
{
    //matrixElement.innerHTML = '' //clear the inner html before making a grid
    for(let i = 0; i < rows; i++)
    {
        let newRow = document.createElement("div");
        newRow.classList.add("matrix-row");
        for(let j = 0; j < columns; j++)
        {
            let newCell = document.createElement("div");
            newCell.classList.add("matrix-cell");
            newRow.appendChild(newCell);
            
        }
        matrixElement.appendChild(newRow);
        await sleep(500);

    }
}
/**
 * 
 * @param {Element} matrixElement 
 * @param {number} rows 
 * @param {number} columns 
 */
async function color(matrixElement, rows, columns)
{
    let cellList = matrixElement.getElementByClassName(matrix-cell)
    for(e of CellList)
    {
        color = e.style.getPropertyValue('background-color');
        if(color == '')
        {
            color = 
        }
    }
}

// async function matrixTest()
// {
//     let newMatrix = document.getElementById("matrix");
//     await generateMatrix(newMatrix, 16, 16);
// }

async function makeThreeMatrices()
{
    let matMul = document.getElementById("matrix");

}

//matrixTest();