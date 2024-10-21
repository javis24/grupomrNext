import Sidebar from '@/components/Sidebar';
import UploadList from '@/components/UploadList';
import '../app/globals.css';


export default function archivos() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        <UploadList />
      </main>
    </div>
  );
}
