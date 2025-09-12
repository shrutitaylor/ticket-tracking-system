# 🎟️ Ticketing & POS System

A full-stack **ticket management and POS (Point of Sale) system** built with **React, Firebase (Firestore, Auth)**, and **Netlify Functions**.
It supports real-time ticket tracking, payments, and an admin-managed recycle bin for deleted tickets.

---

## 🚀 Features

* **Ticket Management**

  * Create, update, and delete tickets
  * Search tickets by **name, phone, or date**
  * Sort & filter with live updates

* **Recycle Bin (Soft Delete)**

  * Deleted tickets are moved to a `deletedTickets` collection
  * Restore deleted tickets back into the main system
  * Permanently remove tickets if required

* **User Management**

  * Admin-only access to registered users
  * User authentication with Firebase Auth

* **Tech Stack**

  * **Frontend:** React + TailwindCSS
  * **Backend:** Firebase Firestore + Auth
  * **Serverless API:** Netlify Functions
  * **Deployment:** Netlify

---

## 📂 Project Structure

```
project-root/
├── src/                  # React frontend
│   ├── components/       # UI components (tables, modals, buttons)
│   └── App.jsx
├── netlify/
│   └── functions/        # Serverless backend (delete, restore, payments)
├── firebaseConfig.js     # Firebase setup
├── netlify.toml          # Netlify config
└── README.md
```

---

## ⚡ Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/shrutitaylor/ticket-tracking-system.git
   cd ticket-pos-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Firebase**

   * Create a Firebase project
   * Add Firestore + Auth
   * Update `firebaseConfig.js` with your credentials

4. **Run locally with Netlify dev**

   ```bash
   netlify dev
   ```

5. **Deploy**

   ```bash
   netlify deploy --prod
   ```

---

## 🔑 Admin Access

* Only the **admin email** can view all users and manage tickets.
* Other users can only access their own tickets.


