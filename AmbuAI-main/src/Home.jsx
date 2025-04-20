import "./Home.css";
import { Link } from "react-router-dom";
import ambuImage from "./assets/ambu.gif";

function Home() {
  return (
    <div className="home-container">
      <div className="card">
        <div className="image-container">
          <h1 className="home-heading1">
            AI-Powered
          </h1>
          <h1 className="home-heading2">
            Ambulance Detection System
          </h1>
          <div className="text-container">
            <p className="home-caption">
              Our system uses advanced AI to detect ambulances in real-time,
              helping to improve response times and save lives. With our innovative technology, we can accurately identify ambulance sirens and lights, ensuring that emergency services reach their destinations faster. Join us in revolutionizing emergency response!
            </p>
            <Link to="/ambulance-detection" className="home-button try-now">
              Try Now
            </Link>
            <Link to="/learn" className="home-button learn-more">
              Learn More
            </Link>
          </div>
        </div>

        <img src={ambuImage} alt="Ambulance" className="ambu-image" />
      </div>
    </div>
  );
}

export default Home;
