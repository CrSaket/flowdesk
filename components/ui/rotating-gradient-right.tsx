"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function RotatingGradientRight() {
  return (
    <section className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white px-8 py-16 md:px-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* LEFT: Text */}
        <div className="relative mx-auto flex h-[40rem] w-full max-w-[60rem] items-center justify-center overflow-hidden rounded-3xl">
          {/* Rotating conic gradient glow */}
          <div className="absolute -inset-10 flex items-center justify-center">
            <div
              className="
                h-[120%] w-[120%] rounded-[36px] blur-3xl opacity-80
                bg-[conic-gradient(from_0deg,theme(colors.purple.400),theme(colors.purple.600),theme(colors.blue.900),theme(colors.purple.800),theme(colors.blue.800),theme(colors.purple.400))]
                animate-[spin_8s_linear_infinite]
              "
            />
          </div>

          {/* FlowDesk Dashboard Preview */}
          <Card className="w-[380px] z-10 rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center gap-2 h-10 px-4 border-b border-white/10 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-auto mr-auto text-xs text-zinc-400 font-mono">flowdesk.app</span>
            </div>
            
            <CardContent className="p-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Revenue', value: '$84.2K', delta: '+24%', color: 'text-green-400' },
                  { label: 'Burn', value: '$18.6K', delta: '-6%', color: 'text-blue-400' },
                  { label: 'Runway', value: '4.8 mo', delta: '+0.7', color: 'text-purple-400' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-3 bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm font-mono text-white mb-1">
                      {item.value}
                    </div>
                    <div className={`text-[10px] ${item.color}`}>
                      {item.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="rounded-xl p-3 bg-white/5 border border-white/10 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold text-white">Weekly Cash Flow</div>
                    <div className="text-[10px] text-zinc-400">Live from invoices & expenses</div>
                  </div>
                  <span className="text-[10px] text-green-400 px-2 py-1 rounded-full bg-green-400/10">
                    Healthy
                  </span>
                </div>
                
                {/* Mini Chart */}
                <div className="flex items-end gap-1 h-16">
                  {[34, 72, 48, 91, 63, 100, 56].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-sm"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[8px] text-zinc-500">W{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Rows */}
              <div className="space-y-2">
                {[
                  { label: 'Cash runway', value: '4.8 mo', color: 'text-green-400' },
                  { label: 'Invoices due', value: '7 open', color: 'text-yellow-400' },
                  { label: 'Team capacity', value: '82%', color: 'text-purple-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-zinc-300">{row.label}</span>
                    <span className={`text-xs font-mono ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">Dashboard loading...</span>
                  <span className="text-xs text-zinc-500">92%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-purple-400 via-blue-600 to-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Dashboard description */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-3xl font-normal text-gray-900 dark:text-white leading-relaxed">
            Modern Dashboard Design {" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-3xl">Experience an intuitive interface with clean aesthetics and seamless interactions. Built for efficiency, designed for clarity.</span>
          </h2>
          <Button variant="link" className="px-0 text-black dark:text-white">
            Explore Dashboard <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
