import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import VehicleSearch from "@/components/home/VehicleSearch";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Offers from "@/components/home/Offers";
import BestSellers from "@/components/home/BestSellers";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Brands from "@/components/home/Brands";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import Newsletter from "@/components/home/Newsletter";
import Contact from "@/components/home/Contact";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col">
      <Navbar />
      <Hero />
      <VehicleSearch />
      <Categories />
      <FeaturedProducts />
      <Offers />
      <BestSellers />
      <WhyChooseUs />
      <Brands />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <Contact />
      <Footer />
    </main>
  );
}