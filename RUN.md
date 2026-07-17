# 🚀 Manual Run Instructions - TCS PlaySmart

Follow these steps to manually start the backend and frontend servers in separate terminal windows.

---

## 📋 Prerequisites

Ensure you have the following installed on your system:
- **Python**: Version 3.10 or higher (verify with `python --version`)
- **Node.js & npm**: Node v18+ and npm v9+ (verify with `node -v` and `npm -v`)

---

## ⚙️ Step-by-Step Execution

### 1️⃣ Start the Backend Server (FastAPI)

1. Open a new terminal window/tab.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend development server using `uvicorn`:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   * **API URL**: http://localhost:8000
   * **API Docs (Swagger UI)**: http://localhost:8000/docs

---

### 2️⃣ Start the Frontend Server (Vite / React)

1. Open a **second** terminal window/tab.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install the frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   * **Frontend UI URL**: http://localhost:3000

---

## 🎯 Verification Checklist

After starting both servers, verify the following are accessible in your browser:
* [ ] **Frontend**: Open [http://localhost:3000](http://localhost:3000) (the web page should load successfully).
* [ ] **Backend Health**: Open [http://localhost:8000](http://localhost:8000) (should show `{"status":"online",...}`).
* [ ] **Interactive API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs).
