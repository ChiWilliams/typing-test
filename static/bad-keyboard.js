let KEYBOARD = {}
const LETTERS = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const textArea = document.querySelector('textarea');
let TIMERSTARTED = false;
let FINISHED = false;
let TIME_ELAPSED = 0;
const GOAL = document.getElementById("goal-string").textContent;

document.addEventListener('DOMContentLoaded', e => {
    KEYBOARD = loadKeyboard();
    textArea.value = "";
    //console.log(KEYBOARD)
});

textArea.addEventListener('keydown', async e => {
    //start the timer
    if (!TIMERSTARTED) {
        runTimer();
        TIMERSTARTED = true;
    }

    const lowerKey = e.key.toLowerCase()
    const isUpper = !(e.key == lowerKey);
    if (LETTERS.includes(lowerKey)) {
        e.preventDefault();
        e.stopPropagation();

        //transform to new key:
        let newLetter = KEYBOARD[lowerKey];
        if (isUpper) {
            newLetter = KEYBOARD[lowerKey].toUpperCase();
        }

        // Update the textarea value manually
        const cursorPosition = textArea.selectionStart;
        const textBefore = textArea.value.slice(0, cursorPosition);
        const textAfter = textArea.value.slice(cursorPosition);
        textArea.value = textBefore + newLetter + textAfter;
        // Set the cursor position correctly
        textArea.selectionStart = textArea.selectionEnd = cursorPosition + 1;
        console.log("adding letter finished")
    }
});

//it wouldn't be fun if the user can just paste their input
//so being evil, we prevent them from doing so ...
addEventListener("paste", (e) => {
    //e.preventDefault();
});

//check for win condition
textArea.addEventListener("input", (event) => {
    if (textArea.value == GOAL) {
        gameWon();
    }
  });

//loading the keyboard in a shuffled manner
function loadKeyboard() {
    let shuffled = LETTERS
        .map(value => ({ value, sort: Math.random() }))
        .sort((a,b) => a.sort - b.sort)
        .map(({ value }) => value);
    let keyboardDict = Object.fromEntries(LETTERS.map((letter, index) => [letter, shuffled[index]]));
    return keyboardDict;
}

async function runTimer() {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    while (!FINISHED) {
        await delay(1000);
        TIME_ELAPSED += 1;
        timer.innerHTML = `<b>Timer:</b> ${TIME_ELAPSED}`;
    }
    
}

async function getName () {
    const modal = document.getElementById("get-name");
    const input = document.getElementById("name-input");
    modal.showModal();

    const isValidEntry = (entry) => {
        const strippedEntry = entry.replaceAll(/[^a-zA-Z-0-9]/gi, "");
        return (2 <= strippedEntry.length) && (strippedEntry.length <= 15)

    }

    return new Promise( resolve => {
        modal.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                if (isValidEntry(input.value)) {
                    modal.close();
                    // we now make the input upper case
                    // and get rid of all spaces and special characters
                    let name = input.value.toUpperCase()
                    name = name.replaceAll(/[^a-zA-Z-0-9]/gi, "");
                    resolve(name);
                } else {
                    document.getElementById("validation-message").innerHTML = "You must enter a name between 2-15 characters.<br>Only letters and numbers are allowed."
                }
            }
        })
    });
}

async function gameWon() {
    // stop the timer
    FINISHED = true;
    //make textARea disabled
    textArea.disabled = true;
    //show a message:
    document.getElementById("you-won").style.display = "block";
    const name = await getName();
    await setNewScore(name, TIME_ELAPSED)
    const leaderboard = await getHighscores();
    createTable(leaderboard);
}

function createTable(leaderboard) {
    const table = document.getElementById("leaderboard");
    table.style.display = "block";
    console.log(leaderboard);
    leaderboard.forEach(entry => {
        const row = document.createElement("tr");
        const nameEntry = document.createElement("td");
        nameEntry.innerText = entry.name.toUpperCase();
        const timeEntry = document.createElement("td");
        timeEntry.innerText = entry.time;

        row.appendChild(nameEntry);
        row.appendChild(timeEntry);
        table.appendChild(row);
    })
}

async function getHighscores() {
    return await callAPI('get_high_scores');
}

function setNewScore(name, time) {
    return callAPI('set_new_score', 'PUT', {name: name, time: time} );
}


async function callAPI(path, method='GET', body=null) {
  const url = `http://localhost:8080/${path}`;
  const baseOptions = {
    method: method,
    headers: {
        'Content-Type': 'application/json'
    }
  };
  const requestParams = body ? {...baseOptions, body: JSON.stringify(body) } : baseOptions
    
  try {
    const response = await fetch(url, requestParams);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    if (response.status == 204) {
        return null;
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

