import type { Cim } from '@/types/cim';
import { CheckCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export type PopupContentProps = Pick<
  Cim,
  'id' | 'name' | 'altitude' | 'climbed'
> & {
  onClickClimb: (id: string, climbed: boolean) => void; // eslint-disable-line no-unused-vars
};

export function PopupContent({
  id,
  name,
  altitude,
  climbed,
  onClickClimb,
}: PopupContentProps) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center">
        <div>
          <h4 className="font-medium leading-none text-base">{name}</h4>
          <p className="text-sm text-muted-foreground">{altitude} m</p>
        </div>
        <div
          className={cn(
            'ml-auto',
            climbed ? 'text-green-500' : 'text-gray-400'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => onClickClimb(id, !!climbed)}
          >
            <CheckCircle />
          </Button>
        </div>
      </div>
    </div>
  );
}
