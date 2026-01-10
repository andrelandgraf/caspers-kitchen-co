import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSelector } from "@/components/themes/selector";
import { UserMenu } from "@/components/auth/user-menu";
import { ChefHat, Sparkles, Clock, MapPin, Star } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">
                Caspers Kitchen
              </h1>
              <p className="text-xs text-muted-foreground">Ghost Kitchen Co.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Powered by Databricks
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Welcome to{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
              Caspers Kitchen
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your AI-powered ghost kitchen experience. Fresh food, smart
            ordering, and personalized recommendations at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-8">
              View Menu
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8">
              Track Order
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          <div className="text-center p-4">
            <p className="text-3xl font-bold text-primary">30+</p>
            <p className="text-sm text-muted-foreground">Menu Items</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold text-primary">25min</p>
            <p className="text-sm text-muted-foreground">Avg Delivery</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold text-primary">4.9</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl font-bold text-primary">24/7</p>
            <p className="text-sm text-muted-foreground">AI Support</p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="border-border/50 hover:border-primary/30 transition-colors group">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                Browse Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explore our diverse menu with options for every taste and
                dietary preference. Ask our AI assistant for recommendations!
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary/30 transition-colors group">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                Quick Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Place orders instantly through our AI assistant with smart
                recommendations and real-time order tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary/30 transition-colors group">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                Fast Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get your food delivered fresh and fast. Track your order in
                real-time and know exactly when it will arrive.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Ready to order?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Click the chat button in the corner to talk with Casper, our AI
            kitchen assistant. Get menu recommendations, check dietary info, or
            place your order!
          </p>
          <p className="text-sm text-muted-foreground">
            Open 7 days a week, 10am - 11pm
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Caspers Kitchen Co. - A Databricks Demo Application</p>
          <p className="mt-1 text-xs opacity-70">
            Built with Next.js, Neon, and AI SDK
          </p>
        </div>
      </footer>
    </div>
  );
}
