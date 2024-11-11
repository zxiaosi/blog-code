import { Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

function SuspenseDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <button onClick={() => setIsOpen((x) => !x)}>toggle</button>
      {isOpen && (
        <Suspense fallback="loading...">
          <Thing1 />
          <Thing2 />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

export default SuspenseDemo;

function Thing1() {
  const query = useSuspenseQuery({
    queryKey: ['thing1'],
    queryFn: async () => {
      console.log('start loading thing1');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('done loading thing1');
      return 'Thing1';
    },
  });
  return <div>{query.data}</div>;
}

function Thing2() {
  const query = useSuspenseQuery({
    queryKey: ['thing2'],
    queryFn: async () => {
      console.log('start loading thing2');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('done loading thing2');
      return 'Thing2';
    },
  });
  return <div>{query.data}</div>;
}
