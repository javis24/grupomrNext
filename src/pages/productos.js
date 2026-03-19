import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import Products from '@/components/ProductCatalog';


export default function mkt() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        <Products />
      </main>
    </div>
  );
}
