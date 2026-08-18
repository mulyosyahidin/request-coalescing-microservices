export default function Home() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to RequestCoalescing Store</h1>
      <p className="text-lg text-gray-600 max-w-2xl">
        This is a demo client application for testing KrakenD API Gateway request coalescing features.
      </p>
      
      <div className="mt-8 flex gap-4">
        <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Browse Products
        </a>
      </div>

      <div className="mt-12 w-full max-w-2xl border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Test Microservices Connectivity</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Click the links below to hit the root <code>GET /</code> endpoint of each backend service, routed through KrakenD API Gateway.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href={`${API_BASE}/welcome/auth`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            Ping Auth Service
          </a>
          <a 
            href={`${API_BASE}/welcome/product`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition"
          >
            Ping Product Service
          </a>
          <a 
            href={`${API_BASE}/welcome/order`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition"
          >
            Ping Order Service
          </a>
        </div>
      </div>
    </div>
  );
}
