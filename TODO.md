# 📱 RENTAL MANAGEMENT SYSTEM — EXACT FLUTTER SCREEN WIREFRAMES

## Tenant App + Agent App (Production-Level UX)

These wireframes are structured exactly how you should build them in Flutter.
Think of this as your UI blueprint before Figma or coding.

---

# 🎨 GLOBAL DESIGN SYSTEM

Before individual screens:

---

## 📐 Layout Rules

### Safe Area

Every screen:

```dart
SafeArea(
  child: Scaffold(
    body: ...
  ),
)
```

---

## 📏 Spacing Scale

| Usage  | Value |
| ------ | ----- |
| Tiny   | 4     |
| Small  | 8     |
| Medium | 16    |
| Large  | 24    |
| XL     | 32    |

---

## 🔤 Typography

| Type          | Size |
| ------------- | ---- |
| Page Title    | 28   |
| Section Title | 20   |
| Card Title    | 18   |
| Body          | 16   |
| Small Text    | 13   |

---

## 🎨 Color System

| Usage      | Color      |
| ---------- | ---------- |
| Primary    | Deep Blue  |
| Success    | Green      |
| Warning    | Orange     |
| Danger     | Red        |
| Background | Light Gray |
| Card       | White      |

---

# 📱 TENANT MOBILE APP

---

# 1️⃣ SPLASH SCREEN

## Purpose

* Branding
* App initialization
* Load saved language/auth state

---

## Wireframe

```text
------------------------------------------------
|                                              |
|                                              |
|                                              |
|               [ APP LOGO ]                  |
|                                              |
|          RENTAL MANAGEMENT APP              |
|                                              |
|                                              |
|            Loading Spinner...               |
|                                              |
|                                              |
------------------------------------------------
```

---

## Flutter Layout Structure

```dart
Column(
  mainAxisAlignment: MainAxisAlignment.center,
  children: [
    Logo(),
    SizedBox(height: 24),
    Text("Rental Management"),
    SizedBox(height: 32),
    CircularProgressIndicator(),
  ],
)
```

---

# 2️⃣ LANGUAGE SELECTION SCREEN

## Purpose

Critical for Ugandan multilingual users.

---

## Wireframe

```text
------------------------------------------------
| ← Back                                       |
|                                              |
| Choose Language                              |
|                                              |
| [ 🇬🇧 English ]                              |
| [ 🇹🇿 Kiswahili ]                            |
| [ 🇺🇬 Luganda ]                              |
| [ Acholi ]                                   |
| [ Lango ]                                    |
| [ Runyankole ]                               |
| [ Ateso ]                                    |
|                                              |
|                                              |
|             [ CONTINUE ]                     |
------------------------------------------------
```

---

## UX Rules

* Large touch targets
* Simple typography
* Store locally immediately

---

## Widget Structure

```dart
ListView(
  children: [
    LanguageTile(),
    LanguageTile(),
    ContinueButton(),
  ],
)
```

---

# 3️⃣ LOGIN SCREEN

## Purpose

Fast authentication using phone numbers.

---

## Wireframe

```text
------------------------------------------------
|                                              |
|              Welcome Back 👋                 |
|                                              |
|  Enter your phone number                     |
|                                              |
|  +256 [_______________]                      |
|                                              |
|                                              |
|          [ SEND OTP ]                        |
|                                              |
|                                              |
------------------------------------------------
```

---

## Flutter Structure

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text("Welcome Back"),
    SizedBox(height: 16),
    PhoneInputField(),
    SizedBox(height: 24),
    PrimaryButton(),
  ],
)
```

---

# 4️⃣ OTP VERIFICATION SCREEN

---

## Wireframe

```text
------------------------------------------------
| ← Back                                       |
|                                              |
| Verify Code                                  |
|                                              |
| Enter the OTP sent to:                       |
| +256700000000                                |
|                                              |
| [ ] [ ] [ ] [ ] [ ] [ ]                      |
|                                              |
| Resend in 30s                                |
|                                              |
|             [ VERIFY ]                       |
------------------------------------------------
```

---

## UX Notes

* Auto-focus next box
* Auto-submit after final digit
* Numeric keyboard only

---

# 5️⃣ TENANT DASHBOARD

## MOST IMPORTANT SCREEN

This should feel:

* calm
* simple
* trustworthy

---

## Wireframe

```text
------------------------------------------------
| ☰                        🔔                  |
|                                              |
| Hi, John 👋                                  |
|                                              |
| ------------------------------------------   |
| RENT STATUS                                  |
|                                              |
| Amount Due: UGX 500,000                      |
| Due Date: 5 May                              |
| Status: DUE                                  |
|                                              |
| [ PAY NOW ]                                  |
| ------------------------------------------   |
|                                              |
| QUICK ACTIONS                                |
|                                              |
| [ Pay Rent ]   [ Report Issue ]              |
|                                              |
| ------------------------------------------   |
| RECENT ACTIVITY                              |
|                                              |
| ✔ Payment Recorded                           |
| ✔ Issue Submitted                            |
------------------------------------------------
```

---

## Flutter Widget Tree

```dart
Scaffold(
  bottomNavigationBar: TenantBottomNav(),
  body: SingleChildScrollView(
    child: Column(
      children: [
        DashboardHeader(),
        RentStatusCard(),
        QuickActions(),
        RecentActivity(),
      ],
    ),
  ),
)
```

---

# 6️⃣ PAY RENT SCREEN

---

## Wireframe

```text
------------------------------------------------
| ← Back                                       |
|                                              |
| Pay Rent                                     |
|                                              |
| Amount Due                                   |
| UGX 500,000                                  |
|                                              |
| Select Method                                |
|                                              |
| (•) MTN Mobile Money                         |
| ( ) Airtel Money                             |
| ( ) Cash via Agent                           |
|                                              |
|                                              |
|             [ PAY NOW ]                      |
------------------------------------------------
```

---

## UX Rules

* Large payment buttons
* Highlight selected method
* Show fees later

---

# 7️⃣ REPORT ISSUE SCREEN

---

## Wireframe

```text
------------------------------------------------
| ← Back                                       |
|                                              |
| Report Issue                                 |
|                                              |
| Issue Type                                   |
| [ Dropdown ▼ ]                               |
|                                              |
| Description                                  |
| [_____________________]                      |
| [_____________________]                      |
|                                              |
| Add Photo                                    |
| [ Upload Image ]                             |
|                                              |
|             [ SUBMIT ]                       |
------------------------------------------------
```

---

## Issue Types

* Plumbing
* Electricity
* Security
* Cleaning
* Other

---

# 8️⃣ NOTIFICATIONS SCREEN

---

## Wireframe

```text
------------------------------------------------
| Notifications                                |
|                                              |
| 🔔 Rent Due Tomorrow                         |
| 2 mins ago                                   |
|                                              |
| ✔ Payment Confirmed                          |
| Yesterday                                    |
|                                              |
| 🛠 Issue Resolved                             |
| Monday                                       |
------------------------------------------------
```

---

# 9️⃣ PROFILE SCREEN

---

## Wireframe

```text
------------------------------------------------
| Profile                                      |
|                                              |
| [ Avatar ]                                   |
|                                              |
| John Doe                                     |
| +256700000000                                |
|                                              |
| ------------------------------------------   |
| Language                                     |
| English ▼                                    |
|                                              |
| ------------------------------------------   |
| Logout                                       |
------------------------------------------------
```

---

# 📱 AGENT APP WIREFRAMES

The agent app should feel:

* faster
* more functional
* operational

---

# 🔟 AGENT DASHBOARD

---

## Wireframe

```text
------------------------------------------------
| ☰                        🔔                  |
|                                              |
| Good Morning, Sarah                          |
|                                              |
| ------------------------------------------   |
| TODAY'S COLLECTION                           |
|                                              |
| UGX 1,250,000                                |
|                                              |
| ------------------------------------------   |
|                                              |
| [ Record Payment ]                           |
| [ Add Tenant ]                               |
|                                              |
| ------------------------------------------   |
| RECENT TRANSACTIONS                          |
|                                              |
| ✔ John - UGX 200k                            |
| ✔ Mary - UGX 350k                            |
------------------------------------------------
```

---

# 1️⃣1️⃣ RECORD PAYMENT SCREEN

---

## Wireframe

```text
------------------------------------------------
| ← Back                                       |
|                                              |
| Record Payment                               |
|                                              |
| Select Tenant                                |
| [ Search Tenant ]                            |
|                                              |
| Amount                                       |
| [ UGX __________ ]                           |
|                                              |
| Method                                       |
| (•) Cash                                     |
| ( ) Mobile Money                             |
|                                              |
|             [ SAVE ]                         |
------------------------------------------------
```

---

# 1️⃣2️⃣ TENANT LIST SCREEN

---

## Wireframe

```text
------------------------------------------------
| Tenants                                      |
|                                              |
| [ Search... ]                                |
|                                              |
| ------------------------------------------   |
| John Doe                                     |
| Room A1                                      |
| Paid                                         |
| ------------------------------------------   |
| Mary Jane                                    |
| Room B2                                      |
| Due                                          |
------------------------------------------------
```

---

# 1️⃣3️⃣ MAINTENANCE REQUESTS SCREEN

---

## Wireframe

```text
------------------------------------------------
| Maintenance Requests                         |
|                                              |
| ------------------------------------------   |
| Leaking Tap                                  |
| Room A2                                      |
| Pending                                      |
| ------------------------------------------   |
| Broken Window                                |
| Room B1                                      |
| Resolved                                     |
------------------------------------------------
```

---

# 📦 SHARED COMPONENTS YOU SHOULD BUILD FIRST

Before screens:

---

## Buttons

```text
PrimaryButton
SecondaryButton
DangerButton
```

---

## Inputs

```text
PhoneInput
TextInput
PasswordInput
DropdownInput
```

---

## Cards

```text
StatusCard
PaymentCard
IssueCard
SummaryCard
```

---

## Navigation

```text
BottomNavigationBar
AppDrawer
TopHeader
```

---

# 🧠 PRODUCTION UX DECISIONS

---

## Offline UX

Show:

```text
⚠ No Internet
Changes will sync later
```

---

## Empty States

```text
No payments yet
No maintenance requests
```

---

## Loading States

Use skeleton loaders instead of spinners where possible.

---

# 🛠 RECOMMENDED FLUTTER STACK

| Purpose          | Package            |
| ---------------- | ------------------ |
| State Management | flutter_riverpod   |
| Routing          | go_router          |
| Localization     | intl               |
| Responsive UI    | flutter_screenutil |
| Storage          | hive               |
| Networking Later | dio                |

---

# 📂 EXACT FLUTTER UI FOLDER STRUCTURE

```text
lib/
│
├── core/
│   ├── theme/
│   ├── localization/
│   ├── routing/
│   └── widgets/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── payments/
│   ├── maintenance/
│   ├── notifications/
│   └── profile/
│
├── shared/
│   ├── models/
│   ├── services/
│   └── utils/
│
└── main.dart
```

---

# 🚀 NEXT BEST STEP

Your next move should be:

### 1.

Build:

* theme
* localization
* reusable widgets

### 2.

Then ONLY:

* Splash
* Language
* Login
* Dashboard

### 3.

After that:

* Payment flows
* Maintenance
* Notifications

---
