'use client';

import { categories } from '@/data/digital';
import { getAllServices } from '@/data/digital/services';
import { cn } from '@/lib/utils';

interface CategoriesProps {
  activeCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function Categories({ activeCategory, onSelectCategory, orientation = 'horizontal' }: CategoriesProps) {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case 'cpu':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .252c-.008.379.137.751.43.992l1.003.828c.435.36.55.976.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.076.124 7.632 7.632 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.281a1.125 1.125 0 00-.645-.87c-.074-.04-.147-.083-.22-.127a1.124 1.124 0 00-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.828c.293-.241.438-.613.43-.992a7.723 7.723 0 010-.252c.008-.379-.137-.751-.43-.992l-1.003-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'briefcase':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22" />
          </svg>
        );
      case 'graduation-cap':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41" />
          </svg>
        );
      case 'sprout':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21" />
          </svg>
        );
      case 'laptop':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25" />
          </svg>
        );
      case 'palette':
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-2.22 4.418M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625" />
          </svg>
        );
    }
  };

  const allServices = getAllServices();
  const allCount = allServices.length;
  const getCategoryCount = (catId: string) =>
    allServices.filter((s) => s.categoryId === catId).length;

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn(
      "z-30 select-none",
      isVertical ? "w-full" : "w-full border-b border-outline-variant/30 bg-surface py-3"
    )}>
      <div className={cn(
        isVertical ? "" : "max-w-[1280px] mx-auto px-5 md:px-16"
      )}>
        <div className={cn(
          "flex gap-2.5",
          isVertical 
            ? "flex-col" 
            : "items-center overflow-x-auto whitespace-nowrap scrollbar-none snap-x pb-1 md:pb-0"
        )}>
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              "inline-flex items-center text-label-sm font-extrabold uppercase tracking-wider rounded-full border cursor-pointer transition-all duration-200 shadow-sm",
              isVertical ? "px-5 py-3 w-full justify-between" : "px-4.5 py-2 snap-start active:scale-95",
              activeCategory === null
                ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary hover:border-primary/40"
            )}
          >
            <span>All Categories</span>
            <span
              className={cn(
                "ml-2 text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-colors duration-200",
                activeCategory === null
                  ? "bg-white text-primary"
                  : "bg-on-surface-variant/10 text-on-surface-variant"
              )}
            >
              {allCount}
            </span>
          </button>

          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const count = getCategoryCount(category.id);
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "inline-flex items-center text-label-sm font-extrabold uppercase tracking-wider rounded-full border cursor-pointer transition-all duration-200 shadow-sm",
                  isVertical ? "px-5 py-3 w-full justify-between" : "px-4.5 py-2 snap-start active:scale-95",
                  isActive
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                    : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary hover:border-primary/40"
                )}
              >
                <div className="flex items-center">
                  {getCategoryIcon(category.icon)}
                  <span>{category.name}</span>
                </div>
                <span
                  className={cn(
                    "ml-2 text-[10px] px-2 py-0.5 rounded-full font-extrabold transition-colors duration-200",
                    isActive
                      ? "bg-white text-primary"
                      : "bg-on-surface-variant/10 text-on-surface-variant"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
