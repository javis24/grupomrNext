import Sidebar from '@/components/Sidebar';
import FileUploadWithSendEmail from '@/components/FileUploadWithSendEmail';
import '../app/globals.css';


export default function mkt() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-0">
        <FileUploadWithSendEmail />
      </main>
    </div>
  );
}
