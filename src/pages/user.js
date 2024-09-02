// src/pages/manage.js
import UserList from '@/components/UserList';
import Sidebar from '@/components/Sidebar';


export default function User() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
    <Sidebar />
    <main className="flex-1 p-8">
      <UserList />
    </main>
  </div>
  );
}
