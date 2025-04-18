import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import CreditForm from '@/components/CreditRequestForm';

export default function Creditos() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        <CreditForm />
      </main>
    </div>
  );
}
