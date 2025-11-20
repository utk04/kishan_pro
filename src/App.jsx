import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import StudentRegister from './pages/StudentRegister.jsx';
import StudentLogin from './pages/StudentLogin.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MatchResults from './pages/MatchResults.jsx';
import React from "react";

export default function App(){
  return(
    <BrowserRouter>
      <nav style={{marginBottom:'20px'}}>
        <Link to='/'>Register</Link> | 
        <Link to='/student-login'> Student Login</Link> | 
        <Link to='/admin-login'> Admin Login</Link> 
      </nav>
      <Routes>
        <Route path='/' element={<StudentRegister/>}/>
        <Route path='/student-login' element={<StudentLogin/>}/>
        <Route path='/student-dashboard' element={<StudentDashboard/>}/>
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
        <Route path='/matches' element={<MatchResults/>}/>
      </Routes>
    </BrowserRouter>
  );
}