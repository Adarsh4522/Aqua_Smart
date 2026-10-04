# 💧 AquaSmart — Smart Water Conservation Platform

<p align="center">

# 💧 AquaSmart — Smart Water Conservation Platform

<p align="center">
  <strong>A full-stack smart water conservation platform for tracking, analyzing, and optimizing water usage.</strong>
</p>

<p align="center">

[![Live Website](https://img.shields.io/badge/Live%20Website-AquaSmart-00A86B?style=for-the-badge)](https://aqua.itsadarsh.site)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Adarsh4522/Aqua_Smart)
[![Azure](https://img.shields.io/badge/Deployed%20on-Microsoft%20Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/)

</p>

---

## 🌐 Live Demo

🚀 **Live Website:**  
https://aqua.itsadarsh.site

💻 **GitHub Repository:**  
https://github.com/Adarsh4522/Aqua_Smart

AquaSmart is deployed on a Microsoft Azure Ubuntu Virtual Machine and uses Docker, Docker Compose, Nginx Proxy Manager, and Let's Encrypt SSL for production deployment.

> 💡 Create your own User or Provider account to explore the application.

> 🔐 Admin credentials are private and are not included in this repository.

---

# ✨ Key Features

## 👤 1. User Dashboard & Analytics

The User Dashboard provides a centralized overview of water consumption and conservation progress.

### Features

- 📊 Interactive water usage charts
- 📈 Seven-day consumption visualization
- 💧 Total water consumption tracking
- 🎯 Water conservation goal tracking
- 📊 Device-based consumption analysis
- 📅 Usage history
- 🔔 Notifications and alerts
- 📈 Consumption statistics

Charts and analytics are visualized using **Chart.js**.

---

## 🚿 2. Device Management

Users can manage their water-consuming devices.

### Supported Devices

- 🚿 Shower
- 🚰 Tap
- 🌱 Irrigation
- 🧺 Washing Machine
- 🚽 Toilet
- 🍽️ Dishwasher

### Device Operations

- Add devices
- Update device information
- Delete devices
- Activate or deactivate devices
- Track average daily consumption
- Associate devices with users

---

## 💧 3. Smart Water Usage Logging

Users can record and monitor their water consumption.

Each usage record can contain:

- Device
- Water consumption in litres
- Duration
- Date and time
- Contextual notes

The backend processes usage records to generate dashboard statistics and consumption summaries.

---

## 🎯 4. Water Conservation Goals

Users can create and monitor personal water conservation goals.

### Goal Features

- Create conservation goals
- Define consumption targets
- Track progress
- Monitor consumption limits
- View goal status
- Visual progress indicators

---

## 💡 5. Expert Water-Saving Tips

AquaSmart provides practical recommendations to help users reduce water consumption.

Users can:

- Browse published tips
- View categorized recommendations
- Read expert water-saving strategies
- Access location-related recommendations
- Discover practical conservation techniques

---

## 🏢 6. Provider Portal

Providers can contribute expert water-saving recommendations.

Provider accounts require administrator approval.

### Provider Features

- Provider registration
- Provider verification
- Submit water-saving tips
- View submitted tips
- Contribute expert recommendations

Submitted tips remain pending until approved by an administrator.

---

## 🛡️ 7. Administrative Control Panel

The Admin Dashboard provides centralized management of the platform.

### Admin Features

- 👥 View registered users
- 📊 View platform statistics
- 🏢 Approve provider accounts
- 🚫 Manage provider approval
- 💡 Review pending tips
- ✅ Approve submitted tips
- 🗑️ Delete tips
- 📱 View registered devices
- 👤 Manage user roles

All administrative functionality is protected by authentication and role-based authorization.

---

# 🔐 Authentication & Security

AquaSmart implements authentication and role-based access control.

## Authentication Technologies

- 🔑 JSON Web Tokens (JWT)
- 🔒 bcryptjs password hashing
- 🛡️ Protected API routes
- 👥 Role-based authorization
- 🌐 HTTPS
- 🔐 Environment variables
- 🛡️ Admin-only API protection

Passwords are hashed using **bcryptjs** before being stored in MongoDB.

JWT tokens are used to authenticate protected API requests.

---

## 👥 Access Roles

| Role | Access |
|------|--------|
| 👤 **User** | Dashboard, devices, usage logs, goals and water-saving tips |
| 🏢 **Provider** | Provider portal and water-saving tip submission |
| 🛡️ **Admin** | Platform management, provider approval, tip moderation, statistics and device management |

---

## 🛡️ Admin Registration Security

Admin accounts **cannot be created through the public registration page**.

Public registration only allows:

```text
User
Provider