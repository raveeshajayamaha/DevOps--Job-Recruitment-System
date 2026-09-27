import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/candidate/dashboard";


function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

<Route path="/candidate/dashboard" element={<Dashboard />} />
      </Routes>

    </BrowserRouter>
  );

}

export default App;