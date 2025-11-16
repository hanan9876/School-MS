import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RiAdminFill } from "react-icons/ri";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import './Welcome.css'

const Welcome = () => {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    navigate(`/${role}-login`);
  };

  return (
    <div className='welcome-container'>
      <div className='welcome-background'>
        <div className='background-shapes'>
          <div className='shape shape-1'></div>
          <div className='shape shape-2'></div>
          <div className='shape shape-3'></div>
        </div>
      </div>
      
      <div className='welcome-content'>
        <div className='heading-section'>
          <h1 className='main-title'>Welcome to</h1>
          <h1 className='system-title'>School Management System</h1>
          <p className='subtitle'>Choose your role to continue</p>
        </div>

        <div className='roles-grid'>
          <div 
            className='role-card admin-card' 
            onClick={() => handleRoleClick('admin')}
            onMouseEnter={(e) => e.currentTarget.classList.add('hovered')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('hovered')}
          >
            <div className='card-icon admin-icon'>
              <RiAdminFill />
            </div>
            <div className='card-content'>
              <h2>Admin</h2>
              <p style={{color:"rgba(255, 255, 255, 0.95)"}}>Manage the entire system</p>
            </div>
            <div className='card-overlay'></div>
          </div>

          <div 
            className='role-card teacher-card' 
            onClick={() => handleRoleClick('teacher')}
            onMouseEnter={(e) => e.currentTarget.classList.add('hovered')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('hovered')}
          >
            <div className='card-icon teacher-icon'>
              <FaChalkboardTeacher />
            </div>
            <div className='card-content'>
              <h2>Teacher</h2>
              <p style={{color:"rgba(255, 255, 255, 0.95)"}}>Manage classes and attendance</p>
            </div>
            <div className='card-overlay'></div>
          </div>

          <div 
            className='role-card student-card' 
            onClick={() => handleRoleClick('student')}
            onMouseEnter={(e) => e.currentTarget.classList.add('hovered')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('hovered')}
          >
            <div className='card-icon student-icon'>
              <PiStudentBold />
            </div>
            <div className='card-content'>
              <h2>Student</h2>
              <p style={{color:"rgba(255, 255, 255, 0.95)"}}>View your information</p>
            </div>
            <div className='card-overlay'></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
