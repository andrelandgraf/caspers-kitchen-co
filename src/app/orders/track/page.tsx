"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Package } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderNumber: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderNumber || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.orderId) {
        router.push(`/orders/${data.orderId}`);
      } else {
        toast.error(
          data.error || "Order not found. Please check your details.",
        );
      }
    } catch (error) {
      console.error("Error looking up order:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4 mx-auto">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Track Your Order</CardTitle>
              <CardDescription>
                Enter your order number and email to view your order status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    placeholder="CK-20240110-1234"
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderNumber: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Found in your order confirmation email
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Track Order"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>
                  Have an account?{" "}
                  <a href="/sign-in" className="text-primary hover:underline">
                    Sign in
                  </a>{" "}
                  to view all your orders
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
