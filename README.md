# Chosen One React App

A modern React application for Chosen One with Firebase authentication and a luxury dashboard interface.

## Features

- 🔐 **Firebase Authentication** - Secure login and registration
- 🎨 **Luxury Design** - Beautiful gold-themed UI with glass effects
- 📊 **Dashboard Analytics** - Charts and statistics
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Modern React** - Built with React 18 and hooks

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Firebase project setup

## Installation

1. **Clone or download the project files**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Login page component
│   ├── Register.js       # Registration page component
│   └── Dashboard.js      # Main dashboard component
├── firebase-config.js    # Firebase configuration
├── index.css            # Global styles and Tailwind CSS
├── index.js             # React app entry point
└── App.js               # Main app component with routing
```

## Firebase Setup

The app is already configured with Firebase. The configuration is in `src/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCIPqbz9xqXjfWNWBzMfA3EM0C815ilWAw",
  authDomain: "luxury-auth-app-eed71.firebaseapp.com",
  projectId: "luxury-auth-app-eed71",
  // ... other config
};
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (not recommended)

## Features Overview

### Authentication
- User registration with email/password
- User login with existing credentials
- Password strength validation
- Terms and conditions acceptance
- Automatic redirect after authentication

### Dashboard
- Revenue overview with charts
- Order management
- Customer analytics
- Product performance tracking
- Recent reviews display
- Responsive sidebar navigation

### Design
- Luxury gold theme
- Glass morphism effects
- Smooth animations
- Responsive layout
- Modern UI components

## Technologies Used

- **React 18** - Frontend framework
- **React Router** - Navigation and routing
- **Firebase** - Authentication and backend
- **Tailwind CSS** - Styling framework
- **Chart.js** - Data visualization
- **React Firebase Hooks** - Firebase integration

## Customization

### Colors
The app uses CSS custom properties for theming. You can modify the colors in `src/index.css`:

```css
:root {
  --gold-primary: #d4af37;
  --gold-secondary: #f0e6d2;
  --gold-dark: #b68b22;
  --gold-light: #bfa857;
  --bg-dark: #0b0c10;
  --bg-card: #121417;
  --text-light: #f0e6d2;
}
```

### Firebase Configuration
Update the Firebase configuration in `src/firebase-config.js` with your own Firebase project details.

## Deployment

To deploy the app:

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred hosting service:**
   - Firebase Hosting
   - Vercel
   - Netlify
   - AWS S3

## Support

For any issues or questions, please check the Firebase documentation or React documentation.

## License

This project is for educational purposes. Feel free to modify and use as needed. 