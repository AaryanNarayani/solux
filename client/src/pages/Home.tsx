import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import NetworkStats from '../components/sections/NetworkStats';

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main>
        <Hero />
        <NetworkStats />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home; 