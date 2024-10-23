import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import QRCodeReader from '@/components/QRCodeReader';

export default function QRCode() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        <QRCodeReader  />
      </main>
    </div>
  );
}
