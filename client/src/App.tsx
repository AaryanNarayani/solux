import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Search from './pages/Search';
import TransactionDetail from './pages/TransactionDetail';
import BlockDetail from './pages/BlockDetail';
import AddressDetail from './pages/AddressDetail';
import TokenDetail from './pages/TokenDetail';
import NotFound from './pages/NotFound';
import WaveBackground from './components/animations/WaveBackground';
import { NetworkProvider } from './contexts/NetworkContext';

function App() {
  return (
    <NetworkProvider>
      <Router>
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
          {/* Global Wave Background */}
          <div className="fixed inset-0 -z-10">
            <WaveBackground intensity="high" />
          </div>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/transaction/:signature" element={<TransactionDetail />} />
            <Route path="/block/:slot" element={<BlockDetail />} />
            <Route path="/address/:address" element={<AddressDetail />} />
            <Route path="/token/:mint" element={<TokenDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
              },
            }}
          />
        </div>
      </Router>
    </NetworkProvider>
  );
}

export default App;
