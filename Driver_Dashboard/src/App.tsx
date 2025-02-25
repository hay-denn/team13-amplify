import { Navbar } from "./Components/Navbar";
import { useState } from "react";
import { Home } from "./Components/Home";
function App() {
  const [count, setCount] = useState<number>(1);
  const [companyName, setCompanyName] = useState("");
  return (
    <div className="app">
      <Navbar companyName={companyName}></Navbar>
      <Home userFName="Matthew" companyName={companyName}></Home>
    </div>
  );
}

export default App;
