//TODO: Clean this shit up

//TODO: get user input via POST
//TODO: scale button size based on specified grid size
const buttonSize = 30;
var settings = {
    height: 20,
    width: 20,
    //0 = easy, 1 = medium, etc.
    difficulty: 0
};
//List of objects with coords that determine where the bombs are
var minesweeperGrid = [];
//Add objects with x and y vars to this, x and y specifying the square with a flag
var flaggedSquares = [];
var gameRunning = true;
var debug = false;
const debugEnabled = true;


//---Getters---
function getLocationHasBomb(gridX, gridY)
{
    for (obj of minesweeperGrid)
    {
        if (obj.x == gridX && obj.y == gridY)
        {
            return true;
        }
    }

    return false;
}

function getLocationElement(gridX, gridY)
{
    return $("#b".concat(gridX, "-", gridY));
}

function searchForBombs(centreX, centreY)
{
    let bombsFound = 0;

    for (i = -1; i <= 1; i++)
    {
        for (i2 = -1; i2 <= 1; i2++)
        {
            if (i == 0 && i2 == 0)
            {
                continue;
            }
            else
            {
                if ((centreX + i) <= settings.width - 1 &&
                    (centreX + i) >= 0 &&
                    (centreY + i2) <= settings.height - 1 &&
                    (centreY + i2) >= 0)
                {
                    if (getLocationHasBomb(centreX + i, centreY + i2))
                    {
                        bombsFound++;
                    }
                }
            }
        }
    }

    return bombsFound;
}

//---Setters---

function setNumberSquareVisible(squareX, squareY, element)
{
    element.addClass("revealedButton");
    element.addClass("rNumberSquare");

    let bombsFound = searchForBombs(squareX, squareY);

    if (bombsFound > 0)
    {
        element.text("".concat(bombsFound));
    }
}

function toggleDebugMode()
{
    debug = !debug;

    if (debug)
    {
        for (x of minesweeperGrid)
        {
            let element = getLocationElement(x.x, x.y);

            if (element.text() != "B")
            {
                element.text("DB");
            }
        }
    }
    else
    {
        for (x of minesweeperGrid)
        {
            let element = getLocationElement(x.x, x.y);

            if (element.text() != "B")
            {
                element.text("");
            }
        }
    }
}

function reset()
{
    minesweeperGrid = []
    flaggedSquares = []
    $("#grid").empty();
    generateButtons();
    populateField();
    gameRunning = true;
}

//returns an array of coordinate objects (has x and y) denoting where the 0 bomb squares were
//remember to check if a revealed square is outside of the grid
function revealSquaresAroundPoint(pointX, pointY)
{
    console.log("DEBUG: pointX: ".concat(pointX, " pointY: ", pointY));
    //we are assuming this is a 0 square
    let zeroSquares = [];

    for (i = -1; i <= 1; i++)
    {
        for (i2 = -1; i2 <= 1; i2++)
        {
            console.log("DEBUG: i: ".concat(i, " i2: ", i2));
            if (i == 0 && i2 == 0)
            {
                console.log("continued");
                continue;
            }
            else
            {
                if ((pointX + i) <= settings.width - 1 &&
                    (pointX + i) >= 0 &&
                    (pointY + i2) <= settings.height - 1 &&
                    (pointY + i2) >= 0)
                {
                    let currX = pointX + i;
                    let currY = pointY + i2;

                    console.log("DEBUG: currX: ".concat(currX, " currY: ", currY));

                    let element = getLocationElement(currX, currY)

                    if (!element.hasClass("revealedButton"))
                    {
                        setNumberSquareVisible(currX, currY, element);

                        if (searchForBombs(currX, currY) == 0)
                        {
                            zeroSquares.push({
                                x: currX,
                                y: currY
                            });
                        }
                    }
                }
            }
        }
    }

    console.log("DEBUG: exited");

    return zeroSquares;
}

//---Setup---
function generateButtons()
{
    //Get grid size
    //Calculate number of buttons that can fit on a row and in the whole grid
    //insert appropriate number of DIVs
    let gridDiv = document.getElementById("grid");

    for (i = 0; i < settings.height; i++)
    {
        for (i2 = 0; i2 < settings.width; i2++)
        {
            gridDiv.innerHTML += "<div class='button' id='".concat("b", i2, "-", i, "' onclick='buttonClicked(", i2, ", ", i, ")' oncontextmenu='onRightClick(", i2, ", ", i, "); return false;'> </button>");
        }
    }   
}

function populateField()
{
    //decide where the bombs are
    let bombCount = 0;

    switch (settings.difficulty)
    {
        default:
            //default to easy
        case 0:
            bombCount = 10;
            break;
        case 1:
            bombCount = 40;
            break;

        case 2:
            bombCount = 99;
            break;
        
        case 3:
            bombCount = (settings.height * settings.width) / 2;
            break;
    }

    for (i = 0; i < bombCount; i++)
    {
        let bombX = Math.floor(Math.random() * settings.width);
        let bombY = Math.floor(Math.random() * settings.height);

        if (!getLocationHasBomb(bombX, bombY))
        {
            minesweeperGrid.push({
                x: bombX,
                y: bombY
            });
        }
        else
        {
            i--;
            continue;
        }
    }
}

//---Event based---
function buttonClicked(buttonX, buttonY)
{
    console.log("press");
    if (gameRunning)
    {
        let element = getLocationElement(buttonX, buttonY);

        if (getLocationHasBomb(buttonX, buttonY))
        {
            element.addClass("bomb");
            element.text("B");
            gameRunning = false;
            //game over man
            return;
        }

        //Search for bombs
        let bombsFound = searchForBombs(buttonX, buttonY);

        //Populate tiles with the appropriate number
        element.addClass("rNumberSquare");

        setNumberSquareVisible(buttonX, buttonY, element);

        if (bombsFound > 0)
        {
            element.text("".concat(bombsFound));
        }
        else
        {
            //TODO: Reveal all surrounding 0 tiles
            console.log("Initial reveal around point");
            let toRevealAround = revealSquaresAroundPoint(buttonX, buttonY);

            console.log("Entering reveal around loop");
            while (toRevealAround.length > 0)
            {
                for (square of toRevealAround)
                {
                    toRevealAround.push(revealSquaresAroundPoint(square.x, square.y));
                    toRevealAround = toRevealAround.filter(function(obj) { return obj.x != square.x || obj.y != square.y; });
                }
            }
        }
    }
}

function onRightClick(buttonX, buttonY)
{
    if (gameRunning)
    {
        flaggedSquares.push({
            x: buttonX,
            y: buttonY,
        });

        let element = getLocationElement(buttonX, buttonY);
        element.addClass("revealedButton");
        element.addClass("flag");
        element.text("F");
    }
    return false;
}



//Make the border of the game scale to fit the game area
$("#grid").width(buttonSize * settings.width);
$("#grid").height(buttonSize * settings.height);

if (!debugEnabled)
{
    $("#debugButton").remove();
}

generateButtons();
populateField();