# Credit Approval System - Frontend

React 18 + Vite frontend for the Credit Approval System REST API.

## Tech Stack

- **React 18**: UI library
- **Vite**: Modern build tool with fast HMR
- **axios**: HTTP client
- **React Router v6**: Client-side routing
- **CSS**: Plain CSS with flexbox and grid for responsive layout

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance configured for http://localhost:8000
│   │   └── loans.js           # All API call functions (registerCustomer, checkEligibility, etc.)
│   ├── components/
│   │   ├── Navbar.jsx         # Top navigation with links to all pages
│   │   ├── FormField.jsx      # Reusable input field with label and error display
│   │   ├── StatusBadge.jsx    # APPROVED / DENIED badge component
│   │   └── LoadingSpinner.jsx # CSS spinner for loading states
│   ├── pages/
│   │   ├── RegisterCustomer.jsx
│   │   ├── CheckEligibility.jsx
│   │   ├── CreateLoan.jsx
│   │   ├── ViewLoan.jsx
│   │   └── ViewCustomerLoans.jsx
│   ├── utils/
│   │   └── format.js          # formatINR() and formatNumber() utilities
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Router configuration
│   └── index.css              # Global styles
├── package.json
├── vite.config.js
├── Dockerfile
└── index.html
```

## Installation & Development

### Local Setup (without Docker)

```bash
cd frontend
npm install
npm run dev
```

The dev server will start on `http://localhost:3000` and automatically proxy API calls to `http://localhost:8000`.

### Docker Setup

The frontend is included in `docker-compose.yml`. From the root (e:\alemeno):

```bash
docker-compose up --build
```

Then visit `http://localhost:3000` in your browser.

## Features

### 1. Register Customer
- Register new customers with name, age, monthly income, phone number
- Client-side validation for all fields
- Auto-calculated approved limit displayed on success
- Formatted rupee amounts using Indian comma style

### 2. Check Eligibility
- Check if customer is eligible for a loan
- Two-column layout: form on left, result on right (mobile: stacked)
- Displays approval status, corrected interest rate, and monthly EMI
- Highlights interest rate if it was adjusted based on credit score

### 3. Create Loan
- Submit loan application for an eligible customer
- Shows approval status and loan ID on success
- Shows denial reason and monthly EMI estimate on rejection

### 4. View Loan
- Search for a specific loan using Loan ID
- Displays loan details and nested customer information
- Clean two-section layout

### 5. Customer Loans
- Search by Customer ID
- Shows all active loans in a formatted table
- Columns: Loan ID, Amount, Interest Rate, Monthly EMI, EMIs Left
- Indian Rupee formatting for all currency amounts

## Styling

- **Design**: Government/banking style — minimal, no animations or gradients
- **Colors**:
  - Primary: #2980b9 (buttons)
  - Success: #27ae60 (approved badges)
  - Error: #e74c3c (denied badges, error text)
  - Headers: #1a1a2e (dark navy)
  - Backgrounds: white cards on light grey page background
- **Responsive**: Mobile-first with CSS flexbox/grid media queries for 768px+ screens
- **Font**: System font stack (no Google Fonts)

## API Integration

All API calls are centralized in `src/api/loans.js`. Each function:
- Handles request body serialization (strings to numbers)
- Returns `response.data` directly
- Throws errors as-is for page error handling

The axios client is configured once in `src/api/client.js`:
```javascript
const client = axios.create({ baseURL: 'http://localhost:8000' })
```

To change the API base URL, edit this single file.

## Error Handling

- **Network errors**: "Could not connect to the server..."
- **404s**: User-friendly message specific to context (e.g., "Customer ID X not found")
- **400s**: Field-level errors displayed inline under each input
- **500s**: "Something went wrong on the server."

Form data persists after errors so users don't retype.

## Production Build

```bash
npm run build
```

Generates optimized files in the `dist/` directory.

## Environment

The frontend connects to the backend on `http://localhost:8000` (configurable in `src/api/client.js`).

For production, update `src/api/client.js`:
```javascript
const client = axios.create({ baseURL: 'https://your-api.example.com' })
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
