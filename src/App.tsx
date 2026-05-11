import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { MemoriesPage } from "@/pages/MemoriesPage";
import { GrowthPage } from "@/pages/GrowthPage";
import { InsightsPage } from "@/pages/InsightsPage";
import { PersonPage } from "@/pages/PersonPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/growth" element={<GrowthPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/person/:id" element={<PersonPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
