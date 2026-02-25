# How To Set-Up ChoreHero

## Requirements

- Python 3.9+
- Node.js (v18+) and npm
- Git for version control
- Code editor (VS Code recommended)
- MariaDB (or Docker for easier database management)

---

## Environment Set-Up

1. Navigate to the backend folder:
   cd backend

2. Set up the virtual environment:
   2.1 Create the virtual environment folder:
   python -m venv venv

    2.2 Activate the virtual environment:

    # Mac/Linux

    source venv/bin/activate

    # Windows

    venv\Scripts\activate

3. Install dependencies:
   pip install -r requirements.txt

4. Create a `.env` file in the backend folder and fill in the Railway database credentials:

    ```
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    DB_PORT=
    ```

5. Run the server:
   uvicorn app.main:app --reload
