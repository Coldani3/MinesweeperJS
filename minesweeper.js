//TODO: get user input via POST
//TODO: scale button size based on specified grid size
const buttonSize = 30;
var started = false;

var settings = {
    height: 20,
    width: 20,
    //0 = easy, 1 = medium, etc.
    difficulty: 0,
    bombCount: 0
};

var hasPopulated = false;
//List of objects with coords that determine where the bombs are
var minesweeperGrid = [];
//Add objects with x and y vars to this, x and y specifying the square with a flag
var flaggedSquares = [];
var gameRunning = true;
var debug = false;
const debugEnabled = true;
var customBombCountElement;


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

function isFlagged(gridX, gridY)
{
    for (obj of flaggedSquares)
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

    for (let i = -1; i <= 1; i++)
    {
        for (let i2 = -1; i2 <= 1; i2++)
        {
            if (i == 0 && i2 == 0)
            {
                continue;
            }
            else
            {
                let currX = centreX + i;
                let currY = centreY + i2;

                if (currX <= settings.width - 1 &&
                    currX >= 0 &&
                    currY <= settings.height - 1 &&
                    currY >= 0)
                {
                    if (getLocationHasBomb(currX, currY))
                    {
                        bombsFound++;
                    }
                }
            }
        }
    }

    return bombsFound;
}

function checkIfAllNonBombTilesFound()
{
    //assuming this is after a button press
    let revealedCount = $(".revealedButton").length + $(".flag").length;
    let maxCount = (settings.width * settings.height) - minesweeperGrid.length;

    return revealedCount == maxCount;
}

//---Setters---

function setNumberSquareVisible(squareX, squareY)
{
    let element = getLocationElement(squareX, squareY);
    element.addClass("revealedButton");
    element.addClass("rNumberSquare");

    let bombsFound = searchForBombs(squareX, squareY);

    if (bombsFound > 0)
    {
        element.append("<p>".concat(bombsFound, "</p>"));
    }
}

function showBombsDebug()
{
    for (x of minesweeperGrid)
    {
        let element = getLocationElement(x.x, x.y);

        if (!element.hasClass("bomb"))
        {
            element.text("DB");
        }
    }
}

function clearBombsDebug()
{
    for (x of minesweeperGrid)
    {
        let element = getLocationElement(x.x, x.y);

        if (!element.hasClass("bomb"))
        {
            element.text("");
            element.empty();

            if (isFlagged(x.x, x.y))
            {
                displayFlag(x.x, x.y);
            }
        }
    }
}

function toggleDebugMode()
{
    if (!hasPopulated)
    {
        populateField();
    }

    if (started)
    {
        debug = !debug;

        if (debug)
        {
            showBombsDebug();   
        }
        else
        {
            clearBombsDebug();
        }
    }
}

function reset()
{
    if (started)
    {
        minesweeperGrid = []
        flaggedSquares = []
        $("#grid").empty();
        hasPopulated = false;
        generateButtons();
        $("#grid").width(buttonSize * settings.width);
        $("#grid").height(buttonSize * settings.height);
        gameRunning = true;

        if (debug)
        {
            showBombsDebug();
        }
    }
}

//returns an array of coordinate objects (has x and y) denoting where the 0 bomb squares were
//remember to check if a revealed square is outside of the grid
function revealSquaresAroundPoint(pointX, pointY)
{
    //we are assuming this is a 0 square
    let zeroSquares = [];

    for (let i = -1; i <= 1; i++)
    {
        for (let i2 = -1; i2 <= 1; i2++)
        {
            if (!(i == 0 && i2 == 0))
            {
                let currX = pointX + i;
                let currY = pointY + i2;

                if (currX <= (settings.width - 1) &&
                    currX >= 0 &&
                    currY <= (settings.height - 1) &&
                    currY >= 0)
                {
                    let element = getLocationElement(currX, currY);

                    if (!element.hasClass("revealedButton"))
                    {
                        setNumberSquareVisible(currX, currY);

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
    
    return zeroSquares;
}

//---Setup---
function generateButtons()
{
    //Get grid size
    //Calculate number of buttons that can fit on a row and in the whole grid
    customBombCountElement = $("#customBombCount");

    if (customBombCountElement.text().length == 0 && customBombCountElement.text() != "0")
    {
        switch (settings.difficulty)
        {
            default:
                //default to easy
                console.log("default: ".concat(settings.difficulty));
            case 0:
                settings.bombCount = 10;
                settings.width = 9;
                settings.height = 9;
                break;

            case 1:
                settings.bombCount = 40;
                settings.width = 16;
                settings.height = 16;
                break;

            case 2:
                settings.bombCount = 99;
                settings.width = 30;
                settings.height = 16;
                break;
            
            case 3:
                settings.width = 16;
                settings.height = 16;
                settings.bombCount = (settings.height * settings.width) / 2;
                break;
        }
    }
    else
    {
        settings.bombCount = customBombCountElement.text();
    }

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

function populateField(clickedX = -3, clickedY = -3)
{
    //decide where the bombs are
    for (let i = 0; i < settings.bombCount; i++)
    {
        let bombX = Math.floor(Math.random() * settings.width);
        let bombY = Math.floor(Math.random() * settings.height);

        if (!getLocationHasBomb(bombX, bombY) && ((bombX != clickedX && bombY != clickedY)))
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

    hasPopulated = true;
    onButtonClick(clickedX, clickedY);
}

//---Event based---
function buttonClicked(buttonX, buttonY)
{
    if (gameRunning)
    {
        if (!hasPopulated)
        {
            populateField(buttonX, buttonY);
        }
        else
        {
            onButtonClick(buttonX, buttonY);
        }
    }
}

function onButtonClick(buttonX, buttonY)
{
    let element = getLocationElement(buttonX, buttonY);

    if (!element.hasClass("revealedButton"))
    {
        if (getLocationHasBomb(buttonX, buttonY))
        {
            element.addClass("bomb");
            element.addClass("revealedButton");
            element.append("<img src='bomb.png' alt='B'>");
            gameRunning = false;
            //game over man
            return;
        }

        //Search for bombs
        let bombsFound = searchForBombs(buttonX, buttonY);

        //Populate tiles with the appropriate number
        element.addClass("rNumberSquare");

        setNumberSquareVisible(buttonX, buttonY);

        if (bombsFound == 0)
        {
            let toRevealAround = revealSquaresAroundPoint(buttonX, buttonY);

            while (toRevealAround.length > 0)
            {
                for (square of toRevealAround)
                {
                    let zeroSquares = revealSquaresAroundPoint(square.x, square.y);

                    for (zeroSquare of zeroSquares)
                    {
                        toRevealAround.push(zeroSquare);
                    }

                    toRevealAround = toRevealAround.filter(function(obj) { return obj.x != square.x || obj.y != square.y; });
                }
            }
        }

        if (checkIfAllNonBombTilesFound())
        {
            //game win
            console.log("win");
        }
    }
}

function displayFlag(buttonX, buttonY)
{
    let element = getLocationElement(buttonX, buttonY);
    element.addClass("revealedButton");
    element.addClass("flag");
    element.append("<img src='flag.png' alt='F'>");
}

function onRightClick(buttonX, buttonY)
{
    if (gameRunning && !(getLocationElement(buttonX, buttonY).hasClass("flag")))
    {
        flaggedSquares.push({
            x: buttonX,
            y: buttonY,
        });

        displayFlag(buttonX, buttonY);
    }
    return false;
}


function start()
{
    if (!started)
    {
        let selectElement = document.getElementById("difficultyDropdown");

        if (selectElement.selectedIndex > -1)
        {
            let selectedDifficulty = selectElement.options[selectElement.selectedIndex].value;

            settings.difficulty = Number(selectedDifficulty);

            //Make the border of the game scale to fit the game area

            if (!debugEnabled)
            {
                $("#debugButton").remove();
            }

            $("#game").css("display", "block");

            generateButtons();
            $("#grid").width(buttonSize * settings.width);
            $("#grid").height(buttonSize * settings.height);
            //populateField();

            started = true;
        }
    }
    else
    {
        let selectElement = document.getElementById("difficultyDropdown");
        let selectedDifficulty = selectElement.options[selectElement.selectedIndex].value;
        settings.difficulty = Number(selectedDifficulty);
        reset();
    }
}

