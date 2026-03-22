'use client';

import { useState } from 'react';

type Tab = { id: string; label: string };

type Props = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  children: (activeTab: string) => React.ReactNode;
};

export const Tabs = (props: Props) => {
  const [activeTab, setActiveTab] = useState(
    props.defaultTab ?? props.tabs[0]?.id ?? '',
  );

  return (
    <div className={`flex flex-col ${props.className ?? ''}`}>
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-white/8">
        {props.tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-brand text-foreground'
                : 'text-subtle hover:text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content — min-h-0 so nested flex children can shrink and scroll */}
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden [&>*]:h-full [&>*]:min-h-0 [&>*]:w-full">
        {props.children(activeTab)}
      </div>
    </div>
  );
};
