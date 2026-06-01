import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SaleBanner from "@/components/layout/SaleBanner";

export default function ShopLayout({ children } : { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SaleBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
