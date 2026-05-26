"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
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
        "solid-surface p-md flex flex-col gap-sm group relative cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
      {...attributes}
      {...listeners}
    >
      <span
        aria-hidden
        className="absolute right-sm top-sm text-text-4 opacity-0 group-hover:opacity-100 transition-opacity duration-fast pointer-events-none"
      >
        <GripVertical size={14} strokeWidth={1.8} />
      </span>
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
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

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
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-sm min-h-[200px] p-xs -mx-xs border border-dashed border-transparent transition-colors duration-fast",
            isOver && "border-[var(--accent-strong)] bg-surface-1",
          )}
        >
          {items.length === 0 ? (
            <div className="border border-dashed border-border-thin p-md text-body-sm text-text-4 text-center">
              {isOver ? "Solte aqui" : "Vazio"}
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

// Estratégia híbrida: pointerWithin pega coluna (drops em área vazia)
// e cai para rectIntersection nos itens. Sem isso, drop em coluna vazia falha.
function makeCollision<S extends string, T extends KanbanItem<S>>(
  items: T[],
  columns: KanbanColumn<S>[],
): CollisionDetection {
  return (args) => {
    const pointer = pointerWithin(args);
    if (pointer.length > 0) {
      const colMatch = pointer.find((p) =>
        columns.some((c) => c.id === p.id),
      );
      if (colMatch) return [colMatch];
      return pointer;
    }
    const rect = rectIntersection(args);
    if (rect.length > 0) return rect;
    const activeId = String(args.active.id);
    const activeItem = items.find((i) => i.id === activeId);
    if (activeItem) {
      const col = columns.find((c) => c.id === activeItem.status);
      if (col) return [{ id: col.id }];
    }
    return [];
  };
}

export function KanbanBoard<S extends string, T extends KanbanItem<S>>({
  columns,
  items,
  onItemMove,
  renderCard,
}: KanbanBoardProps<S, T>) {
  const [localItems, setLocalItems] = useState(items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

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
  const collision = useMemo(
    () => makeCollision(localItems, columns),
    [localItems, columns],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active: dragged, over } = event;
    if (!over) return;

    const itemId = String(dragged.id);
    const overId = String(over.id);

    let targetStatus: S | null = null;
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn) {
      targetStatus = overColumn.id;
    } else {
      const overItem = localItems.find((i) => i.id === overId);
      if (overItem) targetStatus = overItem.status;
    }
    if (!targetStatus) return;

    const movedItem = localItems.find((i) => i.id === itemId);
    if (!movedItem) return;
    if (movedItem.status === targetStatus) return;

    const before = localItems;
    setLocalItems((current) =>
      current.map((i) =>
        i.id === itemId ? { ...i, status: targetStatus! } : i,
      ),
    );

    Promise.resolve(onItemMove(itemId, targetStatus)).catch(() => {
      setLocalItems(before);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
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
            className="solid-surface p-md shadow-elevated cursor-grabbing"
          >
            {renderCard(active)}
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
