import { useNavigate } from "react-router-dom";
import "./Home.css";


function Home(){
  const navigate = useNavigate();
    return(

        <div className="home-page">


            {/* Navigation Bar */}

            <nav className="navbar">


                <div className="logo">

                    👥 <span>JobRecruit</span>

                </div>



                <div className="nav-links">

                    <a className="active">
                        Home
                    </a>

                    <a>
                        About
                    </a>

                    <a>
                        Jobs
                    </a>

                    <a>
                        Companies
                    </a>

                    <a>
                        Contact
                    </a>

                </div>



                <div className="buttons">

                    <button 
                   className="login-btn"
                   onClick={()=>navigate("/login")}
>
                     Login
                    </button>


                   <button 
                   className="register-btn"
                onClick={()=>navigate("/register")}
>
                  Register
                   </button>

                </div>


            </nav>




            {/* Hero Section */}


            <section className="hero">


                <div className="hero-content">


                    <div className="line"></div>


                    <p className="small-text">
                        YOUR NEXT OPPORTUNITY STARTS HERE
                    </p>



                    <h1>

                        Find Your
                        <br/>

                        <span>
                            Dream Job
                        </span>

                    </h1>



                    <p className="description">

                    Connect with top companies, explore exciting
                    <br/>
                    career opportunities, and build a brighter future.

                    </p>




                    {/* Search Bar */}


                    <div className="search-box">


                        <div className="search-item">

                            🔍
                            <span>
                            Job title, keywords...
                            </span>

                        </div>



                        <div className="divider"></div>



                        <div className="search-item">

                            📍
                            <span>
                            Location
                            </span>

                        </div>



                        <button>
                            Search
                        </button>


                    </div>


                </div>


            </section>





            {/* Feature Cards */}


            <div className="cards">


                <div className="card">

                    <h3>
                    💼 Wide Job Opportunities
                    </h3>

                    <p>
                    Explore thousands of jobs
                    from top companies.
                    </p>

                </div>




                <div className="card">

                    <h3>
                    🏢 Top Companies
                    </h3>

                    <p>
                    Discover trusted companies
                    hiring talent like you.
                    </p>

                </div>




                <div className="card">

                    <h3>
                    👥 Build Your Career
                    </h3>

                    <p>
                    Get the tools and support
                    to grow your career.
                    </p>

                </div>




                <div className="card">

                    <h3>
                    📄 Easy Application
                    </h3>

                    <p>
                    Apply to multiple jobs
                    with ease.
                    </p>

                </div>


            </div>



        </div>


    )

}


export default Home;