import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { auth } from "@/lib/auth";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await (async () => {
      const { headers } = await import("next/headers");
      return headers();
    })(),
  });

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Complete your order below
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm userEmail={user?.email} userName={user?.name} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
