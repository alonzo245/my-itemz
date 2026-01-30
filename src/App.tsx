import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/components/Toast";
import { BottomNav } from "@/components/BottomNav";
import { FAB } from "@/components/FAB";
import { Home } from "@/pages/Home";
import { AddItemWizard } from "@/pages/AddItemWizard";
import { ItemDetail } from "@/pages/ItemDetail";
import { CategoryManagement } from "@/pages/CategoryManagement";
import { Statistics } from "@/pages/Statistics";
import { Insights } from "@/pages/Insights";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen pb-20 pt-4">{children}</main>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
                <FAB />
              </Layout>
            }
          />
          <Route path="/items/new" element={<AddItemWizard />} />
          <Route
            path="/items/:id"
            element={
              <Layout>
                <ItemDetail />
              </Layout>
            }
          />
          <Route
            path="/categories"
            element={
              <Layout>
                <CategoryManagement />
              </Layout>
            }
          />
          <Route
            path="/stats"
            element={
              <Layout>
                <Statistics />
              </Layout>
            }
          />
          <Route
            path="/insights"
            element={
              <Layout>
                <Insights />
              </Layout>
            }
          />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
