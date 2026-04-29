import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import {
  ShoppingBag, ExternalLink, Loader2, Leaf, Package, Droplets, Sparkles, ShoppingCart, CheckCircle,
} from "lucide-react";

// Default ASEA cart links (used when no affiliate has set their own)
const DEFAULT_ASEA_LINKS = {
  redoxRetail: "https://shop.aseaglobal.com/info?cartSharingId=753IGA500A6853C&st=sc&sn=cl",
  redoxSubscription: "https://shop.aseaglobal.com/info?cartSharingId=B0AC0A5SSA685CC&st=sc&sn=cl",
  renu28Retail: "https://shop.aseaglobal.com/info?cartSharingId=GE3IHAES0AFH5CC&st=sc&sn=cl",
  renu28Subscription: "https://shop.aseaglobal.com/info?cartSharingId=G539I1E00A6HECC&st=sc&sn=cl",
};

function getAffiliateCookieSlug(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)affiliate_slug=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function AseaProductSection() {
  const [affiliateSlug, setAffiliateSlug] = useState<string | null>(null);

  useEffect(() => {
    setAffiliateSlug(getAffiliateCookieSlug());
  }, []);

  const { data: affiliateBySlug } = trpc.pemfAffiliate.getBySlug.useQuery(
    { slug: affiliateSlug! },
    { enabled: !!affiliateSlug }
  );
  const { data: defaultAffiliate } = trpc.pemfAffiliate.getDefaultAffiliate.useQuery(
    undefined,
    { enabled: !affiliateSlug }
  );

  const aff = (affiliateSlug ? affiliateBySlug : defaultAffiliate) as any;

  const links = {
    redoxRetail: aff?.aseaRedoxRetailUrl || DEFAULT_ASEA_LINKS.redoxRetail,
    redoxSubscription: aff?.aseaRedoxSubscriptionUrl || DEFAULT_ASEA_LINKS.redoxSubscription,
    renu28Retail: aff?.aseaRenu28RetailUrl || DEFAULT_ASEA_LINKS.renu28Retail,
    renu28Subscription: aff?.aseaRenu28SubscriptionUrl || DEFAULT_ASEA_LINKS.renu28Subscription,
  };

  return (
    <section className="pb-16">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3 gap-1.5 px-3 py-1">
            <Droplets className="w-3.5 h-3.5" />
            ASEA Redox Signalling
          </Badge>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
            ASEA REDOX &amp; RENU 28
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            The world's only Redox Signalling supplements — available as a one-time retail purchase or a
            flexible subscription you can change, defer, or cancel at any time.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Flexible subscription — change, defer or cancel anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>100% money-back guarantee on empty bottles or tubes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Secure checkout through ASEA Global</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* ASEA REDOX Retail */}
          <Card className="flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="w-4.5 h-4.5 text-blue-500" />
                </div>
                <div>
                  <Badge variant="secondary" className="text-xs mb-0.5">Retail</Badge>
                  <h3 className="font-semibold text-foreground text-sm">ASEA REDOX Supplement</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5 flex-1">
                Purchase at the standard retail price with no commitment. Perfect for trying ASEA REDOX for the first time.
              </p>
              <a href={links.redoxRetail} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2">
                  <ShoppingCart className="w-4 h-4" /> Buy Retail <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* ASEA REDOX Subscription */}
          <Card className="flex flex-col border-primary/30 bg-primary/3">
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Droplets className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <Badge className="text-xs mb-0.5 bg-primary/10 text-primary border-primary/20">⭐ Best Value — Subscription</Badge>
                  <h3 className="font-semibold text-foreground text-sm">ASEA REDOX Supplement</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2 flex-1">
                Save with a flexible subscription. Change quantity, defer a shipment, or cancel at any time — no lock-in.
              </p>
              <p className="text-xs text-primary mb-5">Flexible · Secure · Cancel anytime</p>
              <a href={links.redoxSubscription} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2">
                  <ShoppingCart className="w-4 h-4" /> Subscribe &amp; Save <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* RENU 28 Retail */}
          <Card className="flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-purple-500" />
                </div>
                <div>
                  <Badge variant="secondary" className="text-xs mb-0.5">Retail</Badge>
                  <h3 className="font-semibold text-foreground text-sm">RENU 28 Revitalising Gel</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-5 flex-1">
                Purchase at the standard retail price. Try the world's first Redox Signalling topical gel with no commitment.
              </p>
              <a href={links.renu28Retail} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2">
                  <ShoppingCart className="w-4 h-4" /> Buy Retail <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* RENU 28 Subscription */}
          <Card className="flex flex-col border-purple-500/30 bg-purple-500/3">
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-purple-500" />
                </div>
                <div>
                  <Badge className="text-xs mb-0.5 bg-purple-500/10 text-purple-600 border-purple-500/20">⭐ Best Value — Subscription</Badge>
                  <h3 className="font-semibold text-foreground text-sm">RENU 28 Revitalising Gel</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2 flex-1">
                Save with a flexible subscription. Change, defer, or cancel anytime — fully secure checkout through ASEA Global.
              </p>
              <p className="text-xs text-purple-600 mb-5">Flexible · Secure · Cancel anytime</p>
              <a href={links.renu28Subscription} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2">
                  <ShoppingCart className="w-4 h-4" /> Subscribe &amp; Save <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          All orders are processed securely through ASEA Global's official checkout.
          100% money-back guarantee on empty bottles or tubes.
        </p>
      </div>
    </section>
  );
}

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

      {/* ASEA Products */}
      <AseaProductSection />

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
