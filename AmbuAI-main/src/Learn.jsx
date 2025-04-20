import React from "react";
import "./Learn.css"; // Importing the CSS file for styling

const Learn = () => {
  return (
    <div className="home-container-learn">
      <div className="card-learn">
        <h1 style={{color:'hsl(0, 73%, 51%)'}}>Ambulance Detection System</h1>
        <p>
          Welcome to the Ambulance Detection System project! This application
          utilizes advanced image processing techniques and AI models to detect
          ambulances in real-time.
        </p>
        <h2>Project Overview</h2>
        <p>
          The goal of this project is to enhance emergency response times by
          accurately identifying ambulances on the road. By leveraging
          state-of-the-art machine learning algorithms, we can analyze video
          feeds and images to detect ambulances, ensuring that they receive
          priority on the road.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>Real-time ambulance detection using image processing.</li>
          <li>Integration with AI models for improved accuracy.</li>
          <li>User-friendly interface for easy navigation.</li>
          <li>Responsive design for mobile and desktop users.</li>
        </ul>
        <h2>Technologies Used</h2>
        <p>This project is built using the following technologies:</p>
        <ul>
          <li>React for the front-end framework.</li>
          <li>Python Tessaract for running feature Programming.</li>
          <li>OpenCV for image processing tasks.</li>
        </ul>
        <h2>Get Started</h2>
        <p>
          To learn more about the project, navigate to the "Ambulance Detection"
          page where you can see the system in action!
        </p>
      </div>
    </div>
  );
};

export default Learn;
