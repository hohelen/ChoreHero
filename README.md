# ChoreHero

How To Set-Up ChoreHero

Requirements:
    - Node.js (v18+) and npm
    - Git for version control
    - Code editor (VS Code recommended)
    - Python 3.9+
    - MariaDB (or Docker for easier database management)

1. Environment Set-Up:
    1.1 Navigate to backend folder: `cd backend`
    1.2 Activate virtual environment: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
    1.3 Run the server: `uvicorn app.main:app --reload`

2. Testing on Mobile Phone
    2.1 Install the "Expo Go" app on your mobilde device
    2.2 ```cd frontend/chorehero-frontend```
    2.3 Run ```npx expo start --tunnel``` 
    2.4 Requirement: Both devices must be on the same network
    2.5 Scan the QR code with your phone
    2.6 ChoreHero will appear on your phone, it'll auto-refresh whenever you save code changes

