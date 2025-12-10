"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Check, Minus, Zap, Shield, Database, Activity } from "lucide-react";
import { Profile } from "../types";
import { useTranslations } from "next-intl";

export default function PricingTable() {
    const t = useTranslations('Pricing');
    const { user, session, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper to extract period from "50/mo" -> "/mo"
    const period = t('comparison.values.50mo').replace('50', '');

    const TIERS = [
        {
            id: "free",
            name: t('tiers.free.name'),
            price: "$0",
            period: period,
            description: t('tiers.free.description'),
            buttonText: t('startFreeTrial'),
            features: [
                t('tiers.free.features.transformations'),
                t('tiers.free.features.personas'),
                t('tiers.free.features.speed'),
            ],
            priceId: null,
        },
        {
            id: "pro",
            name: t('tiers.pro.name'),
            price: "$19.99",
            period: period,
            description: t('tiers.pro.description'),
            buttonText: t('getStarted'),
            highlight: true,
            features: [
                t('tiers.pro.features.transformations'),
                t('tiers.pro.features.personas'),
                t('tiers.pro.features.speed'),
                t('tiers.pro.features.memory'),
            ],
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
        },
        {
            id: "power",
            name: t('tiers.power.name'),
            price: "$49.99",
            period: period,
            description: t('tiers.power.description'),
            buttonText: t('getStarted'),
            features: [
                t('tiers.power.features.transformations'),
                t('tiers.power.features.personas'),
                t('tiers.power.features.analytics'),
                t('tiers.power.features.access'),
            ],
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_POWER,
        },
    ];

    const COMPARISON_FEATURES = [
        { name: t('comparison.features.transformations'), free: t('comparison.values.50mo'), pro: t('comparison.values.2000mo'), power: t('comparison.values.unlimited') },
        { name: t('comparison.features.personas'), free: "1", pro: "5", power: t('comparison.values.unlimited') },
        { name: t('comparison.features.aiModel'), free: t('comparison.values.gpt4omini'), pro: t('comparison.values.geminiFlash'), power: t('comparison.values.geminiFlash') },
        { name: t('comparison.features.longTermMemory'), free: false, pro: true, power: true },
        { name: t('comparison.features.analyticsDashboard'), free: false, pro: false, power: true },
        { name: t('comparison.features.prioritySupport'), free: false, pro: true, power: true },
        { name: t('comparison.features.apiAccess'), free: false, pro: false, power: true },
    ];

    useEffect(() => {
        if (authLoading) return; // Wait for auth
        if (user) {
            fetchProfile();
        } else {
            setProfileLoading(false); // No user, so loading done (default free)
        }
    }, [user, authLoading]);

    const fetchProfile = async () => {
        if (!user) return;
        setProfileLoading(true);
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
        setProfileLoading(false);
    };

    const handleCheckout = async (priceId: string) => {
        if (!user) return;
        setActionLoading(true);
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
            setActionLoading(false);
        }
    };

    const handlePortal = async () => {
        if (!user) return;
        setActionLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/billing/portal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create portal session");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            setError(err.message);
            setActionLoading(false);
        }
    };

    const currentTier = profile?.subscription_tier || "free";

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-ink mb-4 tracking-tight">{t('title')}</h2>
                <p className="text-ink/60 max-w-2xl mx-auto text-lg">
                    {t('subtitle')}
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
                    // If user has a paid plan (not free), any plan change should go through portal to avoid duplicates/errors
                    const isPaidUser = currentTier !== 'free';

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
                                        {t('popular')}
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
                                onClick={() => {
                                    if (isCurrent) return;
                                    if (isPaidUser) {
                                        handlePortal();
                                    } else if (tier.priceId) {
                                        handleCheckout(tier.priceId);
                                    }
                                }}
                                disabled={isCurrent || actionLoading || authLoading || profileLoading || (!tier.priceId && !isPaidUser && tier.id !== 'free')} // Allow 'free' button click if isPaidUser (to downgrade)
                                className={`
                                    w-full py-3 px-6 rounded-lg font-bold text-sm transition-all duration-200
                                    ${isCurrent
                                        ? "bg-slate-100 text-slate-500 cursor-default border border-slate-200"
                                        : isPro
                                            ? "bg-azure text-white hover:bg-azure/90 shadow-md hover:shadow-lg"
                                            : "bg-white border-2 border-ink/10 text-ink hover:border-ink/30 hover:bg-slate-50"
                                    }
                                    ${(actionLoading || authLoading || profileLoading) ? "opacity-70 cursor-wait" : ""}
                                `}
                            >
                                {isCurrent
                                    ? t('currentPlan')
                                    : (authLoading || profileLoading)
                                        ? "..."
                                        : tier.id === "free"
                                            ? t('downgrade')
                                            : isPaidUser ? t('switchPlan') : tier.buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Feature Comparison Table */}
            <div className="hidden md:block">
                {/* Header Row */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-ink/10">
                    <h3 className="text-xl font-bold text-ink">{t('compareFeatures')}</h3>
                    <div className="text-center text-sm font-semibold text-ink/70">{t('tiers.free.name')}</div>
                    <div className="text-center text-sm font-bold text-azure">{t('tiers.pro.name')}</div>
                    <div className="text-center text-sm font-semibold text-ink/70">{t('tiers.power.name')}</div>
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
                <h3 className="text-lg font-bold text-ink mb-4">{t('featureHighlights')}</h3>
                {COMPARISON_FEATURES.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-ink/5">
                        <span className="text-sm font-medium text-ink/70">{feature.name}</span>
                        <span className="text-sm font-semibold text-azure">
                            {typeof feature.pro === 'boolean'
                                ? (feature.pro ? t('yes') : t('no'))
                                : feature.pro}
                        </span>
                    </div>
                ))}
            </div>

        </div>
    );
}
