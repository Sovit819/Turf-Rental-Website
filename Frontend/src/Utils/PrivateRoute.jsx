import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../Context/AuthContext';

const PrivateRoute = ({ element }) => {
    const { user } = useContext(AuthContext);

    return user ? element : <Navigate to='/signin' />;
}

export default PrivateRoute;
