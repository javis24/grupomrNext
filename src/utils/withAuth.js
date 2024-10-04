// utils/withAuth.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No token found, redirecting to login.");
        router.replace('/login');
      } else {
        try {
          const decoded = jwt.decode(token);  // Decodificamos el token en el frontend
          console.log('Token decoded:', decoded);

          // Verificar si el token ha expirado
          if (decoded.exp * 1000 < Date.now()) {
            console.error("Token has expired");
            localStorage.removeItem('token');
            router.replace('/login');
          } else {
            setIsAuthenticated(true);
            setUserData(decoded);
          }
        } catch (error) {
          console.error('Token decoding failed:', error.message);
          localStorage.removeItem('token');  // Limpiar el token si hay algún error
          router.replace('/login');
        } finally {
          setLoading(false);
        }
      }
    }, [router]);

    if (loading) {
      return <p className="text-center text-white">Cargando...</p>;
    }

    return isAuthenticated ? <WrappedComponent {...props} userData={userData} /> : null;
  };
};

export default withAuth;
