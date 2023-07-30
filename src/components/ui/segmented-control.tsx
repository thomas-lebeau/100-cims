'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/cn';

const SegmentedControl = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Tabs>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Tabs {...props}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
    >
      {children}
    </TabsPrimitive.List>
  </TabsPrimitive.Tabs>
));
SegmentedControl.displayName = 'SegmentedControl';

const SegmentedControlOption = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-normal ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
SegmentedControlOption.displayName = 'SegmentedControlOption';

export { SegmentedControl as SecgmentedControl, SegmentedControlOption };
