import React, { useState, useContext } from 'react';
import '../../App.css';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';

const Signin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { signinUser } = useContext(AuthContext);

    const submitHandler = async (event) => {
        event.preventDefault();

        try {
            await signinUser(username, password);
        } catch (error) {
            console.error("Signin error:", error);
            if (error.response && error.response.status === 401) {
                setErrorMessage("Invalid credentials. Please enter correct username/email and password.");
            } else {
                setErrorMessage("Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <div>
            <div className='d-flex justify-content-center align-items-center vh-100 bg-image'>
                <div className='bg-white p-3 rounded custom-box-shadow custom-width'>
                    <h3 className='text-center'>Sign In</h3>
                    <hr />
                    <form onSubmit={submitHandler}>
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                        <div className='mb-3'>
                            <label htmlFor='username'><strong>Email</strong></label>
                            <input
                                type='text'
                                placeholder='Enter your email'
                                className='form-control'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className='mb-3'>
                            <label htmlFor='password'><strong>Password</strong></label>
                            <input
                                type='password'
                                placeholder='Enter your password'
                                className='form-control'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type='submit' className='btn btn-success w-100'>Sign in</button>
                        <div className='text-center'>
                            <p className='mb-0'>Or</p>
                            <p>Don't have an account yet?</p>
                        </div>
                        <Link to='/signup' className='btn btn-default border w-100'>Sign up</Link>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signin;
