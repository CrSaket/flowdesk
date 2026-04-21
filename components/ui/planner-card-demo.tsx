import { RoutePlannerCard } from "@/components/ui/planner-card";
import { TrendingUp } from "lucide-react";

export default function RoutePlannerCardDemo() {
  const sampleElevationData = Array.from({ length: 50 }, () => Math.random() * 80 + 20);

  const handleStart = () => {
    console.log("Business analysis started!");
  };

  return (
    <div className="relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-2xl">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/5"></div>
      <div className="relative">
        <RoutePlannerCard
          alertMessage="Market volatility detected in 15 min."
          durationInMinutes={28}
          distance={8.4}
          climb={425}
          elevationData={sampleElevationData}
          routeFeature={{
            icon: <TrendingUp className="h-5 w-5" />,
            text: "Business growth trajectory",
          }}
          onStart={handleStart}
          className="border-0 shadow-none bg-transparent"
        />
      </div>
    </div>
  );
}
