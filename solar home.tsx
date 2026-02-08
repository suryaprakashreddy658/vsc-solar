import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Zap, IndianRupee, Leaf, ArrowRight, MessageCircle, Info, Calculator, CheckCircle2 } from "lucide-react";
import { Section, FadeIn } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateCalculation } from "@/hooks/use-calculations";
import { useToast } from "@/hooks/use-toast";
import { Link as ScrollLink } from "react-scroll";
import { insertCalculationSchema } from "@shared/schema";

// Form Schema based on backend schema but refined for UI state
const formSchema = z.object({
  inputType: z.enum(["bill", "units"]),
  value: z.coerce.number().min(1, "Please enter a valid amount"),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [result, setResult] = useState<null | {
    systemSizeKw: number;
    estimatedCost: number;
    monthlySavings: number;
    paybackPeriod: number;
  }>(null);

  const { toast } = useToast();
  const createCalculation = useCreateCalculation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: "bill",
      value: undefined,
      location: "Telangana", // Default as per requirements
    },
  });

  const onSubmit = (data: FormValues) => {
    // 1. Calculate Logic
    let units = 0;
    let billAmount = 0;

    if (data.inputType === "bill") {
      billAmount = data.value;
      units = billAmount / 7;
    } else {
      units = data.value;
      billAmount = units * 7;
    }

    // Round requiredKW to nearest 0.5
    let requiredKW = units / 130;
    requiredKW = Math.round(requiredKW * 2) / 2;
    if (requiredKW < 1) requiredKW = 1; // Minimum system size

    const costPerKw = 50000;
    const estimatedCost = requiredKW * costPerKw;
    const monthlySavings = requiredKW * 130 * 7; // Assuming 1kW generates 130 units saving ₹7/unit
    const paybackPeriod = parseFloat((estimatedCost / (monthlySavings * 12)).toFixed(1));

    const calculationResult = {
      systemSizeKw: requiredKW,
      estimatedCost,
      monthlySavings,
      paybackPeriod,
    };

    setResult(calculationResult);

    // 2. Save to Backend (Fire and forget, or handle error toast)
    createCalculation.mutate({
      billAmount: Math.round(billAmount),
      monthlyUnits: Math.round(units),
      systemSizeKw: String(requiredKW),
      estimatedCost: Math.round(estimatedCost),
      estimatedSavings: Math.round(monthlySavings),
      paybackPeriod: String(paybackPeriod),
      location: data.location,
    }, {
      onError: () => {
        console.error("Failed to save calculation statistic");
      }
    });

    // 3. Scroll to results
    setTimeout(() => {
      const element = document.getElementById("results");
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const getWhatsAppLink = () => {
    if (!result) return "#";
    const text = `Hi AK Solar! I'm interested in a ${result.systemSizeKw}kW Solar System. Estimated cost: ₹${result.estimatedCost.toLocaleString()}. Please send me a formal quote.`;
    return `https://wa.me/919182897309?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HEADER / HERO */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Sun className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-secondary">AK SOLAR</span>
          </div>
          <ScrollLink to="calculator" smooth={true} duration={500}>
            <Button size="sm" className="hidden md:flex">Get Estimate</Button>
          </ScrollLink>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <Section className="pt-20 pb-32 md:pt-32 md:pb-48 bg-secondary text-white relative overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/50 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <FadeIn>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Power Your Home <br />
                <span className="text-primary">Zero Bills.</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
                Calculate your solar savings instantly. Reduce your carbon footprint and eliminate electricity bills with our smart solar solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <ScrollLink to="calculator" smooth={true} duration={800} offset={-100}>
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all">
                    Calculate My Savings <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </ScrollLink>
                <ScrollLink to="about" smooth={true} duration={800}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                    Why Solar?
                  </Button>
                </ScrollLink>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2} className="hidden lg:block relative">
              {/* Unsplash Image with descriptive comment */}
              {/* Solar panels on a modern house roof sunny day */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] group">
                <img 
                  src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80" 
                  alt="Modern home with solar panels" 
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="flex items-center gap-4 text-white">
                    <div className="bg-green-500/90 backdrop-blur rounded-full p-2">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">Eco-Friendly Energy</p>
                      <p className="text-sm text-green-100">Save the planet, save money</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Section>

        {/* ABOUT SECTION */}
        <Section id="about" className="bg-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-bold text-secondary mb-8 text-center">🌞 AK SOLAR GREEN ENERGY</h2>
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <p className="text-lg leading-relaxed mb-8">
                  AK Solar Green Energy is a solar power solutions company focused on delivering reliable, cost-effective, and long-lasting solar energy systems for residential, commercial, and industrial customers.
                </p>

                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" /> What We Do
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      "Rooftop Solar Power Systems (On-grid & Hybrid)",
                      "Solar Panels and Inverters",
                      "Solar Water Heating Systems",
                      "Solar LED Lighting Solutions",
                      "Solar Pumps and Power Packs",
                      "Repair & Maintenance Services for Solar Systems"
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-muted-foreground italic">
                    We serve homes, commercial buildings, industries, and community projects with a strong focus on quality and durability.
                  </p>
                </div>

                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" /> Why Choose AK Solar Green Energy
                  </h3>
                  <ul className="grid gap-3 list-none p-0">
                    {[
                      "Over 18 years of experience in the solar energy sector",
                      "Trusted by 5000+ customers",
                      "Active presence in Andhra Pradesh & Telangana",
                      "Focus on long-life, low-maintenance solar solutions",
                      "Experienced technical team for installation & service"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 p-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="border-l-4 border-primary pl-6 py-2">
                    <h3 className="text-xl font-bold mb-3">Certifications & Registrations</h3>
                    <p className="mb-1">ISO 9001:2008 Certified</p>
                    <p>Registered under MSME – Government of India</p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-3">Our Objective</h3>
                    <p className="text-sm leading-relaxed">
                      Our objective is to promote a clean, eco-friendly, and energy-efficient environment by encouraging the adoption of renewable solar energy solutions that reduce pollution and dependency on conventional power sources.
                      We aim to make solar energy simple, affordable, and accessible for everyone.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sun className="w-5 h-5 text-primary" /> Founder
                    </h3>
                    <p className="text-lg font-medium">Koteswara Rao</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" /> Contact
                    </h3>
                    <p className="mb-1"><strong>Mobile / WhatsApp:</strong> +91 91828 97309</p>
                    <p><strong>Email:</strong> aksolargreenenergy@gmail.com</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-blue-800">
                    <strong>Note:</strong> All solar cost estimates shown on this website are indicative. Final system size and pricing will be confirmed after a site survey.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </Section>

        {/* CALCULATOR SECTION */}
        <Section id="calculator" className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-secondary mb-4">Calculate Your Cost</h2>
                <p className="text-muted-foreground">Enter your monthly electricity details to get a precise estimate.</p>
              </div>

              <Card className="border-none shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-5 bg-white">
                    <div className="md:col-span-2 bg-secondary p-8 text-white flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">Solar Estimator</h3>
                        <p className="text-blue-200 text-sm">Based on Telangana/AP state electricity averages.</p>
                      </div>
                      <div className="relative z-10 mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-sm text-blue-100">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Instant accurate quote</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-blue-100">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>ROI calculation included</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-blue-100">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>No obligation needed</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-3 p-8 md:p-10">
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">I want to enter my:</Label>
                          <RadioGroup 
                            defaultValue="bill" 
                            onValueChange={(val) => form.setValue("inputType", val as "bill" | "units")}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bill" id="bill" />
                              <Label htmlFor="bill" className="cursor-pointer font-normal">Monthly Bill (₹)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="units" id="units" />
                              <Label htmlFor="units" className="cursor-pointer font-normal">Monthly Units (kWh)</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="value" className="text-base font-semibold">
                            {form.watch("inputType") === "bill" ? "Average Monthly Bill Amount (₹)" : "Average Monthly Units (kWh)"}
                          </Label>
                          <Input 
                            id="value" 
                            type="number" 
                            placeholder={form.watch("inputType") === "bill" ? "e.g. 2500" : "e.g. 350"}
                            className="h-12 text-lg rounded-xl border-slate-300 focus:border-primary focus:ring-primary/20"
                            {...form.register("value")}
                          />
                          {form.formState.errors.value && (
                            <p className="text-red-500 text-sm mt-1">{form.formState.errors.value.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-base font-semibold">Location</Label>
                          <select 
                            id="location"
                            className="w-full h-12 px-3 rounded-xl border border-slate-300 bg-background text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            {...form.register("location")}
                          >
                            <option value="Telangana">Telangana</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                          </select>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={createCalculation.isPending}
                          className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          {createCalculation.isPending ? "Calculating..." : "Calculate Savings"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </Section>

        {/* RESULTS SECTION */}
        <AnimatePresence>
          {result && (
            <Section id="results" className="bg-white">
              <div className="max-w-5xl mx-auto">
                <FadeIn>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary">Your Solar Estimate</h2>
                    <p className="text-muted-foreground mt-2">Here is what a solar system looks like for your home.</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <Card className="bg-blue-50/50 border-blue-100">
                      <CardHeader className="pb-2">
                        <CardDescription className="font-medium text-blue-600">System Size</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl md:text-4xl font-bold text-secondary">{result.systemSizeKw} <span className="text-lg text-muted-foreground font-normal">kW</span></div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50/50 border-orange-100">
                      <CardHeader className="pb-2">
                        <CardDescription className="font-medium text-orange-600">Est. Cost</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl md:text-4xl font-bold text-secondary">₹{(result.estimatedCost / 100000).toFixed(2)} <span className="text-lg text-muted-foreground font-normal">Lakh</span></div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50/50 border-green-100">
                      <CardHeader className="pb-2">
                        <CardDescription className="font-medium text-green-600">Monthly Savings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl md:text-4xl font-bold text-secondary">₹{result.monthlySavings.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50/50 border-purple-100">
                      <CardHeader className="pb-2">
                        <CardDescription className="font-medium text-purple-600">Payback Period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl md:text-4xl font-bold text-secondary">{result.paybackPeriod} <span className="text-lg text-muted-foreground font-normal">Years</span></div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-secondary rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Start Saving?</h3>
                      <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        This is an estimate. Get a final, accurate quote and a free site survey from our solar experts.
                      </p>
                      <a 
                        href={getWhatsAppLink()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Get Quote on WhatsApp
                      </a>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </Section>
          )}
        </AnimatePresence>

        {/* DISCLAIMER SECTION */}
        <Section className="py-12 bg-slate-100 border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-sm text-muted-foreground space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-400" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Disclaimer</h4>
                <p>
                  The values shown are estimates based on standard assumptions for Telangana and Andhra Pradesh regions. 
                  Actual generation and cost may vary depending on roof orientation, shadow-free area, component selection (Panels/Inverter brands), and government subsidy policies. 
                  Calculations assume an average generation of 130 units per kW per month and an average electricity tariff of ₹7/unit.
                  Prices mentioned are indicative market rates for On-Grid Solar Systems.
                </p>
              </div>
            </div>
          </div>
        </Section>
      </main>

      {/* FOOTER */}
      <footer className="bg-secondary text-blue-200 py-12 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Sun className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-xl text-white">AK SOLAR</span>
          </div>
          <p className="text-sm">© 2026 AK SOLAR GREEN ENERGY. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
