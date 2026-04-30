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

            <div className='' style={{ width: "100%", height: "50%" }}>
                <div className="content ">
                    <h1>Welcome To Our Company</h1>
                    <h1>Darshan Mart</h1>
                    {/* <p>Aapka content yahan aayega.</p> */}
                </div>
                <div className='d-flex gap-5 justify-content-center' style={{width:"100%"}}>
                    <div className=''>
                        <div class="card mt-5 bg-transparent border border-4 rounded-4" style={{ width: "18rem", borderColor: "white" }}>
                            <div class="card-body d-flex flex-column p-5">
                                <h5 class="card-title text-center text-white fs-2">Admin</h5>
                                <button className='btn rounded-4'>Go To</button>
                            </div>
                        </div>
                    </div>
                    <div className=''>
                        <div class="card mt-5 bg-transparent border border-4 rounded-4" style={{ width: "18rem", borderColor: "white" }}>
                            <div class="card-body d-flex flex-column p-5">
                                <h5 class="card-title text-center text-white fs-2">Manager</h5>
                                <button className='btn rounded-4'>Go To</button>
                            </div>
                        </div>
                    </div>
                    <div className=''>
                        <div class="card mt-5 bg-transparent border border-4 rounded-4" style={{ width: "18rem", borderColor: "white" }}>
                            <div class="card-body d-flex flex-column p-5">
                                <h5 class="card-title text-center text-white fs-2">Employee</h5>
                                <button className='btn rounded-4'>Go To</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;