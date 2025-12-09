"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Check, Minus, Zap, Shield, Database, Activity } from "lucide-react";
import { Profile } from "../types";

const TIERS = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        period: "/mo",
        description: "The Hook",
        buttonText: "Start free trial",
        features: [
            "50 transformations",
            "1 persona",
            "Standard speed (GPT-4o-mini)",
        ],
        priceId: null,
    },
    {
        id: "pro",
        name: "Pro",
        price: "$19.99",
        period: "/mo",
        description: "Daily Driver",
        buttonText: "Get started",
        highlight: true,
        features: [
            "2,000 transformations",
            "5 personas",
            "High speed (Gemini 2.5 Flash)",
            "Memory",
        ],
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    },
    {
        id: "power",
        name: "Power",
        price: "$49.99",
        period: "/mo",
        description: "The Scaler",
        buttonText: "Get started",
        features: [
            "Unlimited transformations",
            "Unlimited personas",
            "Analytics",
            "Gemini 2.5 Flash Access",
        ],
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POWER,
    },
];

const COMPARISON_FEATURES = [
    { name: "Transformations", free: "50/mo", pro: "2,000/mo", power: "Unlimited" },
    { name: "Personas", free: "1", pro: "5", power: "Unlimited" },
    { name: "AI Model", free: "GPT-4o-mini", pro: "Gemini 2.5 Flash", power: "Gemini 2.5 Flash" },
    { name: "Long-term Memory", free: false, pro: true, power: true },
    { name: "Analytics Dashboard", free: false, pro: false, power: true },
    { name: "Priority Support", free: false, pro: true, power: true },
    { name: "API Access", free: false, pro: false, power: true },
];

export default function PricingTable() {
    const { user, session } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
        } else {
            setProfile(data);
        }
    };

    const handleCheckout = async (priceId: string) => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const currentTier = profile?.subscription_tier || "free";

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-ink mb-4 tracking-tight">Choose a plan that’s right for you</h2>
                <p className="text-ink/60 max-w-2xl mx-auto text-lg">
                    Scale your identity preservation capabilities as you grow. Switch plans or cancel any time.
                </p>
                {error && (
                    <div className="mt-6 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 inline-block">
                        {error}
                    </div>
                )}
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
                {TIERS.map((tier) => {
                    const isCurrent = currentTier === tier.id;
                    const isPro = tier.id === "pro";

                    return (
                        <div
                            key={tier.id}
                            className={`
                                relative flex flex-col p-8 rounded-2xl transition-all duration-300
                                bg-paper
                                ${isPro
                                    ? "border-2 border-azure shadow-xl bg-azure/5"
                                    : "border border-ink/10 hover:border-azure/30 hover:shadow-lg"
                                }
                            `}
                        >
                            {isPro && (
                                <div className="absolute top-0 right-0 -mt-3 -mr-3">
                                    <span className="bg-azure text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                                        Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-ink mb-2">{tier.name}</h3>
                                <p className="text-sm text-ink/60 h-10">{tier.description}</p>
                            </div>

                            <div className="flex items-baseline mb-8">
                                <span className="text-5xl font-bold text-ink tracking-tight">{tier.price}</span>
                                <span className="text-ink/50 ml-2 font-medium">{tier.period}</span>
                            </div>

                            <button
                                onClick={() => tier.priceId && !isCurrent ? handleCheckout(tier.priceId) : undefined}
                                disabled={isCurrent || (tier.id !== 'free' && loading) || (!tier.priceId && tier.id !== 'free')}
                                className={`
                                    w-full py-3 px-6 rounded-lg font-bold text-sm transition-all duration-200
                                    ${isCurrent
                                        ? "bg-slate-100 text-slate-500 cursor-default border border-slate-200"
                                        : isPro
                                            ? "bg-azure text-white hover:bg-azure/90 shadow-md hover:shadow-lg"
                                            : "bg-white border-2 border-ink/10 text-ink hover:border-ink/30 hover:bg-slate-50"
                                    }
                                    ${loading ? "opacity-70 cursor-wait" : ""}
                                `}
                            >
                                {isCurrent
                                    ? "Current Plan"
                                    : tier.id === "free"
                                        ? "Downgrade"
                                        : tier.buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Feature Comparison Table */}
            <div className="hidden md:block">
                {/* Header Row */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-ink/10">
                    <h3 className="text-xl font-bold text-ink">Compare features</h3>
                    <div className="text-center text-sm font-semibold text-ink/70">Free</div>
                    <div className="text-center text-sm font-bold text-azure">Pro</div>
                    <div className="text-center text-sm font-semibold text-ink/70">Power</div>
                </div>

                {/* Feature Rows */}
                <div className="divide-y divide-ink/5">
                    {COMPARISON_FEATURES.map((feature, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center py-5 px-6 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {i < 3 ? (
                                    <Activity size={18} className="text-ink/40" />
                                ) : i < 5 ? (
                                    <Database size={18} className="text-ink/40" />
                                ) : (
                                    <Shield size={18} className="text-ink/40" />
                                )}
                                <span className="text-sm font-medium text-ink">{feature.name}</span>
                            </div>

                            <div className="text-center text-sm text-ink/70 flex justify-center">
                                {typeof feature.free === 'boolean' ? (
                                    feature.free ? <Check size={20} className="text-emerald-500" /> : <Minus size={20} className="text-slate-300" />
                                ) : (
                                    <span>{feature.free}</span>
                                )}
                            </div>
                            <div className="text-center text-sm font-semibold text-ink flex justify-center">
                                {typeof feature.pro === 'boolean' ? (
                                    feature.pro ? <Check size={20} className="text-emerald-500" /> : <Minus size={20} className="text-slate-300" />
                                ) : (
                                    <span>{feature.pro}</span>
                                )}
                            </div>
                            <div className="text-center text-sm text-ink/70 flex justify-center">
                                {typeof feature.power === 'boolean' ? (
                                    feature.power ? <Check size={20} className="text-emerald-500" /> : <Minus size={20} className="text-slate-300" />
                                ) : (
                                    <span>{feature.power}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile View for Comparison (Simplified) */}
            <div className="md:hidden space-y-4 mt-8">
                <h3 className="text-lg font-bold text-ink mb-4">Feature Highlights</h3>
                {COMPARISON_FEATURES.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-ink/5">
                        <span className="text-sm font-medium text-ink/70">{feature.name}</span>
                        <span className="text-sm font-semibold text-azure">
                            {typeof feature.pro === 'boolean'
                                ? (feature.pro ? 'Yes' : 'No')
                                : feature.pro}
                        </span>
                    </div>
                ))}
            </div>

        </div>
    );
}
