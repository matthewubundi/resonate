import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Chip } from '../components/Components';
import { ArrowRight, Sparkles, History, Zap, Activity } from 'lucide-react';
import { MOCK_IDENTITY, MOCK_TRANSFORMATIONS } from '../constants';
import { PageView } from '../types';

export const Dashboard: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-ink">Welcome back, Admin.</h1>
           <p className="text-ink/60 font-medium">Identity <span className="font-mono text-xs bg-azure/10 border border-azure/20 px-2 py-0.5 rounded text-azure font-bold">{MOCK_IDENTITY.version}</span> is active and aligned.</p>
        </div>
        <Button onClick={() => onNavigate('transform')} size="lg" className="shadow-lg shadow-azure/10">
          <Sparkles className="mr-2 h-4 w-4" /> Initialize Transformation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Identity Snapshot */}
        <Card className="md:col-span-2 relative overflow-hidden border-none shadow-md bg-white">
          <div className="absolute top-0 right-0 p-3 opacity-5">
              <Activity size={100} className="text-ink" />
          </div>
          <CardHeader>
            <CardTitle>Identity Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-8">
              {MOCK_IDENTITY.tone.map(t => <Chip key={t} label={t} />)}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div>
                 <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">Core Values</h4>
                 <ul className="space-y-3">
                   {MOCK_IDENTITY.values.map(v => (
                     <li key={v} className="flex items-center text-sm font-semibold text-ink">
                       <span className="w-1.5 h-1.5 rounded-full bg-azure mr-3"></span> {v}
                     </li>
                   ))}
                 </ul>
               </div>
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">Alignment Score</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-azure">{MOCK_IDENTITY.alignmentScore}</span>
                    <span className="text-sm text-ink/60 font-medium mb-2">/ 100 avg</span>
                  </div>
                  <div className="w-full bg-paleslate border border-ink/5 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-azure h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Stats */}
        <Card className="bg-paleslate border-ink/5 shadow-md">
          <CardContent className="flex flex-col justify-between h-full relative overflow-hidden">
            <div className="relative z-10">
              <div className="h-10 w-10 bg-white border border-ink/5 rounded-lg flex items-center justify-center mb-4 text-azure shadow-sm">
                <Zap size={20} />
              </div>
              <h3 className="text-xl font-bold mb-1 text-ink">Quick Injection</h3>
              <p className="text-ink/60 text-sm font-medium">Paste text to instantly apply your active persona matrix.</p>
            </div>
            <div className="mt-8 relative z-10">
              <input 
                type="text" 
                placeholder="Paste generic text..." 
                className="w-full bg-white border border-ink/10 rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink/40 mb-3 focus:outline-none focus:ring-1 focus:ring-azure focus:border-azure"
              />
              <Button className="w-full">Execute</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-ink/5">
          <CardTitle>Transformation Log</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-azure hover:text-azure-hover">View All History</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-ink/5">
            {MOCK_TRANSFORMATIONS.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between hover:bg-paleslate transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-paleslate border border-ink/5 flex items-center justify-center text-ink/50 group-hover:bg-white group-hover:text-azure transition-colors">
                    <History size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink">{item.preview}</p>
                    <p className="text-xs text-ink/50 font-medium mt-0.5">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className={`block text-sm font-bold ${item.score > 9 ? 'text-azure' : 'text-highlight'}`}>{item.score}</span>
                    <span className="text-[10px] uppercase text-ink/40 font-bold tracking-wider">Alignment</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-ink/40 group-hover:text-ink"><ArrowRight size={16} /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};