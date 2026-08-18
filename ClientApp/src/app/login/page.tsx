export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500" 
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-200 focus:border-blue-500" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="button" 
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-medium mt-4"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <a href="#" className="text-blue-600 hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
}
