---

# ZZU Thrift

A student-to-student marketplace built specifically for Washington State University.
Buy. Sell. Save. Repeat.

ZZU Thrift helps WSU students resell clothes, textbooks, tech, and dorm essentials in a safe, campus-focused environment — because paying full price is optional.

---
# 🛞 Hackathon Theme: Reinventing the Wheel

The theme of this hackathon was “Reinventing the Wheel.”
Instead of trying to build something completely unheard of, we asked:

What if we reimagined something that already works — but made it better for a specific community?

We chose to reinvent Depop.

Depop is a powerful resale platform, but it serves a global audience. That means:

- No built-in campus verification

- No focus on student affordability

- No community-based trust layer

So we rebuilt the idea — but specifically for WSU students.

 What We Reinvented

Instead of creating another general marketplace, we:

 Made it student-exclusive

 Focused on college affordability

 Built it around campus culture

 Designed it for local meetups & trust

 Styled it with WSU-inspired branding

We didn’t reinvent the concept of reselling.
We reinvented who it’s for.

Depop connects strangers.
ZZU Thrift connects classmates.

---

## Overview

ZZU Thrift is a Depop-style marketplace web application designed exclusively for WSU students. It provides:

* Secure student-only access
* Clean product listings
* Search and filtering
* User profiles
* Favorites system
* Messaging between buyers and sellers
* WSU-themed design and branding

Built to make campus reselling simple, fast, and affordable.

---

## Why This Project?

College students:

* Have limited budgets
* Move frequently
* Need flexible ways to buy/sell items


---

## Tech Stack

**Frontend**

* React
* Zustand (state management)
* Tailwind CSS

**Backend (if applicable)**

* Node.js / Express (or your backend stack)
* REST API architecture

**Database**

* (MongoDB / PostgreSQL / Firebase — update based on what you’re using)

---

## Features

### Authentication (Simulated / JWT-Based)

* Student login system
* User session handling
* Protected routes

### Product Listings

* Upload item images
* Add title, price, description, category
* View item details page

### Search & Filtering

* Search by keyword
* Filter by category
* Sort by price

### Messaging System

* Buyer ↔ Seller direct messaging
* Conversation threads

### Favorites

* Save items
* View saved listings in profile

### User Profiles

* View posted listings
* Manage active items
* Edit profile info

---

## Project Structure

```
ZZU-Thrift/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── hooks/
│   ├── services/
│   └── assets/
│
├── public/
├── package.json
└── README.md
```

---

## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/zzu-thrift.git
```

2. Navigate into the project directory:

```bash
cd zzu-thrift
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

App will run at:

```
http://localhost:5173
```

---

## Future Improvements

* Admin dashboard
* Report / moderation system
* Push notifications
* Mobile app version
* User rating system
