import { Navigate } from 'react-router-dom';

// Magic Link handles both login and registration.
// Redirect to the login page.
function Register() {
  return <Navigate to="/login" replace />;
}

export default Register;
