import "./App.css";
import Resolver from "./Resolver";
import { Routes, Route } from "react-router-dom";
import { FormContainer, Loader } from "./components";
import { useLinkContract } from "./hooks";

function App() {
  const { link } = useLinkContract();

  if (!link) return <Loader message="Starting the website Hold On...." />;

  return (
    <Routes>
      <Route index element={<FormContainer />} />
      <Route path=":slug" element={<Resolver />} />
    </Routes>
  );
}

export default App;
