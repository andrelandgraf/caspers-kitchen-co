import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  ChefHat,
  Clock,
  Leaf,
  Heart,
  Package,
  Users,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Casper's Kitchen - Comfort Food Delivered with Warmth",
  description:
    "Experience the warmth of home-cooked meals delivered fresh to your door. Order from our ghost kitchen featuring comfort classics made with love.",
  openGraph: {
    title: "Casper's Kitchen - Comfort Food Delivered",
    description:
      "Fresh comfort food from our ghost kitchen, delivered with warmth to your door.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Comfort food,{" "}
                <span className="text-primary">delivered with warmth</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Experience home-cooked flavors from our professional ghost
                kitchen. Fresh ingredients, classic recipes, and the warmth of a
                home meal—delivered right to your door.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-base">
                  <Link href="/menu">
                    Order Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base"
                >
                  <Link href="/menu">See Our Menu</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-10" />
              <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
                🍲
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From your order to your door in four simple steps
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  icon: ChefHat,
                  title: "Browse Our Menu",
                  description: "Explore comfort classics and daily specials",
                },
                {
                  step: "2",
                  icon: Clock,
                  title: "Order Online",
                  description:
                    "Place your order in minutes through our website",
                },
                {
                  step: "3",
                  icon: Heart,
                  title: "Fresh Preparation",
                  description: "Our chefs prepare your meal with care",
                },
                {
                  step: "4",
                  icon: Package,
                  title: "Hot Delivery",
                  description: "Delivered fresh to your door in 45-60 minutes",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="relative border-2 hover:border-primary/50 transition-all"
                >
                  <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {item.step}
                  </div>
                  <CardContent className="pt-8 pb-6">
                    <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Made with Love
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our commitment to quality, sustainability, and community
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Leaf,
                  title: "Fresh Ingredients",
                  description:
                    "Never frozen, always fresh from local suppliers",
                },
                {
                  icon: Heart,
                  title: "Home-Inspired Recipes",
                  description: "Classic comfort food made like grandma used to",
                },
                {
                  icon: Package,
                  title: "Sustainable Packaging",
                  description: "Eco-friendly materials for a better tomorrow",
                },
                {
                  icon: Users,
                  title: "Local Community",
                  description: "Supporting neighborhood suppliers and farmers",
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Menu */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Today's Favorites
              </h2>
              <p className="text-lg text-muted-foreground">
                Customer favorites made fresh daily
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Classic Mac & Cheese",
                  description: "Creamy, cheesy comfort in a bowl",
                  price: "12.99",
                  emoji: "🧀",
                },
                {
                  name: "Grilled Chicken Bowl",
                  description: "Fresh veggies, tender chicken, signature sauce",
                  price: "14.99",
                  emoji: "🍗",
                },
                {
                  name: "Homestyle Meatloaf",
                  description: "Just like mom used to make",
                  price: "13.99",
                  emoji: "🍖",
                },
              ].map((dish, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-7xl">
                    {dish.emoji}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-1">{dish.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${dish.price}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group-hover:bg-primary/10"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button size="lg" asChild>
                <Link href="/menu">View Full Menu</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Our Neighbors Say
              </h2>
              <p className="text-lg text-muted-foreground">
                Real reviews from real customers
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  quote:
                    "Best comfort food I've had in years! Tastes just like home cooking. The mac and cheese is to die for!",
                  author: "Sarah M.",
                  rating: 5,
                },
                {
                  quote:
                    "Fast delivery, hot food, and amazing quality. My family's new go-to for busy weeknights.",
                  author: "Mike T.",
                  rating: 5,
                },
                {
                  quote:
                    "Love supporting a local ghost kitchen that cares about sustainability and fresh ingredients!",
                  author: "Emma L.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
                    <p className="text-sm font-medium">
                      — {testimonial.author}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Area */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Delivering Fresh Food Daily
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We currently serve the greater San Francisco area with plans to
              expand soon. Typical delivery time is 45-60 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Input placeholder="Enter your address" className="max-w-sm" />
              <Button>Check Availability</Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Free delivery over $30</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>45-60 min delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-8 pb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Join the Kitchen Family
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get 10% off your first order plus weekly menu updates and
                  exclusive deals
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1"
                  />
                  <Button type="submit">Subscribe</Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
