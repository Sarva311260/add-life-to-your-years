import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap, Heart, Brain, Moon, Shield, Activity, Bone, Sparkles,
  ArrowRight, BookOpen, Play, ChevronDown, ExternalLink,
  Leaf, X, Eye, Waves, Dumbbell, Battery, Sun, Droplets,
  Phone, Mail, User, MessageSquare, CheckCircle, Send, Menu,
  Share2, Copy, Check,
  Facebook, Instagram, Linkedin, Youtube,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ── Termékadatok (Magyar) ─────────────────────────────────── */
const PRODUCTS = [
  {
    name: "OlyLife THZ Tera-P90+",
    price: "US$1 500",
    deviceKey: "tera-p90",
    tagline: "Komplex PEMF Wellness Eszköz",
    description:
      "A P90+ zászlóshajó kombinálja a PEMF, terahertz és közeli infravörös technológiákat egy elegáns talpbetétes kialakításban, cserélhető pálca-kiegészítőkkel. Napi otthoni használatra tervezve, terápiás elektromágneses impulzusokat biztosít a Schumann-rezonancia frekvencián (7,83 Hz) — ugyanazon a frekvencián, mint a Föld természetes elektromágneses mezeje.",
    features: [
      "PEMF + Terahertz + Közeli infravörös",
      "Több pálca-kiegészítő mellékelve",
      "Állítható időzítő és intenzitás",
      "Schumann-rezonancia frekvencia (7,83 Hz)",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/p90plus-clean_87a41dc7.jpg",
    accent: "bg-emerald-50 border-emerald-200",
    detail: {
      subtitle: "3-az-1-ben PEMF és Terahertz Wellness Rendszer",
      overview:
        "Az OlyLife THZ Tera-P90+ a világ első eszköze, amely integrálja a PEMF technológiát a Terahertz hullámterápiával. Három precíziós wellness eszközt kombinál egyetlen egységes platformon: a Fő PEMF & Terahertz Eszközt, a Frost Age Szépségeszközt és a Revitaluxe Masszőrt.",
      components: [
        {
          name: "Fő Eszköz — PEMF & Terahertz",
          desc: "Kalibrált elektromágneses impulzusokat kombinál Terahertz hullámtechnológiával, amely az egészséges emberi sejtek természetes frekvenciatartományán rezonál. 20 intenzitásszinttel, vezeték nélküli infravörös távirányítóval és fejlesztett talpbetéttel rendelkezik (US 13 / EU 47-ig).",
        },
        {
          name: "Frost Age Szépségeszköz — RF & EMS",
          desc: "Dedikált anti-aging kiegészítő, amely rádiófrekvenciás technológiát alkalmaz a kollagéntermelés serkentésére és a bőr feszesítésére, kombinálva Elektromos Izomstimulációval az arc és test tónusának javítására. Ideális finom vonalak, ráncok és bőrrugalmasság kezelésére.",
        },
        {
          name: "Revitaluxe Masszőr — 3-az-1-ben Mágneses Fúzió",
          desc: "A legfejlettebb kiegészítő, amely pulzáló, statikus és forgó mágneses mezőket kombinál EMS/TENS fájdalomcsillapítással és Vörös Fénnyel (fotobiomoduláció) a hajnövesztés, fejbőr-egészség és mélyszöveti regeneráció érdekében.",
        },
      ],
      specs: [
        { label: "Alaptechnológia", value: "PEMF + Terahertz hullám" },
        { label: "Szépségtechnológia", value: "RF + EMS" },
        { label: "Masszázstechnológia", value: "3-az-1-ben Mágneses Fúzió + EMS + TENS + Vörös Fény" },
        { label: "Intenzitásszintek", value: "20 (teljesen állítható)" },
        { label: "Vezérlés", value: "Infravörös Vezeték Nélküli Távirányító" },
        { label: "Talpbetét", value: "US 13 / EU 47-es méretig" },
        { label: "Biztonság", value: "Beépített biztosítékvédelem" },
        { label: "Garancia", value: "1 év" },
      ],
    },
  },
  {
    name: "OlyLife Shaken Massager",
    price: "US$1 000",
    deviceKey: "terahertz-wand",
    tagline: "7-az-1-ben Testformáló & Regeneráló",
    description:
      "Sokoldalú öves eszköz, amely kombinálja a PEMF terápiát ultrahangos, hőterápiás és vibrációs masszázzsal. A mag és derék területét célozza mélyszöveti stimulációhoz, keringéstámogatáshoz és izomregenerációhoz — ideális edzés utáni regenerációhoz és napi wellness karbantartáshoz.",
    features: [
      "PEMF + Ultrahang + Hőterápia",
      "7 integrált technológia",
      "Célzott mag és derék alkalmazás",
      "Hordozható öves kialakítás",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/shaken-massager_fced25a9.jpg",
    accent: "bg-teal-50 border-teal-200",
    detail: {
      subtitle: "7-az-1-ben Okos Wellness Öv",
      overview:
        "Az OlyLife Shaken Masszőr egy viselhető derékmasszázs öv, amelyet testjóllét, izomrelaxáció és magmasszázs céljára terveztek. 7,8 Hz-es ultra-alacsony frekvenciájú PEMF mezőt alkalmaz, amely akár 20 cm mélységig hatol, hat további terápiás technológiával kombinálva az átfogó testtámogatás érdekében.",
      components: [
        {
          name: "PEMF Terápia (7,8 Hz)",
          desc: "Az ultra-alacsony frekvenciájú pulzáló elektromágneses mező akár 20 cm mélységig hatol, javítja a mikrokeringést, fokozza a sejt-anyagcserét és támogatja a szervezet természetes javítási folyamatait szöveti szinten.",
        },
        {
          name: "Hő & Vörös Fény Terápia",
          desc: "Célzott hőterápia vörös fénnyel kombinálva mélyszöveti melegítéshez, fokozott véráramláshoz és fotobiomodulációhoz — elősegíti a relaxációt és felgyorsítja a regenerációt a mag és derék területén.",
        },
        {
          name: "Vibráció & Ultrahangos Masszázs",
          desc: "9 sebességű erős vibráció 4 professzionális masszázsfejjel ritmikus rezgést és ultrahangos stimulációt biztosít. Célozza a nyakat, vállat, hátat, derekat és lábakat az átfogó izomkönnyítés érdekében.",
        },
      ],
      specs: [
        { label: "Alaptechnológia", value: "PEMF (7,8 Hz ultra-alacsony frekvencia)" },
        { label: "Behatolási mélység", value: "Akár 20 cm" },
        { label: "Technológiák", value: "7 integrált (PEMF, ultrahang, hő, vibráció, vörös fény, EMS, infravörös)" },
        { label: "Vibrációs sebességek", value: "9 szint" },
        { label: "Masszázsfejek", value: "4 professzionális kiegészítő" },
        { label: "Töltés", value: "USB Type-C újratölthető" },
        { label: "Célterületek", value: "Nyak, váll, hát, derék, lábak" },
        { label: "Garancia", value: "1 év" },
      ],
    },
  },
  {
     name: "OlyLife Galaxy G-One",
    price: "US$500",
    deviceKey: "tera-grand",
    tagline: "Okos Szemmaszk PEMF-fel",
    description:
      "Összecsukható okos szemmasszőr, amely integrálja a PEMF technológiát 7 szem-gondozási móddal. Digitális szemfáradtság, feszültségfejfájás és alvás-előkészítés enyhítésére tervezve — kombinálja a gyengéd elektromágneses stimulációt hő- és kompressziós terápiával kompakt, utazásbarát formában.",
    features: [
      "PEMF-javított szemterápia",
      "7 szem-gondozási mód",
      "Összecsukható & utazásbarát",
      "Egyérintéses egyszerű vezérlés",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/galaxy-gone_917c4ce8.png",
    accent: "bg-green-50 border-green-200",
    detail: {
      subtitle: "PEMF Okos Szemmasszőr",
      overview:
        "Az OlyLife Galaxy G-One egy fejlett okos szemmasszőr, amely integrálja az alacsony frekvenciájú PEMF technológiát 3D légzsák-gyúrással, grafén hőterápiával és időszakos vibrációval. 4 egyedi technológiával és 7 szem-gondozási móddal professzionális szintű szemterápiát nyújt kompakt, összecsukható kialakításban.",
      components: [
        {
          name: "Hat-Zónás 3D Légzsák-Gyúrás",
          desc: "Precíziós légzsák-kompresszió hat zónában a szemek körül gyengéd, ritmikus gyúrást biztosít, amely enyhíti a feszültséget, csökkenti a duzzanatot és serkenti az akupresszúrás pontokat a szemüreg körül.",
        },
        {
          name: "Grafén 42°C Meleg Borogatás",
          desc: "Állandó hőmérsékletű grafén fűtés 42°C-on megnyugtató meleget biztosít, amely javítja a véráramlást a szemek körül, enyhíti a szárazságot és segít ellazítani a szem körüli finom izmokat.",
        },
        {
          name: "PEMF + Alacsony Frekvenciájú Vibráció",
          desc: "Időszakos alacsony frekvenciájú PEMF impulzusok gyengéd vibrációval kombinálva serkentik a sejttevékenységet, csökkentik a gyulladást és támogatják az általános szemegészséget — különösen előnyös digitális szemfáradtságban szenvedők számára.",
        },
      ],
      specs: [
        { label: "Alaptechnológia", value: "Alacsony frekvenciájú PEMF" },
        { label: "Masszázsrendszer", value: "Hat-Zónás 3D Légzsák-Gyúrás" },
        { label: "Hőterápia", value: "Grafén 42°C Állandó Hőmérséklet" },
        { label: "Egyedi technológiák", value: "4 (Bionikus Ultra Látás, Hordozható PEMF, Grafén, 3D Légzsák)" },
        { label: "Szem-gondozási módok", value: "7 mód" },
        { label: "Kialakítás", value: "Összecsukható & utazásbarát" },
        { label: "Vezérlés", value: "Egyérintéses egyszerű kezelés" },
        { label: "Garancia", value: "1 év" },
      ],
    },
  },
];

/* ── Klinikai Bizonyítékok (Magyar) ───────────────────────── */
const EVIDENCE = [
  { icon: <Bone className="w-5 h-5" />, title: "Csonthegedés", text: "FDA által jóváhagyott 1979 óta nem-egyesülő törések kezelésére. A PEMF jelentősen felgyorsítja a csonthegedést és javítja a csontdenzitást oszteoporózisban." },
  { icon: <Shield className="w-5 h-5" />, title: "Fájdalom & Gyulladás", text: "Több randomizált kontrollált vizsgálat igazolja a fájdalom és gyulladásos markerek csökkentését oszteoartritiszben, reumatoid artritiszben, fibromialgiában és műtét utáni fájdalomban." },
  { icon: <Brain className="w-5 h-5" />, title: "Depresszió", text: "Egy 2016-os metaanalízis szerint az ismétlődő transzkraniális mágneses stimuláció szignifikánsan hatékonyabb volt a sham kezelésnél major depresszív zavarban." },
  { icon: <Moon className="w-5 h-5" />, title: "Alvásminőség", text: "A Schumann-rezonancia frekvencián alkalmazott PEMF javítja az alvásminőséget, csökkenti az elalvási késleltetést és növeli a lassú hullámú (mély) alvást." },
  { icon: <Heart className="w-5 h-5" />, title: "Sebgyógyulás", text: "Felgyorsítja a lágyszöveti sérülések gyógyulását, csökkenti a műtét utáni gyulladást, és évtizedek óta alkalmazzák a sportmedicínában." },
  { icon: <Sparkles className="w-5 h-5" />, title: "Redox Jelátvitel", text: "A PEMF modulálja a reaktív oxigénfajokat mitokondriális szinten, rekalibrálva a sejt redox-környezetét és serkentve az Nrf2 antioxidáns útvonalat." },
];

/* ── Hivatkozások ─────────────────────────────────────────── */
const REFERENCES = [
  "Markov MS. Expanding use of pulsed electromagnetic field therapies. Electromagnetic Biology and Medicine. 2007;26(3):257–274.",
  "Elshiwi AM, et al. Effect of pulsed electromagnetic field on nonspecific low back pain patients: a randomized controlled trial. Brazilian Journal of Physical Therapy. 2019;23(3):244–249.",
  "Funk RH. Endogenous electric fields as guiding cue for cell migration. Frontiers in Physiology. 2015;6:143.",
  "Chevalier G, et al. Earthing: health implications of reconnecting the human body to the Earth's surface electrons. Journal of Environmental and Public Health. 2012;2012:291541.",
  "Oschman JL, et al. The effects of grounding (earthing) on inflammation, the immune response, wound healing, and prevention and treatment of chronic inflammatory and autoimmune diseases. Journal of Inflammation Research. 2015;8:83–96.",
  "Nicolson GL. Mitochondrial dysfunction and chronic disease: treatment with natural supplements. Integrative Medicine: A Clinician's Journal. 2014;13(4):35–45. PMC4566449.",
  "Bhatti JS, et al. Mitochondrial dysfunction and oxidative stress in metabolic disorders — a step towards mitochondria based therapeutic strategies. Biochimica et Biophysica Acta. 2017;1863(5):1066–1077. PMC5423868.",
  "Staal J, Blanco LP, Perl A. Mitochondrial dysfunction in inflammation and autoimmunity. Frontiers in Immunology. 2023;14:1304315.",
  "Chianese D, et al. Exploring mitochondrial interactions with pulsed electromagnetic fields: mechanisms and therapeutic implications. International Journal of Molecular Sciences. 2024;25(15):PMC11277522.",
  "Hollenberg AM, et al. Electromagnetic stimulation increases mitochondrial oxidative phosphorylation in osteoblasts and promotes bone fracture repair. Scientific Reports. 2021;11:19536.",
  "Yang C, et al. Pulsed electromagnetic fields regulate metabolic reprogramming and mitochondrial fission in endothelial cells for angiogenesis. Scientific Reports. 2024;14:PMC11329790.",
];

/* ── Fade-in animáció ─────────────────────────────────────── */
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Termék Részletek Modal ───────────────────────────────── */
function ProductDetailModal({
  product,
  open,
  onClose,
}: {
  product: (typeof PRODUCTS)[number];
  open: boolean;
  onClose: () => void;
}) {
  const d = product.detail;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <DialogTitle className="font-serif text-2xl text-gray-900">
              {product.name}
            </DialogTitle>
            {product.price && (
              <span className="shrink-0 text-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1">
                {product.price}
              </span>
            )}
          </div>
          <DialogDescription className="text-emerald-700 font-medium">{d.subtitle}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4 bg-gray-50 rounded-lg mb-4">
          <img src={product.image} alt={product.name} className="h-48 w-auto object-contain" />
        </div>
        <p className="text-gray-700 leading-relaxed text-sm mb-6">{d.overview}</p>
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Főbb Technológiák</h4>
          {d.components.map((c) => (
            <div key={c.name} className="border border-emerald-100 bg-emerald-50/40 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 text-sm mb-1">{c.name}</h5>
              <p className="text-gray-600 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Műszaki Adatok</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {d.specs.map((s, i) => (
              <div key={s.label} className={`flex text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <div className="w-2/5 px-4 py-2.5 font-medium text-gray-700 border-r border-gray-200">{s.label}</div>
                <div className="w-3/5 px-4 py-2.5 text-gray-600">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Kapcsolatfelvételi Űrlap Modal ───────────────────────── */
function ContactFormModal({
  open,
  onClose,
  affiliateSlug,
  affiliateName,
}: {
  open: boolean;
  onClose: () => void;
  affiliateSlug: string;
  affiliateName: string;
}) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const enquiryMutation = trpc.pemfAffiliate.submitEnquiry.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Érdeklődése elküldve!");
    },
    onError: (error) => {
      toast.error(error.message || "Valami hiba történt. Kérjük, próbálja újra.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim()) {
      toast.error("Kérjük, adja meg nevét és e-mail címét.");
      return;
    }
    enquiryMutation.mutate({
      affiliateSlug,
      visitorName: visitorName.trim(),
      visitorEmail: visitorEmail.trim(),
      visitorPhone: visitorPhone.trim() || undefined,
      message: message.trim() || undefined,
      sourcePage: window.location.pathname,
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    setVisitorName("");
    setVisitorEmail("");
    setVisitorPhone("");
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-gray-900">
            {submitted ? "Köszönjük!" : "Kapcsolatfelvétel"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {submitted
              ? `${affiliateName} hamarosan felveszi Önnel a kapcsolatot.`
              : `Érdeklődjön PEMF eszközökről ${affiliateName} segítségével.`}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-gray-600 mb-4">
              Érdeklődése elküldve {affiliateName} részére. Hamarosan felveszi Önnel a kapcsolatot.
            </p>
            <Button onClick={handleClose} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              Bezárás
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teljes neve *</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Teljes neve"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail cím *</label>
              <input
                type="email"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                placeholder="pelda@email.hu"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefonszám</label>
              <input
                type="tel"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                placeholder="+36 30 000 0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Üzenet</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Szeretnék többet megtudni..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={enquiryMutation.isPending}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
            >
              {enquiryMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Küldés...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Érdeklődés Küldése
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════
   Kapcsolat Szekció Űrlap
   ══════════════════════════════════════════════════════════════ */
function ContactSectionForm({ affiliateSlug }: { affiliateSlug: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const enquiryMutation = trpc.pemfAffiliate.submitEnquiry.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Üzenete elküldve!");
    },
    onError: (error) => {
      toast.error(error.message || "Valami hiba történt. Kérjük, próbálja újra.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Kérjük, adja meg nevét és e-mail címét.");
      return;
    }
    enquiryMutation.mutate({
      affiliateSlug,
      visitorName: name.trim(),
      visitorEmail: email.trim(),
      visitorPhone: phone.trim() || undefined,
      message: message.trim() || undefined,
      sourcePage: window.location.pathname,
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Köszönjük!</h3>
        <p className="text-emerald-200/70">Köszönjük megkeresését. Hamarosan felvesszük Önnel a kapcsolatot.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-1.5">Teljes neve *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-emerald-800/50 border border-emerald-700/50 text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent"
            placeholder="Kovács János"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-1.5">E-mail cím *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-emerald-800/50 border border-emerald-700/50 text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent"
            placeholder="kovacs@pelda.hu"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-1.5">Telefonszám</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-emerald-800/50 border border-emerald-700/50 text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent"
          placeholder="+36 30 000 0000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-emerald-300 mb-1.5">Üzenet</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-emerald-800/50 border border-emerald-700/50 text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent resize-none"
          placeholder="Szeretnék többet megtudni..."
        />
      </div>
      <div className="text-center">
        <Button
          size="lg"
          type="submit"
          disabled={enquiryMutation.isPending}
          className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold gap-2 px-8"
        >
          {enquiryMutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin" />Küldés...</>
          ) : (
            <><Mail className="w-4 h-4" />Üzenet Küldése</>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════
   Magyar PEMF Affiliate Oldal
   ══════════════════════════════════════════════════════════════ */
export default function PEMFAffiliateHU() {
  const [, params] = useRoute("/pemf/:slug/hu");
  const slug = params?.slug || "";

  const { data: affiliate, isLoading, error } = trpc.pemfAffiliate.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Set affiliate cookie with no expiry when visitor arrives via pemf link
  useEffect(() => {
    if (slug) {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 100);
      document.cookie = `affiliate_slug=${encodeURIComponent(slug)}; expires=${farFuture.toUTCString()}; path=/; SameSite=Lax`;
    }
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    const title = `${affiliate?.name} — PEMF Gyógyítás | Adj Éveket az Életedhez`;
    const text = `Nézze meg ezt a PEMF wellness oldalt ${affiliate?.name} ajánlásával`;
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success("Link másolva a vágólapra!");
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  const headerRef = useRef<HTMLElement>(null);

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      const headerHeight = headerRef.current?.offsetHeight || 56;
      const offset = headerHeight + 20;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  }, []);

  // Betöltési állapot
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Betöltés...</p>
        </div>
      </div>
    );
  }

  // Nem található
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="font-serif text-2xl text-gray-900 mb-2">Az oldal nem található</h1>
          <p className="text-gray-500">Ez a márkapartner oldal nem létezik vagy már nem aktív.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Fejléc ───────────────────────────────────────────── */}
      <header ref={headerRef} className="sticky top-0 left-0 right-0 z-50 bg-emerald-900/95 backdrop-blur-md shadow-sm border-b border-emerald-700/40">
        <div className="container flex items-center justify-between h-14">
          {/* Bal: Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Leaf className="w-5 h-5 text-emerald-300" />
            <span className="font-serif text-sm font-semibold text-white hidden sm:block">
              Adj Éveket az Életedhez
            </span>
          </div>

          {/* Középen: Navigáció (asztali) */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="#science" onClick={(e) => scrollToSection(e, 'science')}>
              <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white hover:bg-emerald-800/50 text-xs">
                Tudomány
              </Button>
            </a>
            <a href="#evidence" onClick={(e) => scrollToSection(e, 'evidence')}>
              <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white hover:bg-emerald-800/50 text-xs">
                Bizonyítékok
              </Button>
            </a>
            <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>
              <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white hover:bg-emerald-800/50 text-xs">
                Eszközök
              </Button>
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>
              <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white hover:bg-emerald-800/50 text-xs">
                Kapcsolat
              </Button>
            </a>
          </nav>

          {/* Jobb: Affiliate neve, telefonszám & megosztás */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-white text-sm font-medium leading-tight">
                {affiliate.name}
                <span className="text-emerald-300 font-normal"> — Márkapartner</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-emerald-300/80 text-xs">
                <Phone className="w-3 h-3" />
                <span>{affiliate.phone}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 text-xs px-3 py-1.5 rounded-lg transition-all border border-emerald-600/40"
              title="Oldal megosztása"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{copied ? "Másolva!" : "Megosztás"}</span>
            </button>
          </div>

          {/* Mobil: hamburger menü */}
          <button
            className="md:hidden text-emerald-200 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menü megnyitása"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobil legördülő menü */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-emerald-900 border-t border-emerald-700/40 px-4 py-3 space-y-1">
            <div className="pb-3 mb-2 border-b border-emerald-700/40">
              <div className="text-white text-sm font-medium">
                {affiliate.name}
                <span className="text-emerald-300 font-normal"> — Márkapartner</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-300/80 text-xs mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{affiliate.phone}</span>
              </div>
            </div>
            <a href="#science" onClick={(e) => scrollToSection(e, 'science')} className="block text-emerald-200 hover:text-white py-2 text-sm">
              Tudomány
            </a>
            <a href="#evidence" onClick={(e) => scrollToSection(e, 'evidence')} className="block text-emerald-200 hover:text-white py-2 text-sm">
              Bizonyítékok
            </a>
            <a href="#products" onClick={(e) => scrollToSection(e, 'products')} className="block text-emerald-200 hover:text-white py-2 text-sm">
              Eszközök
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="block text-emerald-200 hover:text-white py-2 text-sm">
              Kapcsolat
            </a>
          </div>
        )}
      </header>

      {/* ── Hős Szekció ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)" }} />

        <div className="relative container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <Badge className="bg-emerald-700/50 text-emerald-100 border-emerald-600/50 mb-6 text-xs tracking-widest uppercase px-4 py-1.5">
                Bizonyítékon Alapuló Wellness Technológia
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                PEMF Terápia
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-emerald-100/90 leading-relaxed max-w-2xl mx-auto mb-8">
                A Pulzáló Elektromágneses Mező (PEMF) terápia külsőleg alkalmazott elektromágneses impulzusokat használ a sejtes javítás és regeneráció serkentésére — egy technológia, amelyet a klinikai orvoslásban az 1970-es évek óta alkalmaznak.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#science" onClick={(e) => scrollToSection(e, 'science')}>
                  <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 gap-2 font-medium">
                    <BookOpen className="w-4 h-4" />
                    A Tudomány
                  </Button>
                </a>
                <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>
                  <Button size="lg" variant="outline" className="border-emerald-400/40 text-white hover:bg-emerald-800/50 gap-2 font-medium">
                    <Zap className="w-4 h-4" />
                    Eszközök Megtekintése
                  </Button>
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Mi a PEMF Terápia? ────────────────────────────────── */}
      <section id="science" className="py-20 bg-white" style={{ scrollMarginTop: '80px' }}>
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">A Technológia Megértése</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mi a PEMF Terápia?</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">
                A Pulzáló Elektromágneses Mező (PEMF) terápia külsőleg alkalmazott elektromágneses impulzusokat használ a sejtes javítás és regeneráció serkentésére. A technológiát a klinikai orvoslásban az 1970-es évek óta alkalmazzák — az FDA először 1979-ben hagyta jóvá nem-egyesülő csonttörések kezelésére, és azóta számos alkalmazási területen jelentős bizonyítékbázist halmozott fel.
              </p>
              <p className="text-gray-700 leading-relaxed text-base mt-4">
                A mechanizmus összhangban van a sejtes elektromos jelátvitelről alkotott ismereteinkkel: a PEMF impulzusok kölcsönhatásba lépnek a sejtmembrán elektromos potenciáljával, serkentik az ioncsatornákat, javítják a sejtes energiatermelést (ATP-szintézis), csökkentik a gyulladást és elősegítik a szöveti javítást. A terápiás PEMF eszközökben alkalmazott frekvenciák jellemzően a Föld természetes Schumann-rezonanciáinak tartományába esnek — ami arra utal, hogy a PEMF terápia részben azt az elektromágneses környezetet állítja vissza, amelyen belül a szervezet evolúciója zajlott.
              </p>
            </div>
          </FadeIn>

          {/* Sejt, Mitokondrium & Telefontöltő Analógia */}
          <FadeIn delay={0.15}>
            <div className="mt-10 max-w-none">
              <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Ön Elektromágneses Lény</h3>
              <p className="text-gray-700 leading-relaxed text-base mb-5">
                A legalapvetőbb szinten Ön nem csupán egy biológiai szervezet — Ön elektromágneses lény. Testének minden élő sejtje elektromos töltést hordoz, és ez a töltés tartja életben a sejtet. Amikor egy sejt elektromágneses mezeje összeomlik, a sejt meghal. Ez nem metafora; ez a sejtes élet alapfizikája. Sejtjei egészsége elválaszthatatlan elektromos környezetük egészségétől.
              </p>
              <p className="text-gray-700 leading-relaxed text-base mb-5">
                Minden sejtben apró struktúrák találhatók, az úgynevezett <strong>mitokondriumok</strong> — a sejt energiaüzemei. Feladatuk, hogy a belélegzett oxigénből és az elfogyasztott táplálékból <strong>ATP-t</strong> (adenozin-trifoszfát) állítsanak elő, azt az univerzális energiavalutát, amely testünk minden funkcióját táplálja. Ez az átalakulási folyamat egy folyamatos elektronáramlás által hajtott — gondoljon rá úgy, mint egy turbina forgó propellerére, amely elektromosságot termel. Amikor ez az elektronáramlás erős és megszakítatlan, sejtjei energikusak, szövetei hatékonyan regenerálódnak, és szervezete virágzik.
              </p>
              <p className="text-gray-700 leading-relaxed text-base mb-5">
                De ez az elektronáramlás megzavarható. Méreganyagok, peszticidek, ipari vegyszerek, krónikus gyulladás, tápanyaghiányok és fertőzések mind ronthatják a mitokondriális funkciót és csökkenthetik az ATP-termelést. Amikor ez megtörténik, a sejtek működési zavarba kerülnek. És itt a kritikus felismerés: <strong>minden jelentős krónikus betegségnek</strong> — gyulladásos, autoimmun, degeneratív és még rákos betegségeknek is — van mitokondriális komponense. Szinte minden krónikus betegség mélyén a sejtes energia hiánya áll. A sejtek nem gyógyszer hiányában pusztulnak; hanem energia hiányában küzdenek.
              </p>
              <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4 mt-8">A Telefontöltő Analógia</h3>
              <p className="text-gray-700 leading-relaxed text-base mb-5">
                Gondoljon arra, mi történik, amikor mobiltelefon akkumulátora lemerül. A képernyő elsötétül, lelassul, és amikor az akkumulátor teljesen lemerül, a kommunikáció leáll — nem azért, mert valami elromlott, hanem egyszerűen azért, mert nincs áram. A megoldás egyszerű: ráhelyezi egy vezeték nélküli töltőre. A töltő pulzáló elektromágneses mezőt használ az energia indukcióval való átvitelére — kábelek és közvetlen érintkezés nélkül — és a telefon akkumulátora elkezd töltődni.
              </p>
              <p className="text-gray-700 leading-relaxed text-base mb-5">
                Az ezen az oldalon található termékek, mint a P90+, pontosan ugyanezen az elven működnek, de az Ön teste számára. Amikor talpát a P90+ fémlapjára helyezi, az eszköz pulzáló elektromágneses mezőt generál, amely indukcióval áthatol testén — akárcsak a vezeték nélküli töltő. Mitokondriumai, sejtjei akkumulátorai, felveszik ezt az elektromágneses energiát és felhasználják elektronáramlásuk helyreállítására és az ATP-termelés fokozására. A kimerült, lassú sejtek elkezdenek feltöltődni. A keringés javul, az oxigénszállítás növekszik, a gyulladás csökken, és a szervezet természetes javítási folyamatai bekapcsolnak. Nem ad hozzá semmi idegent testéhez — egyszerűen helyreállítja azt az energetikai környezetet, amelyen belül sejtjei működésre terveztek.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-12 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">PEMF és Redox Jelátvitel</h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    A PEMF terápia egyik legfontosabb mechanizmusa a sejtes redox-biokémiára gyakorolt közvetlen hatása. A kutatások kimutatták, hogy a PEMF expozíció modulálja a reaktív oxigénfajok (ROS) termelését és egyensúlyát a sejteken belül, különösen mitokondriális szinten. Ahelyett, hogy egyszerűen elnyomná az oxidatív stresszt, a PEMF úgy tűnik, <em>rekalibrállja</em> a redox-környezetet — csökkentve a túlzott ROS-t, miközben megőrzi a reaktív fajok által az immunvédelemben, apoptózisban és szöveti javításban játszott előnyös jelátviteli funkciókat.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Kórháztól az otthonig */}
          <FadeIn delay={0.3}>
            <div className="mt-14">
              <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">A Kórházi Szobáktól az Ön Nappalijáig</h3>
              <p className="text-gray-700 leading-relaxed text-base mb-6">
                Évtizedekig a PEMF terápia figyelemre méltó előnyei kórházak és szakklinikák ajtai mögé voltak zárva. A terápiás elektromágneses impulzusok biztosításához szükséges eszközök hatalmasak, bonyolultak és rendkívül drágák voltak. A klinikai minőségű gépek, mint a <strong>Papimi</strong> — egy Görögországban fejlesztett nagy teljesítményű ionindukciós terápiás eszköz — <strong>60 000 USD-nál</strong> többe kerültek, képzett kezelőket igényeltek, és túl nagyok és specializáltak voltak ahhoz, hogy klinikai környezeten kívül alkalmazzák őket. Ennek eredményeként emberek milliói, akik profitálhattak volna ebből a bevált technológiából, egyszerűen nem fértek hozzá.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/papimi-device_ca16d201.jpg"
                    alt="Papimi PEMF eszköz — klinikai minőségű gép, amely több mint 60 000 USD-ba kerül"
                    className="w-full h-56 object-contain bg-white"
                  />
                  <p className="text-xs text-gray-500 text-center py-2 px-3">A Papimi eszköz — klinikai minőségű PEMF, több mint 60 000 USD értékben</p>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/clinical-pemf-room_7ffba86f.jpg"
                    alt="Beteg PEMF terápiát kap klinikai környezetben"
                    className="w-full h-56 object-cover"
                  />
                  <p className="text-xs text-gray-500 text-center py-2 px-3">PEMF terápia klinikai környezetben — korábban az egyetlen hozzáférési mód</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed text-base">
                Ez most megváltozott. Az <strong>OlyLife</strong> jóvoltából ez a rendkívüli technológia már nem korlátozódik kórházakra és klinikákra. Évek innovációjával, miniatürizálással és egy okos közvetlen fogyasztói üzleti modellel az OlyLife sikeresen csökkentette a valódi PEMF terápia költségeit a mindennapi emberek számára elérhető szintre — anélkül, hogy a tudományos alapot vagy a terápiás hatékonyságot feláldozta volna. Ami egykor 60 000 USD-os gépet és képzett klinikust igényelt, most otthona kényelmében tapasztalható meg, töredék áron.
              </p>
              <p className="text-gray-700 leading-relaxed text-base mt-4">
                Ez azért lehetséges, mert az OlyLife így épül fel. Kutatás-fejlesztésüket <strong>Svédországban</strong> és <strong>Németországban</strong> végzik — két országban, amelyek mély hagyományokkal rendelkeznek a precíziós mérnöki és orvostechnológiai területen. A kritikus alkatrészeket <strong>Japánból</strong> szerzik be, amely szigorú gyártási szabványairól ismert. A végső összeszerelés <strong>Hongkongban</strong> történik, ahol a világszínvonalú logisztikai és gyártási infrastruktúra hatékonyan tartja a költségeket. Az eredmény egy termék, amely valóban élvonalbeli a tudományában, mégis a mindennapi emberek számára elérhető áron.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Videó Szekció ─────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Nézze & Tanulja</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">A PEMF Működés Közben</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
              <iframe
                src="https://player.vimeo.com/video/1171547981?h=e7b1e8a82b"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title="PEMF Terápia Áttekintés"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-10 relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
              <iframe
                src="https://player.vimeo.com/video/1098381990?h=72a0b30a8e"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                allowFullScreen
                title="PEMF Terápia — Valós Eredmények"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Klinikai Bizonyítékok ─────────────────────────────── */}
      <section id="evidence" className="py-20 bg-white" style={{ scrollMarginTop: '80px' }}>
        <div className="container max-w-5xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Peer-Review Kutatás</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Klinikai Bizonyítékok</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto mb-6" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                A PEMF terápiát kiterjedten tanulmányozták több klinikai alkalmazásban, peer-review orvosi folyóiratokban publikált bizonyítékokkal.
              </p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVIDENCE.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="h-full p-6 bg-gray-50/80 border border-gray-100 rounded-xl hover:border-emerald-200/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Termékek ──────────────────────────────────────────── */}
      <section id="products" className="py-20 bg-gradient-to-b from-emerald-50/40 to-white" style={{ scrollMarginTop: '80px' }}>
        <div className="container max-w-5xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Ajánlott Eszközök</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">OlyLife PEMF Eszközök</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto mb-6" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                Megvizsgáltuk az elérhető lehetőségeket, és ezeket a minőségi, bizonyítékon alapuló eszközöket ajánljuk otthoni használatra.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-8">
            {PRODUCTS.map((product, i) => (
              <FadeIn key={product.name} delay={i * 0.1}>
                <Card className={`overflow-hidden border ${product.accent} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-2/5 bg-white flex items-center justify-center p-8">
                        <img src={product.image} alt={product.name} className="w-full max-w-xs h-auto object-contain" style={{ maxHeight: "280px" }} />
                      </div>
                      <div className="md:w-3/5 p-8 flex flex-col justify-center">
                        <Badge className="w-fit bg-emerald-100 text-emerald-800 border-emerald-200 mb-3 text-xs">{product.tagline}</Badge>
                        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                        <p className="text-gray-600 leading-relaxed text-base mb-5">{product.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                          {product.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Button
                            variant="outline"
                            className="w-fit border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-2"
                            onClick={() => setSelectedProduct(i)}
                          >
                            Részletek
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Kapcsolatfelvételi CTA */}
          <FadeIn delay={0.3}>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Szeretne többet megtudni ezekről az eszközökről?</p>
              <Button
                size="lg"
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
                onClick={() => setContactOpen(true)}
              >
                Kapcsolatfelvétel {affiliate.name} segítségével
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Hogyan Működik ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">A Mechanizmus</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hogyan Működik a PEMF</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto" />
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Elektromágneses Impulzusok", desc: "Az alacsony frekvenciájú elektromágneses hullámok replikálják a Föld természetes Schumann-rezonanciáját (7,83 Hz), mélyen behatolva a szervezet szöveteibe." },
              { step: "02", title: "Sejtes Stimuláció", desc: "Az impulzusok kölcsönhatásba lépnek a sejtmembránokkal, serkentik az ioncsatornákat, javítják az ATP energiatermelést és optimális szintre állítják vissza a sejtes feszültséget." },
              { step: "03", title: "Gyógyulási Válasz", desc: "A fokozott sejtes funkció beindítja a szervezet természetes javítási mechanizmusait — csökkenti a gyulladást, felgyorsítja a szöveti javítást és támogatja az immunfunkciót." },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5 font-serif text-xl font-bold">{item.step}</div>
                  <h3 className="font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hivatkozások ──────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container max-w-4xl">
          <FadeIn>
            <h3 className="font-serif text-xl font-semibold text-gray-900 mb-6">Hivatkozások</h3>
            <ol className="space-y-3">
              {REFERENCES.map((ref, i) => (
                <li key={i} className="text-sm text-gray-500 leading-relaxed pl-6 relative">
                  <span className="absolute left-0 text-gray-400">{i + 1}.</span>
                  {ref}
                </li>
              ))}
            </ol>
          </FadeIn>
        </div>
      </section>

      {/* ── Kapcsolat Szekció ─────────────────────────────────── */}
      <section id="contact" className="py-20 bg-emerald-900" style={{ scrollMarginTop: '120px' }}>
        <div className="container max-w-3xl">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-sm font-medium text-emerald-400 tracking-widest uppercase mb-3">Kapcsolatfelvétel</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Küldjön Üzenetet</h2>
              <div className="w-16 h-0.5 bg-emerald-400 mx-auto mb-4" />
              <p className="text-emerald-200/80">Kérdései vannak a PEMF terápiáról vagy eszközeinkről? Szívesen halljuk Öntől.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ContactSectionForm affiliateSlug={slug} />
          </FadeIn>
        </div>
      </section>

      {/* ── Új Videó ──────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Nézze Meg</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-4">Tudjon Meg Többet</h2>
            <div className="w-16 h-0.5 bg-emerald-600 mx-auto" />
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
            <iframe
              src="https://player.vimeo.com/video/1194307428?h=b58c79fb93"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
              title="PEMF Terápia — Tudjon Meg Többet"
            />
          </div>
        </div>
      </section>

      {/* ── Jogi Nyilatkozat ──────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container max-w-4xl">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            <strong className="text-gray-500">Orvosi Nyilatkozat:</strong> A PEMF technológiát évtizedek óta tanulmányozzák, egyes alkalmazásai FDA-jóváhagyást kaptak meghatározott indikációkra. Az ezen az oldalon bemutatott eszközök wellness eszközként, nem orvostechnikai eszközként kerülnek forgalomba. Nem céljuk betegségek diagnosztizálása, kezelése, gyógyítása vagy megelőzése. Minden új terápia vagy wellness program megkezdése előtt konzultáljon szakképzett egészségügyi szakemberrel.
          </p>
        </div>
      </section>

      {/* ── Lábléc ────────────────────────────────────────────── */}
      <footer className="py-8 bg-emerald-900 text-emerald-200/70">
        <div className="container text-center space-y-4">
          {/* Közösségi média ikonok */}
          {(affiliate.facebook || affiliate.instagram || affiliate.linkedin || affiliate.tiktok || affiliate.youtube || affiliate.twitter) && (
            <div className="flex items-center justify-center gap-4">
              {affiliate.facebook && (
                <a href={affiliate.facebook} target="_blank" rel="noreferrer" className="text-emerald-300/70 hover:text-emerald-300 transition-colors" title="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {affiliate.instagram && (
                <a href={affiliate.instagram} target="_blank" rel="noreferrer" className="text-emerald-300/70 hover:text-emerald-300 transition-colors" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {affiliate.linkedin && (
                <a href={affiliate.linkedin} target="_blank" rel="noreferrer" className="text-emerald-300/70 hover:text-emerald-300 transition-colors" title="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {affiliate.tiktok && (
                <a href={affiliate.tiktok} target="_blank" rel="noreferrer" className="text-emerald-300/70 hover:text-emerald-300 transition-colors" title="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
                </a>
              )}
              {affiliate.youtube && (
                <a href={affiliate.youtube} target="_blank" rel="noreferrer" className="text-emerald-300/70 hover:text-emerald-300 transition-colors" title="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {affiliate.twitter && (
                <a href={affiliate.twitter} target="_blank" rel="noreferrer" className="text-emerald-300/70 hover:text-emerald-300 transition-colors" title="X (Twitter)">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
            </div>
          )}
          {/* Megosztás gomb */}
          <div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-emerald-700/40 hover:bg-emerald-700/60 text-emerald-200 text-sm px-4 py-2 rounded-lg transition-all border border-emerald-600/30"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? "Link Másolva!" : "Oldal Megosztása"}
            </button>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Adj Éveket az Életedhez. Minden jog fenntartva.</p>
        </div>
      </footer>

      {/* ── Termék Részletek Modal ────────────────────────────── */}
      {selectedProduct !== null && (
        <ProductDetailModal
          product={PRODUCTS[selectedProduct]}
          open={selectedProduct !== null}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ── Kapcsolatfelvételi Űrlap Modal ───────────────────── */}
      <ContactFormModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        affiliateSlug={slug}
        affiliateName={affiliate.name}
      />
    </div>
  );
}
