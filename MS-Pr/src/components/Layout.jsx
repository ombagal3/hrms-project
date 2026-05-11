export default function Layout({ children }) {
  return (
    <div className="app-layout">
      
      {/* Sidebar */}
      <div className="app-sidebar bg-dark text-white p-3">
        <h4>HRMS</h4>
        <ul className="list-unstyled">
          <li>Dashboard</li>
          <li>Employees</li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-grow-1">
        {/* Navbar */}
        <div className="bg-light p-2 border">
          <h5>Welcome Admin</h5>
        </div>

        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
