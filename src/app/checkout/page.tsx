import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Checkout</h1>
        <Card>
          <CardHeader>
            <CardTitle>Checkout Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The checkout functionality will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
