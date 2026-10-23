# ExamVault – Production Deployment Guide 🚀

This guide provides the **easiest, 100% free, step-by-step instructions** to deploy the entire ExamVault system online.

---

## 🏆 Option 1: The Easiest Way (Render.com Unified Deployment)
> **Why this is the best for college projects:**
> - Runs the **entire project (React Frontend + Flask Backend + SQLite Database + Cryptography)** under **ONE single URL** (e.g., `https://examvault.onrender.com`).
> - **Zero CORS issues**, zero cross-domain cookie problems, and 100% Free.

---

### Step 1: Upload Your Project to GitHub

1. Open your terminal inside `C:\Users\DELL\OneDrive\Desktop\ExamVault`.
2. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "ExamVault Complete Production Release"
   ```
3. Go to [GitHub.com](https://github.com), click **New Repository**, and name it `ExamVault` (choose **Public** or **Private**).
4. Link and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ExamVault.git
   git push -u origin main
   ```

---

### Step 2: Deploy on Render.com (100% Free)

1. Go to [Render.com](https://render.com) and **Sign Up / Log In** with your GitHub account.
2. In the Render Dashboard, click the **"New +"** button at the top right and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and select your `ExamVault` repository.
4. Fill in these exact settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `examvault` *(or your custom name)* |
| **Region** | `Singapore` *(fastest for India)* or `Oregon` |
| **Branch** | `main` |
| **Root Directory** | *(Leave completely blank)* |
| **Runtime** | `Python 3` |
| **Build Command** | `npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt` |
| **Start Command** | `cd backend && gunicorn app:app` |
| **Instance Type** | `Free` ($0/month) |

5. Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**:
   - `SECRET_KEY`: `examvault-super-secure-production-master-key-2026`
   - `JWT_SECRET_KEY`: `jwt-vault-token-signature-secret-key-98765`
   - `SIMULATE_EMAIL_OTP`: `false`
   - *(Optional for real Gmail)* `MAIL_USERNAME`: `your_email@gmail.com`
   - *(Optional for real Gmail)* `MAIL_PASSWORD`: `your_16_char_google_app_password`
   - *(Optional for real SMS)* `FAST2SMS_API_KEY`: `your_fast2sms_api_key`

6. Click **"Deploy Web Service"** at the bottom.

7. **Wait 2 to 3 minutes** while Render builds your React frontend and installs Python dependencies.
8. Once you see **"Your service is live 🎉"**, your live public URL will appear at the top:
   👉 **`https://examvault.onrender.com`**

---

## ⚡ Option 2: 10-Second Instant Live Demo (Ngrok Tunnel)
If your college presentation or viva is today and you want judges/evaluators to open the project on their phones/laptops immediately without cloud setup:

1. Download **[ngrok](https://ngrok.com/download)** (free).
2. Open terminal and run:
   ```bash
   ngrok http 5000
   ```
3. Ngrok gives you an instant public HTTPS link:
   👉 `https://xxxx-xx-xx.ngrok-free.app`
4. Anyone on the internet can open that link and test ExamVault live!

---

## 🌐 Option 3: Separate Deploy (Frontend on Vercel + Backend on Render)

### Backend on Render:
- Root directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`
- Copy your backend URL: e.g. `https://examvault-api.onrender.com`

### Frontend on Vercel:
1. Go to [Vercel.com](https://vercel.com) and import the GitHub repository.
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://examvault-api.onrender.com/api`
5. Click **Deploy**. Vercel will build and give you `https://examvault.vercel.app`.

---

## 🔑 Default Login Credentials for Live Testing

| Account | Identifier (Email/Phone) | Password | Auth Type |
| :--- | :--- | :--- | :--- |
| **👑 Controller (Admin)** | `admin@examvault.edu` | `Admin@123` | **Direct Login (Bypasses OTP)** |
| **🎓 Faculty (Dr. Turing)** | `faculty@examvault.edu` | `Faculty@123` | **2FA OTP Verified** |
| **📱 Mobile Login** | `8104211805` | *(Your registered pass)* | **2FA OTP Verified** |
