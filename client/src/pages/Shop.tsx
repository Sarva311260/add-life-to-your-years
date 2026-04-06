import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import {
  ShoppingBag, ExternalLink, Loader2, Leaf, Package,
} from "lucide-react";

export default function Shop() {
  const [, navigate] = useLocation();
  const { data: products, isLoading } = trpc.shop.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="container relative text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            Wellness Store
          </Badge>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Recommended Products
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Carefully selected products that support the recommendations in "Add Life to Your Years."
            Each product is chosen for quality, efficacy, and alignment with a holistic wellness approach.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="pb-20">
        <div className="container max-w-5xl">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                Coming Soon
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We're carefully curating a selection of wellness products that align with the
                recommendations in the book. Check back soon!
              </p>
              <Button variant="outline" onClick={() => navigate("/book")} className="gap-2">
                <Leaf className="w-4 h-4" />
                Read the Book
              </Button>
            </div>
          )}

          {products && products.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                >
                  {product.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    {product.category && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.category}
                      </Badge>
                    )}
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-semibold text-foreground">
                        ${(product.priceInCents / 100).toFixed(2)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {product.currency}
                        </span>
                      </span>
                      {product.purchaseUrl ? (
                        <a
                          href={product.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="gap-2">
                            Buy Now
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info section */}
      <section className="pb-16">
        <div className="container max-w-3xl">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6 text-center">
              <Leaf className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                Why These Products?
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Every product in this store is personally selected based on the research and
                recommendations in "Add Life to Your Years." We prioritise quality, transparency,
                and alignment with a plant-based, holistic approach to wellness.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
