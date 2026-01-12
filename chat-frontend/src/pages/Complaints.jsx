import { Outlet } from "react-router-dom";

function Complaints() {
  return (
    <div>
      <h2>Complaints</h2>
      <Outlet />
    </div>
  );
}

export default Complaints;
