export default function Layout({ children }) {
  return (
    <div className="d-flex">
      
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: "200px", height: "100vh" }}>
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