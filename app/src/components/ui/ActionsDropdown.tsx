'use client';

/**
 * HeroUI `Dropdown` — trigger `icon` is passed by the caller (no default glyph).
 * Use `href` on items for links; `onMenuAction` for in-app handlers.
 */
import type { ReactNode } from 'react';
import { Dropdown } from '@heroui/react/dropdown';
import { buttonVariants } from '@heroui/styles';
import { cx } from 'tailwind-variants';

export type ActionsDropdownLinkItem = {
  id: string;
  /** Typeahead / accessibility */
  textValue: string;
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
};

export type ActionsDropdownActionItem = {
  id: string;
  textValue: string;
  children: ReactNode;
};

export type ActionsDropdownItem = ActionsDropdownLinkItem | ActionsDropdownActionItem;

function isLinkItem(item: ActionsDropdownItem): item is ActionsDropdownLinkItem {
  return 'href' in item && typeof item.href === 'string';
}

export type ActionsDropdownProps = {
  /** `aria-label` on the trigger (required for icon-only). */
  ariaLabel: string;
  /** Trigger content from the caller, e.g. `<MoreVertical size={17} />`. */
  icon: ReactNode;
  items: ActionsDropdownItem[];
  /** Invoked for items without `href`. */
  onMenuAction?: (id: string) => void;
  /** Keep parent UI (e.g. hover overlay) in sync while open. */
  onOpenChange?: (isOpen: boolean) => void;
  /** HeroUI button variant on the icon trigger (default `ghost`). */
  triggerVariant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' | 'danger' | 'danger-soft';
  /** Use HeroUI icon-only button sizing/styles on `Dropdown.Trigger` (default `true`). */
  triggerIsIconOnly?: boolean;
  triggerClassName?: string;
  popoverClassName?: string;
  menuClassName?: string;
  placement?: 'bottom' | 'bottom start' | 'bottom end' | 'top' | 'top start' | 'top end';
};

export function ActionsDropdown(props: ActionsDropdownProps) {
  const {
    ariaLabel,
    icon,
    items,
    onMenuAction,
    onOpenChange,
    triggerVariant = 'ghost',
    triggerIsIconOnly = true,
    triggerClassName,
    popoverClassName,
    menuClassName,
    placement = 'bottom end',
  } = props;

  const triggerClasses = cx(
    triggerIsIconOnly
      ? buttonVariants({
          isIconOnly: true,
          size: 'sm',
          variant: triggerVariant,
        })
      : '',
    triggerClassName
    ?? 'shrink-0 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 data-[pressed]:bg-white/30',
  );

  return (
    <Dropdown onOpenChange={onOpenChange}>
      <Dropdown.Trigger aria-label={ariaLabel} className={triggerClasses}>
        {icon}
      </Dropdown.Trigger>
      <Dropdown.Popover
        placement={placement}
        className={popoverClassName ?? 'min-w-[10rem]'}
      >
        <Dropdown.Menu
          className={menuClassName}
          onAction={(key) => {
            onMenuAction?.(String(key));
          }}
        >
          {items.map((item) => {
            if (isLinkItem(item)) {
              return (
                <Dropdown.Item
                  key={item.id}
                  id={item.id}
                  href={item.href}
                  target={item.target ?? '_blank'}
                  rel={item.rel ?? 'noopener noreferrer'}
                  textValue={item.textValue}
                >
                  {item.children}
                </Dropdown.Item>
              );
            }
            return (
              <Dropdown.Item key={item.id} id={item.id} textValue={item.textValue}>
                {item.children}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
