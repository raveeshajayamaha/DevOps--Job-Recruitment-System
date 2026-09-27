import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function Login() {

  // React Router navigation
  const navigate = useNavigate();


  // ==============================
  // Background Images
  // ==============================

  const backgrounds = [
    "/background/bg1.png",
    "/background/bg2.jpg",
    "/background/bg3.jpg",
    "/background/bg4.jpg",
    "/background/bg5.jpg"
  ];


  // Current background
  const [currentBackground, setCurrentBackground] = useState(0);


  // ==============================
  // Login Form Data
  // ==============================

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");


  // ==============================
  // Background Slideshow
  // ==============================

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentBackground(
        (previous) =>
          (previous + 1) % backgrounds.length
      );

    }, 5000);


    // Clear interval when component is removed
    return () => clearInterval(interval);

  }, []);


  // ==============================
  // Login Function
  // ==============================

  const handleLogin = (e) => {

    // Prevent page refresh
    e.preventDefault();


    // Check empty fields
    if (!email || !password) {

      alert(
        "Please enter both email and password."
      );

      return;
    }


    // Basic email validation
    if (!email.includes("@")) {

      alert(
        "Please enter a valid email address."
      );

      return;
    }


    // ==================================
    // TEMPORARY FRONTEND LOGIN
    // ==================================
    //
    // Real authentication will be added
    // later with Node.js + MongoDB.
    //

    alert("Login successful!");


    // ==================================
    // Navigate to Candidate Dashboard
    // ==================================

    navigate("/candidate/dashboard");

  };


  // ==============================
  // UI
  // ==============================

  return (

    <div
      className="login-page"

      style={{
        backgroundImage:
          `url(${backgrounds[currentBackground]})`
      }}
    >

      <div className="login-container">


        {/* ============================== */}
        {/* Header */}
        {/* ============================== */}

        <div className="login-header">

          <h1>
            JobRecruit
          </h1>

          <p>
            Job Recruitment & Applicant Tracking System
          </p>

        </div>


        {/* ============================== */}
        {/* Login Form */}
        {/* ============================== */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          <h2>
            Welcome Back!
          </h2>


          <p className="login-subtitle">
            Login to your account
          </p>


          {/* ============================== */}
          {/* Email */}
          {/* ============================== */}

          <label htmlFor="email">
            Email Address
          </label>


          <input
            id="email"

            type="email"

            placeholder="Enter your email"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }
          />


          {/* ============================== */}
          {/* Password */}
          {/* ============================== */}

          <label htmlFor="password">
            Password
          </label>


          <input
            id="password"

            type="password"

            placeholder="Enter your password"

            value={password}

            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {/* ============================== */}
          {/* Forgot Password */}
          {/* ============================== */}

          <div className="forgot-password">

            <a href="#">
              Forgot Password?
            </a>

          </div>


          {/* ============================== */}
          {/* Login Button */}
          {/* ============================== */}

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>


          {/* ============================== */}
          {/* Register Navigation */}
          {/* ============================== */}

          <p className="register-text">

            Don't have an account?

            <Link to="/register">
              Register
            </Link>

          </p>

        </form>

      </div>

    </div>

  );
}


export default Login;