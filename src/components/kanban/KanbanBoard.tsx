"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KanbanColumn<S extends string> {
  id: S;
  titulo: string;
}

export interface KanbanItem<S extends string> {
  id: string;
  status: S;
}

interface KanbanBoardProps<S extends string, T extends KanbanItem<S>> {
  columns: KanbanColumn<S>[];
  items: T[];
  onItemMove: (id: string, status: S) => void | Promise<void>;
  renderCard: (item: T) => React.ReactNode;
}

function SortableCard<S extends string, T extends KanbanItem<S>>({
  item,
  renderCard,
}: {
  item: T;
  renderCard: (item: T) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "solid-surface p-md flex flex-col gap-sm group relative",
        isDragging && "opacity-50",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Arrastar"
        className="absolute right-sm top-sm text-text-4 opacity-0 group-hover:opacity-100 transition-opacity duration-fast focus-visible:opacity-100"
      >
        <GripVertical size={14} strokeWidth={1.8} />
      </button>
      {renderCard(item)}
    </div>
  );
}

function ColumnContainer<S extends string, T extends KanbanItem<S>>({
  column,
  items,
  renderCard,
}: {
  column: KanbanColumn<S>;
  items: T[];
  renderCard: (item: T) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-md min-w-[280px] w-[280px] shrink-0">
      <div className="sticky top-0 z-10 bg-background pb-xs">
        <div className="flex items-center justify-between gap-sm">
          <span className="text-label-caps text-text-1">{column.titulo}</span>
          <span className="text-body-sm text-text-3 tabular-nums">
            {items.length}
          </span>
        </div>
        <div className="mt-xs h-px bg-border-thin" />
      </div>
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-sm min-h-[120px]">
          {items.length === 0 ? (
            <div className="border border-dashed border-border-thin p-md text-body-sm text-text-4 text-center">
              Vazio
            </div>
          ) : (
            items.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                renderCard={renderCard}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard<S extends string, T extends KanbanItem<S>>({
  columns,
  items,
  onItemMove,
  renderCard,
}: KanbanBoardProps<S, T>) {
  const [localItems, setLocalItems] = useState(items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<S, T[]>();
    for (const col of columns) map.set(col.id, []);
    for (const item of localItems) {
      const arr = map.get(item.status);
      if (arr) arr.push(item);
    }
    return map;
  }, [columns, localItems]);

  const active = localItems.find((i) => i.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active: dragged, over } = event;
    if (!over) return;

    const itemId = String(dragged.id);
    const overId = String(over.id);

    // Quando over é um card, pegamos o status do card; quando é uma coluna, usamos o id da coluna.
    const overColumn = columns.find((c) => c.id === overId);
    let targetStatus: S | null = overColumn?.id ?? null;
    if (!targetStatus) {
      const overItem = localItems.find((i) => i.id === overId);
      targetStatus = overItem?.status ?? null;
    }
    if (!targetStatus) return;

    const movedItem = localItems.find((i) => i.id === itemId);
    if (!movedItem) return;
    if (movedItem.status === targetStatus) return;

    const before = localItems;
    setLocalItems((current) =>
      current.map((i) => (i.id === itemId ? { ...i, status: targetStatus! } : i)),
    );

    Promise.resolve(onItemMove(itemId, targetStatus)).catch(() => {
      setLocalItems(before);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-lg overflow-x-auto scrollbar-thin pb-md -mx-md px-md">
        {columns.map((column) => (
          <ColumnContainer
            key={column.id}
            column={column}
            items={grouped.get(column.id) ?? []}
            renderCard={renderCard}
          />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <motion.div
            initial={{ scale: 1.02 }}
            animate={{ scale: 1.04 }}
            className="solid-surface p-md shadow-elevated"
          >
            {renderCard(active)}
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
