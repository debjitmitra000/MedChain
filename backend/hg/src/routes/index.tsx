import { Button } from '@/components/ui/button';
import { useHypergraphApp, useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { redirectToConnect } = useHypergraphApp();
  const { authenticated } = useHypergraphAuth();

  const handleSignIn = () => {
    redirectToConnect({
      storage: localStorage,
      connectUrl: 'https://connect.geobrowser.io/',
      successUrl: `${window.location.origin}/authenticate-success`,
      redirectFn: (url: URL) => {
        window.location.href = url.toString();
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <img src="/hypergraph.svg" alt="Hypergraph Logo" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MedChain Hypergraph
        </h1>
        <p className="text-lg text-muted-foreground">Pharmaceutical Supply Chain Transparency via Hypergraph</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Section 1: Explore existing public knowledge */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Explore Public Knowledge</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Discover and explore the vast network of knowledge already available in the public Knowledge Graph.
            </p>
            <Link to="/explore-public-knowledge">
              <Button variant="outline" className="w-full">
                Start Exploring
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 2: Conditional content based on authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            {authenticated ? (
              <>
                <h3 className="text-xl font-semibold mb-3">Go to Geo Connect</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Go to Geo Connect to manage your private data and publish it to the public Knowledge Graph.
                </p>
                <Button onClick={handleSignIn} className="w-full bg-primary hover:bg-primary/90">
                  Go to Geo Connect
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-3">Manage Your Data</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Sign in with Geo Connect to manage your private data and publish it to the public Knowledge Graph.
                </p>
                <Button onClick={handleSignIn} className="w-full bg-primary hover:bg-primary/90">
                  Sign in with Geo Connect
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Section 3: MedChain Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">MedChain Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              View pharmaceutical manufacturers, medicine batches, and supply chain data indexed via Hypergraph.
            </p>
            <Button variant="outline" className="w-full" disabled>
              View Dashboard (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
