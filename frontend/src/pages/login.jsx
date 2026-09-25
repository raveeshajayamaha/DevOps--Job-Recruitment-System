import { useState, useEffect } from "react";
import "./login.css";

function Login() {

  const backgrounds = [
    "/background/bg1.png",
    "/background/bg2.jpg",
    "/background/bg3.jpg",
    "/background/bg4.jpg",
    "/background/bg5.jpg"
  ];


  const [currentBackground, setCurrentBackground] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  // Change background every 1 minute
  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentBackground((previous) =>
        (previous + 1) % backgrounds.length
      );

    }, 5000);


    return () => clearInterval(interval);

  }, []);



  const handleLogin = (e) => {

    e.preventDefault();


    if (!email || !password) {

      alert("Please enter both email and password.");

      return;
    }


    if (!email.includes("@")) {

      alert("Please enter a valid email address.");

      return;
    }


    alert("Login form submitted successfully!");


    console.log("Email:", email);
    console.log("Password:", password);

  };



  return (

    <div
      className="login-page"
      style={{
        backgroundImage: `url(${backgrounds[currentBackground]})`
      }}
    >


      <div className="login-container">


        <div className="login-header">

          <h1>
            JobRecruit
          </h1>


          <p>
            Job Recruitment & Applicant Tracking System
          </p>


        </div>



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



          <label>
            Email Address
          </label>


          <input

            type="email"

            placeholder="Enter your email"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

          />



          <label>
            Password
          </label>


          <input

            type="password"

            placeholder="Enter your password"

            value={password}

            onChange={(e) =>
              setPassword(e.target.value)
            }

          />



          <div className="forgot-password">

            <a href="#">
              Forgot Password?
            </a>

          </div>



          <button
            type="submit"
            className="login-button"
          >

            Login

          </button>




          <p className="register-text">

            Don't have an account?

            <a href="#">
              Register
            </a>

          </p>



        </form>



      </div>



    </div>

  );

}


export default Login;