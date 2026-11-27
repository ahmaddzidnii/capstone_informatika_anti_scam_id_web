"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const ResponsiveDialogContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: true,
});

function useResponsiveDialog() {
  return React.useContext(ResponsiveDialogContext);
}

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResponsiveDialog({
  children,
  open,
  onOpenChange,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 818px)");

  return (
    <ResponsiveDialogContext.Provider value={{ isDesktop }}>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

export function ResponsiveDialogTrigger({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof DialogTrigger>, "handle">) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return (
      <DialogTrigger className={className} render={render} {...props}>
        {children}
      </DialogTrigger>
    );
  }

  return (
    <DrawerTrigger className={className} render={render} {...props}>
      {children}
    </DrawerTrigger>
  );
}

export function ResponsiveDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return (
      <DialogContent
        className={cn("w-[calc(100%-2rem)] sm:max-w-[818px]!", className)}
        {...props}
      >
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={cn("max-w-none! px-4 pb-6", className)}>
      <div className="mx-auto w-full max-w-lg">{children}</div>
    </DrawerContent>
  );
}

export function ResponsiveDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogHeader className={className} {...props} />;
  }

  return (
    <DrawerHeader className={cn("px-0 text-left!", className)} {...props} />
  );
}

export function ResponsiveDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogTitle className={className} {...props} />;
  }

  return <DrawerTitle className={className} {...props} />;
}

export function ResponsiveDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogDescription className={className} {...props} />;
  }

  return <DrawerDescription className={className} {...props} />;
}

export function ResponsiveDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogFooter className={className} {...props} />;
  }

  return <DrawerFooter className={cn("px-0 pt-2", className)} {...props} />;
}

export function ResponsiveDialogClose({
  className,
  ...props
}: Omit<React.ComponentProps<typeof DialogClose>, "handle">) {
  const { isDesktop } = useResponsiveDialog();

  if (isDesktop) {
    return <DialogClose className={className} {...props} />;
  }

  return <DrawerClose className={className} {...props} />;
}
