---
description: How to deploy the OfficialUM1 website to production
---

# Deployment Guide for OfficialUM1.com

Since your application uses **Next.js** and currently stores data in **JSON files**, you have two main options for deployment.

## Option 1: Vercel (Recommended for Speed & Speed)
**Note:** Vercel is free and the fastest way to host Next.js. However, since your Admin Panel saves data to local files, **new blogs/projects created in the Admin Panel will not persist** unless you connect a database. For a static site that you update via code, this is perfect.

1.  **Create a GitHub Account**:
    - Go to [github.com](https://github.com) and create a repository.
    - Push your code to GitHub:
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      git branch -M main
      git remote add origin <your-repo-url>
      git push -u origin main
      ```

2.  **Deploy on Vercel**:
    - Go to [vercel.com](https://vercel.com) and sign up with GitHub.
    - Click **"Add New..."** -> **"Project"**.
    - Import your `officialum1` repository.
    - In "Environment Variables", add:
      - `ADMIN_PASSWORD`: (Your secure password)
    - Click **Deploy**.

3.  **Connect Domain**:
    - In Vercel Project Settings -> **Domains**.
    - Add `officialum1.com`.
    - Login to your Domain Registrar (Godaddy/Namecheap) and update the DNS records as shown by Vercel (usually a generic A record or CNAME).

---

## Option 2: VPS (DigitalOcean / Hetzner) - **Required for Admin Panel Data Saving**
If you want to use the Admin Panel to write blogs and save them permanently without a database, you must use a VPS (Virtual Private Server).

1.  **Get a Server**: Buy a standard Ubuntu Droplet ($6/mo).
2.  **Setup Node.js**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
3.  **Clone & Build**:
    ```bash
    git clone <your-repo-url>
    cd officialum1
    npm install
    npm run build
    ```
4.  **Run with PM2** (keeps site alive):
    ```bash
    npm install -g pm2
    pm2 start npm --name "officialum1" -- start
    ```
5.  **Setup Nginx**: Configure Nginx to reverse proxy port 3000 to port 80 (standard web port).

---

## Post-Deployment Checklist
1.  **Google Search Console**: detailed in `app/layout.tsx`. Get your verification code and update the site.
2.  **Sitemap**: Submit `https://officialum1.com/sitemap.xml` to Google Console.
