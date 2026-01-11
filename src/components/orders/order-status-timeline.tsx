"use client";

import {
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Truck,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatusTimelineProps {
  currentStatus:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
}

const statusSteps = [
  {
    status: "confirmed",
    label: "Order Received",
    icon: CheckCircle2,
    description: "We've received your order",
  },
  {
    status: "preparing",
    label: "Preparing",
    icon: Clock,
    description: "Our chefs are cooking your meal",
  },
  {
    status: "ready",
    label: "Ready for Delivery",
    icon: Package,
    description: "Your order is ready",
  },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    icon: Truck,
    description: "On the way to you",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: Home,
    description: "Enjoy your meal!",
  },
];

export function OrderStatusTimeline({
  currentStatus,
}: OrderStatusTimelineProps) {
  if (currentStatus === "cancelled") {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-400 font-semibold">
          Order Cancelled
        </p>
        <p className="text-sm text-red-600 dark:text-red-500 mt-1">
          This order has been cancelled
        </p>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === currentStatus,
  );

  return (
    <div className="space-y-8">
      {statusSteps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const Icon = step.icon;

        return (
          <div key={step.status} className="relative flex gap-4">
            {/* Connector Line */}
            {index < statusSteps.length - 1 && (
              <div
                className={cn(
                  "absolute left-6 top-12 w-0.5 h-12",
                  isCompleted ? "bg-primary" : "bg-muted",
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-muted text-muted-foreground",
                isCurrent && "ring-4 ring-primary/20 scale-110",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h3
                className={cn(
                  "font-semibold",
                  isCompleted ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </h3>
              <p
                className={cn(
                  "text-sm mt-0.5",
                  isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70",
                )}
              >
                {step.description}
              </p>
              {isCurrent && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  In Progress
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
