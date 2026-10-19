import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { currentUser, dashboardFor, getToken } from '../services/authService';

export default function ProtectedRoute({ role, children }) {
  const { pathname } = useLocation();
  const [verification, setVerification] = useState(null);
  const loginPath = role === 'admin' ? '/admin/login' : '/login';

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    if (getToken()) {
      currentUser(controller.signal)
        .then(({ user }) => {
          if (active) setVerification({ pathname, user });
        })
        .catch((error) => {
          if (!active) return;
          setVerification({ pathname, error });
        });
    }
    return () => { active = false; controller.abort(); };
  }, [pathname]);

  if (!getToken()) return <Navigate to={loginPath} replace state={{ message: verification?.error?.status === 401 ? verification.error.message : undefined }} />;
  if (!verification || verification.pathname !== pathname) {
    return <p role="status">Verifying your session...</p>;
  }
  if (verification.error) {
    if (verification.error.status === 401) return <Navigate to={loginPath} replace />;
    return <div role="alert">{verification.error.message} <button onClick={() => window.location.reload()}>Retry</button></div>;
  }
  if (role && verification.user.role !== role) {
    return <Navigate to={dashboardFor(verification.user.role)} replace />;
  }
  return children;
}
