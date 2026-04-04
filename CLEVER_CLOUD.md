# Clever Cloud

## What is Clever Cloud?

[Clever Cloud](https://www.clever-cloud.com) is a European cloud platform-as-a-service (PaaS) that hosts databases and applications. It is used as an alternative to AWS RDS for hosting the Clipper 2.0 MySQL database, keeping AWS costs below $40/month.

---

## What We Use It For

Clever Cloud hosts the **production MySQL database** for Clipper 2.0. This replaced the original AWS RDS instance which was deleted to reduce costs.

All application data is stored here:
- Users (authentication, roles, permissions)
- Customers
- Orders & order items
- Inventory
- Suppliers
- Shipments
- Payments
- Analytics metrics

---

## Account

- **Console URL**: https://console.clever-cloud.com
- **Login method**: GitHub OAuth (click "Sign in with GitHub" on the Clever Cloud login page)
- **GitHub account**: *(the GitHub account used to sign up — JackSawyerWATX)*

---

## MySQL Add-on Connection Details

| Variable | Value |
|---|---|
| `DB_HOST` | `b8rrovgobiy0cshdfktk-mysql.services.clever-cloud.com` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `b8rrovgobiy0cshdfktk` |
| `DB_USER` | `uifuqacfq3e4oo9n` |
| `DB_PASSWORD` | *(see `.env.production` or Clever Cloud console → add-on → Environment variables)* |

> Full URI format:
> `mysql://<user>:<password>@b8rrovgobiy0cshdfktk-mysql.services.clever-cloud.com:3306/b8rrovgobiy0cshdfktk`

---

## Where Credentials Are Used

The backend (`server/config/database.js`) reads these from environment variables at runtime:

```js
host: process.env.DB_HOST
user: process.env.DB_USER
password: process.env.DB_PASSWORD
database: process.env.DB_NAME
port: process.env.DB_PORT
```

Set these in whichever platform hosts the Express backend (Fly.io, Render, etc.) as environment variables in that platform's dashboard.

---

## Admin Database User

The application's admin login account in the database:

| Field | Value |
|---|---|
| Username | `clipper_admin` |
| Email | `admin@clipper.com` |
| Role | `Administrator` |
| Password | *(store in your password manager)* |

To reset the admin password, run from the `server/` directory:

```powershell
$env:DB_HOST="b8rrovgobiy0cshdfktk-mysql.services.clever-cloud.com"
$env:DB_USER="uifuqacfq3e4oo9n"
$env:DB_PASSWORD="<password>"
$env:DB_NAME="b8rrovgobiy0cshdfktk"
$env:DB_PORT="3306"
node scripts/resetAdminPassword.js
```

---

## Billing

- MySQL add-on is billed monthly by Clever Cloud
- Check current usage at: https://console.clever-cloud.com → Billing
