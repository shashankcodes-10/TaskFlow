# 🧑‍💻 TaskFlow

## 📌 Overview

TaskFlow is a full-stack web application designed to help teams collaborate efficiently by managing projects and tasks in a centralized system. This project demonstrates core full-stack development skills including frontend, backend, authentication, database design, and deployment.

---

## 🎯 Problem Statement

The application enables users to create and join projects, assign tasks, and track progress within teams. It implements role-based access (Admin and Member) and works as a simplified version of tools like Trello or Asana.

---

## 🚀 Features

* User Authentication (Signup/Login with JWT)
* Project creation and member management
* Task assignment with status tracking
* Dashboard for task insights
* Role-based access (Admin & Member)

---

## 🛠️ Tech Stack

* Frontend: React.js, Tailwind CSS
* Backend: Node.js, Express.js
* Database: MongoDB
* Authentication: JWT, bcrypt

---

## ⚠️ 🔒 Environment Variables Notice

The `.env` file is intentionally not included in this repository.
It contains sensitive information such as database connection strings and secret keys. Exposing this data publicly could allow unauthorized access to the database, including modification or deletion of data.

To keep the application secure, environment variables are stored locally or configured securely during deployment.

---

## ⚙️ Setup Environment Variables

Create a `.env` file in the root directory and add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```





## 🙌 Conclusion

This project demonstrates a complete full-stack solution with authentication, role-based access control, and efficient team collaboration features.
