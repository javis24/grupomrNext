import React from 'react';

const WhatsAppButton = ({ phoneNumber, message }) => {
  const formattedNumber = phoneNumber.replace(/\D/g, ''); // Elimina todos los caracteres que no sean números

  const handleClick = () => {
    const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank'); // Abre en una nueva pestaña
  };

  return (
    <button
      onClick={handleClick}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      Contactar vía WhatsApp
    </button>
  );
};

export default WhatsAppButton;
