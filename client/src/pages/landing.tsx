import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Shield, BarChart, Link, Wallet } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-primary-600 mr-2" />
            <h1 className="text-xl font-semibold text-primary-600">BudgetTrack</h1>
          </div>
          <div>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Take control of your</span>
              <span className="block text-primary-600">financial future</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500 sm:max-w-3xl">
              Connect your accounts, track your spending, and reach your financial goals with our secure and easy-to-use budgeting platform.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild className="px-8 py-3 text-base font-medium">
                <a href="/api/login">Get Started Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our comprehensive budgeting tools help you stay on top of your money.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                <Link className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Connect Your Accounts</h3>
              <p className="mt-2 text-base text-gray-500">
                Securely link your bank accounts, credit cards, and investment accounts to get a complete financial picture.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Track Your Spending</h3>
              <p className="mt-2 text-base text-gray-500">
                Automatically categorize transactions and see where your money is going with detailed reports and visualizations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Bank-Level Security</h3>
              <p className="mt-2 text-base text-gray-500">
                Your financial data is protected with industry-leading encryption and security practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to start your financial journey?
          </h2>
          <p className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their finances with BudgetTrack.
          </p>
          <div className="mt-8">
            <Button variant="secondary" size="lg" asChild className="px-8 py-3 text-base font-medium">
              <a href="/api/login">Sign Up For Free</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Wallet className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-lg font-semibold text-primary-600">BudgetTrack</span>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-500">
              &copy; {new Date().getFullYear()} BudgetTrack. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
