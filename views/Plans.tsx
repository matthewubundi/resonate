
import React from 'react';
import PricingTable from '../components/PricingTable';

export const Plans: React.FC = () => {
    return (
        <div className="w-full mx-auto pb-20 animate-fade-in-up">
            <div className="mb-8 px-4 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Plans</h1>
                <p className="text-slate-500 text-lg">Choose the perfect plan for your identity needs.</p>
            </div>
            <PricingTable />
        </div>
    );
};
