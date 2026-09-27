import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./register.css";

function Register() {
  const backgrounds = [
    "/background/bg1.png",
    "/background/bg2.jpg",
    "/background/bg3.jpg",
    "/background/bg4.jpg",
    "/background/bg5.jpg"
  ];

  const [currentBackground, setCurrentBackground] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("candidate");

  // Change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground(
        (previous) => (previous + 1) % backgrounds.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Basic email validation
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert("Registration form submitted successfully!");

    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Email:", email);
    console.log("Role:", role);
  };

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `url(${backgrounds[currentBackground]})`
      }}
    >
      <div className="register-container">

        {/* Header */}
        <div className="register-header">
          <h1>JobRecruit</h1>

          <p>
            Job Recruitment & Applicant Tracking System
          </p>
        </div>


        {/* Registration Form */}
        <form
          className="register-form"
          onSubmit={handleRegister}
        >

          <h2>Create Account</h2>

          <p className="register-subtitle">
            Join JobRecruit today
          </p>


          {/* First Name + Last Name */}
          <div className="name-row">

            <div className="name-field">
              <label htmlFor="firstName">
                First Name
              </label>

              <input
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
              />
            </div>


            <div className="name-field">
              <label htmlFor="lastName">
                Last Name
              </label>

              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
              />
            </div>

          </div>


          {/* Email */}
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


          {/* Password */}
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {/* Confirm Password */}
          <label htmlFor="confirmPassword">
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />


          {/* Account Type */}
          <label htmlFor="role">
            Account Type
          </label>

          <select
            id="role"
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >
            <option value="candidate">
              Candidate
            </option>

            <option value="recruiter">
              Recruiter
            </option>
          </select>


          {/* Register Button */}
          <button
            type="submit"
            className="register-button"
          >
            Create Account
          </button>


          {/* Login Link */}
          <p className="login-text">
            Already have an account?

            <Link to="/">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Register;