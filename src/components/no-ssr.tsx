import dynamic from 'next/dynamic';
import React from 'react';

type NoSSRProps = {
  children: React.ReactNode;
};

function NoSSR({ children }: NoSSRProps) {
  return <>{children}</>;
}

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});
