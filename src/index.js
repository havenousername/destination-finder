import {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App.js";
import reportWebVitals from "./reportWebVitals";
import AuthProvider from "./components/AuthProvider/AuthProvider.jsx";
import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
console.log(window.location.origin);
root.render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
