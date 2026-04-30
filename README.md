

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
* Authentication: JWT

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


## 🔑 Evaluator test Credentials

To evaluate the application and test the RBAC (Role-Based Access Control) boundaries, please use the following configured accounts:

| Role         | Email                                                       | Password   |
| ------------ | ---------------------------------------------------------   | ---------- |
|  Admin       | [u10shashank@gmail.com](mailto:u10shashank@gmail.com)       | 6674020511 |
| Member       | [sachinpathak4@gmail.com](mailto:sachinpathak4@gmail.com)   | 6674020511 |
| Member       | [rocky11@gmail.com](mailto:rocky11@gmail.com)               | 6674020511 |

💡 Notes:
The Admin account has full access (project creation, task assignment, member management).
Members can view assigned tasks and update their status.
These credentials are provided strictly for testing RBAC functionality.

## 🙌 Conclusion

This project demonstrates a complete full-stack solution with authentication, role-based access control, and efficient team collaboration features.
