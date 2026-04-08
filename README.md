Requirement:
Make sure the following are installed on your computer

Node.js
Python 3
MySQL Server
MySQL Workbench

In the project root directory, run:
`npm install`

Open a terminal in the `backend` folder and run:
`py -m pip install fastapi uvicorn sqlmodel pymysql`

Open MySQL Workbench and run:
`CREATE DATABASE IF NOT EXISTS flashcard_db;`

In backend/database.py, update the database URL with your own MySQL username and password:
`DATABASE_URL = "mysql+pymysql://root:`YOURPASSWORD`@localhost/flashcard_db"`
Example:
`DATABASE_URL = "mysql+pymysql://root:123456@localhost/flashcard_db"`

Running the Application:

In the backend folder, run:
`py -m uvicorn main:app --reload`

In the project root folder, run:
`npm run dev`
The frontend should run at something like:
http://localhost:5173

Check the data in MySQL WorkBench:
`USE flashcard_db;`
`SHOW TABLES;`
`SELECT * FROM flashcard;`

How to Use

Open the app in the browser
Enter a question and answer in the bottom input bar
Click Add Flashcard
The new card will appear in the active study area
Click a card to reveal its answer

Use:
Edit to update the card
Delete to remove the card
Used to move it into the used section
Click Show Used Cards to expand used cards
Click Restore to move a used card back into the active deck
