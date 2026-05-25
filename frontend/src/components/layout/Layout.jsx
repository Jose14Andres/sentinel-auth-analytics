import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
}