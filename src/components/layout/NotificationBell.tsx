"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { notificacoes, marcarLida, marcarTodasLidas } =
    useRealtimeNotifications(user?.id);

  const unread = notificacoes.length;
  const hasUnread = unread > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label={`${unread} notificações não lidas`}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-md top-md z-topbar h-11 w-11 flex items-center justify-center rounded-[12px] border text-text-2 backdrop-blur-md transition-colors duration-fast hover:text-text-1",
          hasUnread
            ? "border-[var(--accent-strong)] text-accent bg-[rgba(20,20,20,0.7)]"
            : "border-border-thin bg-[rgba(20,20,20,0.7)]",
        )}
      >
        {hasUnread ? <BellRing size={18} strokeWidth={1.8} /> : <Bell size={18} strokeWidth={1.8} />}
        {hasUnread ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-xs flex items-center justify-center bg-accent text-black text-caption font-bold rounded-full tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Notificações</SheetTitle>
          <SheetDescription>
            {unread === 0
              ? "Sem novidades."
              : `${unread} ${unread === 1 ? "nova" : "novas"}.`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {notificacoes.length === 0 ? (
            <div className="p-lg text-body-sm text-text-3 text-center">
              Você está em dia.
            </div>
          ) : (
            <ul className="divide-y divide-border-thin">
              {notificacoes.map((notif) => {
                const content = (
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between gap-sm">
                      <span className="text-label-caps text-text-3">
                        {notif.tipo}
                      </span>
                      <span className="text-caption text-text-4">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>
                    <span className="text-body-md text-text-1">{notif.titulo}</span>
                    {notif.mensagem ? (
                      <span className="text-body-sm text-text-3">{notif.mensagem}</span>
                    ) : null}
                  </div>
                );
                return (
                  <li
                    key={notif.id}
                    className="px-lg py-md hover:bg-surface-2 cursor-pointer transition-colors duration-fast"
                    onClick={() => marcarLida(notif.id)}
                  >
                    {notif.link ? (
                      <Link
                        href={notif.link}
                        onClick={() => setOpen(false)}
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <SheetFooter>
          <Button
            variant="ghost"
            disabled={!hasUnread}
            onClick={marcarTodasLidas}
          >
            Marcar todas como lidas
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
