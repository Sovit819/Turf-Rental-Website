// Signup.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        phone_number: ''
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.id]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/signup/', formData);
            setSuccessMessage('Signup successful! Redirecting to signin page...');
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (error) {
            if (error.response) {
                if (error.response.data.error === 'Username already exists') {
                    setErrorMessage('Username already exists');
                } else if (error.response.data.error === 'Email already exists') {
                    setErrorMessage('Email already exists');
                } else {
                    setErrorMessage('Error signing up. Please try again.');
                }
            } else {
                console.error('Error:', error);
                setErrorMessage('Error signing up. Please try again.');
            }
        }
    };

    return (
        <div>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <div className='d-flex justify-content-center align-items-center  mt-2 mb-2'>
                <div className='bg-white p-4 rounded custom-box-shadow custom-width'>
                    <h3 className='text-center'>Sign Up</h3>
                    <hr />
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label htmlFor='first_name'>First Name</label>
                            <input type='text' id='first_name'
                                placeholder='Enter your first name'
                                className='form-control'
                                onChange={handleChange}
                                required />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='last_name'>Last Name</label>
                            <input type='text' id='last_name'
                                placeholder='Enter your last name'
                                className='form-control'
                                onChange={handleChange} />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='email'>Email</label>
                            <input type='email' id='email'
                                placeholder='Enter your email'
                                className='form-control'
                                onChange={handleChange} required />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='username'>Username</label>
                            <input type='text' id='username'
                                placeholder='Enter your username'
                                className='form-control'
                                onChange={handleChange} required />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='password'>Password</label>
                            <input type='password' id='password'
                                placeholder='Enter your password'
                                className='form-control'
                                onChange={handleChange} required />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='phone_number'>Phone Number</label>
                            <input type='text' id='phone_number'
                                placeholder='Enter your phone number'
                                className='form-control'
                                onChange={handleChange} required />
                        </div>

                        <button type='submit' className='btn btn-success w-100 mt-3'>Sign up</button>

                        <div className='text-center mt-2'>
                            <p>Already have an account?</p>
                        </div>
                        <Link to='/signin' className='btn btn-default border w-100'>Sign in</Link>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
