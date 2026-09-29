import "./home.css";
import { useNavigate } from "react-router-dom";


function Home() {

  const navigate = useNavigate();


  return (

    <div className="home-page">


      {/* Navbar */}

      <nav className="navbar">

        <h2>
          JobRecruit
        </h2>


        <div className="nav-links">

          <a href="#about">
            About
          </a>

          <a href="#features">
            Features
          </a>

          <a href="#jobs">
            Jobs
          </a>


        <button>
    Explore Dashboard
       </button>


        </div>

      </nav>



      {/* Hero Section */}

      <section className="hero">


<div className="hero-text">

<h1>
Find Your Dream Career
</h1>


<p>
Connect with top companies and discover
opportunities that match your skills.
</p>


<button onClick={() => navigate("/dashboard")}>
Explore Jobs
</button>


</div>



<div className="hero-image">

<img 
src="/images/bg_home.png"
alt="Career"
/>

</div>


</section>




      {/* About */}

      <section id="about" className="about">


        <h2>
          About JobRecruit
        </h2>


        <p>
          JobRecruit is a modern Job Recruitment and
          Applicant Tracking System that connects
          talented candidates with companies while
          simplifying the recruitment process.
        </p>


      </section>





      {/* Vision Mission */}

      <section className="vision">


        <div className="info-card">

          <h2>
            Our Vision
          </h2>

          <p>
            To become a trusted digital platform
            connecting talented individuals with
            suitable career opportunities.
          </p>

        </div>



        <div className="info-card">

          <h2>
            Our Mission
          </h2>

          <p>
            To provide an efficient recruitment
            platform that helps candidates and
            companies achieve their goals.
          </p>

        </div>


      </section>





      {/* Features */}

      <section id="features" className="features">


        <h2>
          Why Choose JobRecruit?
        </h2>


        <div className="feature-container">


          <div className="feature-card">

            <h3>
              Smart Job Search
            </h3>

            <p>
              Find opportunities matching your skills.
            </p>

          </div>



          <div className="feature-card">

            <h3>
              Easy Applications
            </h3>

            <p>
              Apply and track jobs easily.
            </p>

          </div>



          <div className="feature-card">

            <h3>
              Career Growth
            </h3>

            <p>
              Build your professional future.
            </p>

          </div>


        </div>


      </section>





      {/* Featured Jobs */}

      <section id="jobs" className="jobs">


        <h2>
          Featured Jobs
        </h2>


        <div className="job-container">


          <div className="job-card">

            <h3>
              Frontend Developer
            </h3>

            <p>
              Tech Solutions Ltd
            </p>

          </div>



          <div className="job-card">

            <h3>
              Software Engineer
            </h3>

            <p>
              SoftDev Technologies
            </p>

          </div>



          <div className="job-card">

            <h3>
              Backend Developer
            </h3>

            <p>
              Digital Lanka
            </p>

          </div>


        </div>


      </section>





      <footer>

        <p>
          © 2026 JobRecruit
        </p>

      </footer>


    </div>

  );

}


export default Home;