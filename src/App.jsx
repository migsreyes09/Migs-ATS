import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApplicantTracker from "./ApplicantTracker";
import ApplicationForm from "./ApplicationForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicantTracker />} />
        <Route path="/apply" element={<ApplicationForm />} />
      </Routes>
    </BrowserRouter>
  );
}
