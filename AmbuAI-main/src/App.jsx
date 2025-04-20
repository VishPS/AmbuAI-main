// ambulance/src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./Home.jsx";
import Learn from "./Learn.jsx";
import AmbulanceDetection from "./AmbulanceDetection.jsx";

function App() {
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    // Set the initial theme based on the state
    document.body.classList.toggle("light-theme", isLightTheme);
  }, [isLightTheme]);

  const toggleTheme = () => {
    setIsLightTheme((prev) => !prev);
  };

  return (
    <Router>
      <>
        <nav>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/ambulance-detection">Ambulance Detection</Link>
            </li>
          </ul>
          <div className="theme-toggle">
            {" "}
            {/* Apply the new class here */}
            <label className="switch">
              <input
                type="checkbox"
                checked={isLightTheme}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
          </div>
        </nav>

        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/ambulance-detection" element={<AmbulanceDetection />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
