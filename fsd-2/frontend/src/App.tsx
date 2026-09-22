import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentHome from './pages/StudentHome';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import CommunityPage from './pages/CommunityPage';
import CreateEvent from './pages/CreateEvent';
import CommunityHub from './pages/CommunityHub';
import EventDetails from './pages/EventDetails';
import Leaderboard from './pages/Leaderboard';
import ManageMembers from './pages/ManageMembers';
import EditEvent from './pages/EditEvent';
import EventRegister from './pages/EventRegister';
import EventRegistrations from './pages/EventRegistrations';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route 
            path="/communities" 
            element={
              <ProtectedRoute>
                <CommunityHub />
              </ProtectedRoute>
            } 
          />
          <Route path="/events" element={<Landing />} />
          
          <Route 
            path="/event/:eventId" 
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/home" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentHome />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          

          
          <Route 
            path="/community/:communityId/create-event" 
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/community/:communityId/manage-members" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageMembers />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/community/:id" 
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/event/:eventId/edit" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EditEvent />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/event/:eventId/register" 
            element={
              <ProtectedRoute requiredRole="student">
                <EventRegister />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/event/:eventId/registrations" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EventRegistrations />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;