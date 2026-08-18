import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { ThemeToggle } from "../components/ThemeToggle";
import { cookies } from "next/headers";
import { logoutAction } from "./actions/auth";

export const metadata: Metadata = {
  title: "RequestCoalescing Store",
  description: "E-Commerce demonstration app for API Gateway Request Coalescing experiments",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const isAuthenticated = !!token;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navigation Header */}
          <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md bg-opacity-95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Brand Logo */}
                <div className="flex items-center space-x-3">
                  <a href="/" className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                      RC
                    </div>
                    <div>
                      <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        CoalesceStore
                      </span>
                      <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-gray-800">
                        Experiment Mode
                      </span>
                    </div>
                  </a>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                  <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                    Home
                  </a>
                  <a href="/products" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                    Products
                  </a>
                </nav>

                {/* User Actions */}
                <div className="flex items-center space-x-3">
                  {isAuthenticated ? (
                    <>
                      <a
                        href="/customer/dashboard"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        Dashboard
                      </a>
                      <form action={logoutAction}>
                        <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          Sign out
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        Sign In
                      </a>
                      <a
                        href="/register"
                        className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition"
                      >
                        Create Account
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    RC
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    © 2026 RequestCoalescing Project — KrakenD + Go Microservices + Next.js
                  </p>
                </div>
                <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <a href="/products" className="hover:text-indigo-600 transition">Products</a>
                  {isAuthenticated ? (
                    <a href="/customer/dashboard" className="hover:text-indigo-600 transition">Dashboard</a>
                  ) : (
                    <>
                      <a href="/login" className="hover:text-indigo-600 transition">Login</a>
                      <a href="/register" className="hover:text-indigo-600 transition">Register</a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </footer>
          
          {/* Theme Toggle Button */}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
