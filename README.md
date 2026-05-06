# Dear Diary

A cute digital diary application featuring an interactive calendar, entry tracking, and a mood-based feedback system. 

## Prerequisites
- Python 3.7+ installed on your system.

## Setup Instructions

### 1. Open Terminal in Project Directory
Navigate to the root folder of the project (`Dear diary`).

### 2. Create a Virtual Environment (Recommended)
Creating a virtual environment isolates project dependencies from your global Python installation. Run the following command:
```bash
python -m venv venv
```

### 3. Activate the Virtual Environment
Activate the environment so that packages are installed correctly.

- **On Windows (Command Prompt or PowerShell):**
  ```bash
  venv\Scripts\activate
  ```
- **On macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 4. Install Dependencies
Install all the necessary packages listed in the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### 5. Run the Application
Start the Flask development server:
```bash
python app.py
```
*(Note: The database `diary.db` will be automatically initialized the first time you run the app).*

### 6. View the App
Open your web browser and go to:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## Running for Production (Optional)
If you want to run the application using a production-ready WSGI server on Windows, we've included `waitress` in the requirements. 

To run with waitress:
```bash
waitress-serve --port=5000 app:app
```
