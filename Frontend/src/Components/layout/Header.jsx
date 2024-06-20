import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src="/Images/logo.png" alt="Brand Logo" height="50" className="d-inline-block align-text-top" />
                    AOne Turf
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/explore">Explore</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">About Us</Link>
                        </li>
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <span className="navbar-text me-2">Hello, {user.username}</span>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-secondary" onClick={logoutUser}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="btn btn-primary me-2" to="/signin">Sign In</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-secondary" to="/signup">Sign Up</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Header;
