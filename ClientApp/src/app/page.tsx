export default function Home() {
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
    </div>
  );
}
