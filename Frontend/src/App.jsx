import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// import { AuthProvider } from './Context/AuthContext';

import Signup from './Components/user/Signup';
import Signin from './Components/user/Signin';
import Home from './Components/Home';
import PrivateRoute from './Utils/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      {/* <AuthProvider> */}
        <Routes>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<PrivateRoute element={<Home />} />} />
        </Routes>
      {/* </AuthProvider> */}
    </BrowserRouter>
  );
}

export default App;
