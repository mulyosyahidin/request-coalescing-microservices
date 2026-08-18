export default function ProductsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Product List</h1>
      <p className="mb-4 text-gray-600">Products will be fetched from the KrakenD API Gateway here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="h-40 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-400">
              Image Placeholder
            </div>
            <h2 className="text-xl font-semibold mb-2">Product {i}</h2>
            <p className="text-gray-600 mb-4 text-sm">Brief description for product {i}.</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">$99.99</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
