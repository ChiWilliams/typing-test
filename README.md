# (Cursed) Typing Test
This is the code for the [typing test](https://kai-williams.com/small-projects/typing-test/) I have on my website. Have fun with it! (Hint: it randomizes your keys...)

See this [blog post](https://liquidbrain.mataroa.blog/blog/things-i-did-to-make-a-typing-test/) for more details.

## Features:
* **A cursed interface**: It scrambles your keystrokes ... it looks very basic ... it was made for a bad art seminar
* **A (currently broken) leaderboard**: Upon completion of the typing test, the server adds your score to the leaderboard and gets the leaderboard. However, 
the leaderboard sometimes resets by itself

## Architecture
The project uses a simple client-server architecture:

* Frontend: The Static HTML/JavaScript handles the typing interface and leaderboard display
* Backend: FastAPI server that:
  * Serves the static content
  * Provides API endpoints for the leaderboard
  * Persists scores in SQLite

Both the frontend and backend are configured to run on port 8080 by default:
* The backend port is set in main.py and disco.json
* Frontend API calls are hardcoded to the same port

If you want to run it on a different port, you'll need to update both configurations.

## API Endpoints
* `GET /get_high_scores`: Returns the current high scores
* `PUT /set_new_score`: Adds a new high score to the leaderboard
  * Requires a name (2-15 alphanumeric characters) and time (positive integer)

## Installation
If you just want to use it, navigate to the [website](https://kai-williams.com/small-projects/typing-test/) :).

Start with the standard stuff:
```bash
git clone https://github.com/ChiWilliams/typing-test/
cd typing-test
python -m venv venv
source venv/bin/activate #venv\Scripts\activate on windows
pip install -r requirements.txt
```

To run locally, you can start it with `fastapi dev main.py` and starting a live server on the index.html.

To serve it yourself, follow the disco instructions in their [docs](https://docs.letsdisco.dev/).
(Note: downloading the CLI onto windows may be a little bit difficult. Until the instructions on the docs are fixed, follow
[these instructions](https://liquidbrain.mataroa.blog/windows-disco-download-instructions/).

## Technologies Used
* FastAPI
* SQLModel
* SQLite
* JavaScript/HTML/CSS
* [Disco](https://disco.cloud/) (for deployment)

## Known Issues/Future Improvements
* The SQL database containing the leaderboard periodically wipes itself. I will fix this!
* It's currently possible to cheat on the typing test :(. There are several approaches to take to prevent this, which I may take up in the future.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Parts of this project (including disco.json configuration and server setup) were adapted from the [Disco example flask server](https://github.com/letsdiscodev/example-flask-site), which is also MIT licensed.

## Acknowledgments
Thanks to Greg Sadetsky for answering my questions about disco!

Thanks to Saleh Alghusson for pairing with me on the SQL database stuff!

Thanks to Tywen Kelly for showing me FastAPI and being a good sounding board.

Thanks to Iain McDonald and Sebastian Messier for helping me figure out how to install Disco!

Thanks to everyone at [RC](https://www.recurse.com/) for the encouragement! 
