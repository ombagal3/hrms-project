import React from 'react';
import './home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Background Bubbles */}
      <div className="bubbles-wrapper">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

      <div className="content">
        <h1>Welcome To Our Company</h1>
        {/* <p>Aapka content yahan aayega.</p> */}
        
      </div>
    </div>
  );
};

export default Home;