import { useMemo, type ComponentType } from 'react';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Separator } from './ui/separator';

type FacetPickerProps = {
  selectedvalues: Array<string> | undefined;
  setValues: (values: Array<string> | undefined) => void; // eslint-disable-line no-unused-vars
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: ComponentType<{ className?: string }>;
  }[];
};

export function FacetPicker({
  title,
  options,
  selectedvalues: _selectedvalues,
  setValues,
}: FacetPickerProps) {
  const selectedvalues = useMemo(
    () => new Set(_selectedvalues),
    [_selectedvalues]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed text-muted-foreground font-normal text-xs"
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedvalues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="lg:hidden">
                {selectedvalues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedvalues.size > 2 ? (
                  <Badge variant="secondary">
                    {selectedvalues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedvalues.has(option.value))
                    .map((option) => (
                      <Badge variant="secondary" key={option.value}>
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedvalues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedvalues.delete(option.value);
                      } else {
                        selectedvalues.add(option.value);
                      }
                      const filterValues = Array.from(selectedvalues);
                      setValues(filterValues.length ? filterValues : undefined);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4')} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedvalues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setValues(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
