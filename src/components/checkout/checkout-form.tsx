"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/context";
import { useLocation } from "@/lib/locations/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { MapPin, AlertCircle } from "lucide-react";

interface CheckoutFormProps {
  userEmail?: string;
  userName?: string;
}

export function CheckoutForm({ userEmail, userName }: CheckoutFormProps) {
  const router = useRouter();
  const { items, refreshCart } = useCart();
  const { currentLocation, openLocationModal } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: userEmail || "",
    name: userName || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    instructions: "",
    deliveryTime: "asap",
    promoCode: "",
  });

  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch cart ID from API
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = await response.json();
          setCartId(data.cart.id);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.address) newErrors.address = "Street address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.zip) newErrors.zip = "ZIP code is required";

    // Validate ZIP code format
    if (formData.zip && !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = "Invalid ZIP code format";
    }

    // Validate email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.unitPrice) * item.quantity;
  }, 0);

  const handleApplyPromo = async () => {
    if (!formData.promoCode) {
      toast.error("Please enter a promo code");
      return;
    }

    try {
      const response = await fetch("/api/orders/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.promoCode,
          subtotal,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setPromoApplied(true);
        setPromoDiscount(data.discountAmount);
        toast.success("Promo code applied successfully!");
      } else {
        toast.error(data.message || "Invalid promo code");
      }
    } catch (error) {
      toast.error("Failed to validate promo code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!items.length || !cartId) {
      toast.error("Your cart is empty");
      return;
    }

    if (!currentLocation) {
      toast.error("Please select a location");
      openLocationModal();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          locationId: currentLocation.id,
          guestEmail: !userEmail ? formData.email : undefined,
          guestName: !userName ? formData.name : undefined,
          guestPhone: formData.phone,
          deliveryAddress: formData.address,
          deliveryCity: formData.city,
          deliveryState: formData.state,
          deliveryZip: formData.zip,
          deliveryInstructions: formData.instructions,
          scheduledFor:
            formData.deliveryTime === "asap" ? undefined : undefined, // Future: handle scheduled times
          paymentMethod: "card",
          promoCode: promoApplied ? formData.promoCode : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await refreshCart(); // Clear cart
        toast.success("Order placed successfully!");
        router.push(`/orders/${data.orderId}/confirmation`);
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryFee = 5.99;
  const discountAmount = promoApplied ? promoDiscount : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxRate = 0.0875;
  const taxAmount = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + deliveryFee + taxAmount;

  // No location selected
  if (!currentLocation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Location</h3>
          <p className="text-muted-foreground mb-4">
            Please select a location before proceeding to checkout.
          </p>
          <Button onClick={openLocationModal}>Choose Location</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ordering From
          </CardTitle>
          <CardDescription>
            Your order will be prepared at this location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{currentLocation.name}</p>
              <p className="text-sm text-muted-foreground">
                {currentLocation.city}, {currentLocation.state}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openLocationModal}
            >
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            We'll use this to contact you about your order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!!userEmail}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!!userName}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(555) 123-4567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
          <CardDescription>Where should we deliver your order?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="CA"
                maxLength={2}
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">{errors.state}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) =>
                setFormData({ ...formData, zip: e.target.value })
              }
              placeholder="12345"
              className={errors.zip ? "border-red-500" : ""}
            />
            {errors.zip && (
              <p className="text-sm text-red-500 mt-1">{errors.zip}</p>
            )}
          </div>

          <div>
            <Label htmlFor="instructions">
              Delivery Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="e.g., Ring doorbell, leave at door"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Time */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Time</CardTitle>
          <CardDescription>When would you like your order?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.deliveryTime}
            onValueChange={(value) =>
              setFormData({ ...formData, deliveryTime: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="asap" id="asap" />
              <Label htmlFor="asap">ASAP (45-60 minutes)</Label>
            </div>
            <div className="flex items-center space-x-2 opacity-50">
              <RadioGroupItem value="scheduled" id="scheduled" disabled />
              <Label htmlFor="scheduled">
                Schedule for later (Coming soon)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Promo Code */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Code</CardTitle>
          <CardDescription>Have a discount code? Apply it here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={formData.promoCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  promoCode: e.target.value.toUpperCase(),
                })
              }
              placeholder="Enter code"
              disabled={promoApplied}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyPromo}
              disabled={promoApplied || !formData.promoCode}
            >
              {promoApplied ? "Applied" : "Apply"}
            </Button>
          </div>
          {promoApplied && (
            <p className="text-sm text-green-600 mt-2">
              Promo code applied! You saved ${discountAmount.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {promoApplied && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (8.75%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Payment will be collected at delivery. We accept cash, credit cards,
            and digital payments.
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
}
