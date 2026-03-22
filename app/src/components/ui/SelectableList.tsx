'use client';

type Item = {
  id: string;
  label: string;
  meta?: string;
};

type Group = {
  title: string;
  items: Item[];
};

type Props = {
  groups: Group[];
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
};

export const SelectableList = (props: Props) => (
  <div className={props.className}>
    {props.groups.map(group => (
      <div key={group.title} className="mb-5">
        <p className="mb-2 text-xs text-subtle">{group.title}</p>
        <div className="overflow-hidden rounded-lg border border-white/8">
          {group.items.map((item, i) => {
            const isSelected = props.value === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => props.onChange?.(item.id)}
                className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs transition-colors ${
                  i < group.items.length - 1 ? 'border-b border-white/6' : ''
                } ${
                  isSelected
                    ? 'bg-brand/15 text-foreground'
                    : 'hover:bg-white/4'
                }`}
              >
                <span className={`font-medium ${isSelected ? 'text-brand-light' : 'text-foreground'}`}>
                  {item.label}
                </span>
                {item.meta && (
                  <span className={isSelected ? 'text-brand-light/70' : 'text-muted'}>
                    {item.meta}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);
