import { useRouter } from 'next/router';
import { useEffect } from 'react';
import jwt from 'jsonwebtoken';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No token found, redirecting to login.");
        router.push('/login');
      } else {
        try {
          // Usar jwt.decode() en lugar de jwt.verify()
          const decoded = jwt.decode(token);  // Solo decodificamos el token en el frontend
          console.log('Token decoded:', decoded);

          // Si es necesario, puedes agregar más validaciones aquí, como chequear si el token ha expirado
          if (decoded.exp * 1000 < Date.now()) {
            console.error("Token has expired");
            localStorage.removeItem('token');
            router.push('/login');
          }
        } catch (error) {
          console.error('Token decoding failed:', error.message);
          localStorage.removeItem('token');  // Limpiar el token si hay algún error
          router.push('/login');
        }
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;