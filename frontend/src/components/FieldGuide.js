import React from "react";
import { BookOpen, Camera, Check, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

export const FieldGuide = () => {
  const guideItems = [
    {
      name: "Aphids",
      latin: "Aphis gossypii",
      color: "border-amber-500/40 bg-amber-950/20",
      textColor: "text-amber-300",
      symptoms: "Leaves curl downward, yellowing, sticky honeydew accumulation, black soot mold on leaf surface.",
      action: "Spray neem oil (2%) or insecticidal soaps. If threshold exceeds 20 aphids/leaf, apply Imidacloprid 17.8 SL."
    },
    {
      name: "Army Worm",
      latin: "Spodoptera frugiperda / exigua",
      color: "border-red-500/40 bg-red-950/20",
      textColor: "text-red-300",
      symptoms: "Irregular chewed holes in leaf blades, skeletonized leaves, larval frass visible on lower canopy.",
      action: "Deploy pheromone traps. Spray Emamectin benzoate 5% SG or Bacillus thuringiensis (Bt) formulation."
    },
    {
      name: "Bacterial Blight",
      latin: "Xanthomonas citri pv. malvacearum",
      color: "border-orange-500/40 bg-orange-950/20",
      textColor: "text-orange-300",
      symptoms: "Angular water-soaked leaf spots turning dark brown/black, vein browning ('black arm' symptom).",
      action: "Use disease-free certified seed. Apply Copper Oxychloride 50 WP (2.5 g/L) mixed with Streptocycline."
    },
    {
      name: "Healthy Leaf",
      latin: "Gossypium hirsutum L.",
      color: "border-emerald-500/40 bg-emerald-950/20",
      textColor: "text-emerald-300",
      symptoms: "Uniform dark green color, clear palmate venation, robust leaf thickness, zero spots or insect damage.",
      action: "Maintain balanced nitrogen/potassium fertilization and regular field scouting twice a week."
    },
    {
      name: "Powdery Mildew",
      latin: "Leveillula taurica",
      color: "border-purple-500/40 bg-purple-950/20",
      textColor: "text-purple-300",
      symptoms: "White to grayish powdery coating on the lower leaf surface with chlorotic yellow patches above.",
      action: "Dust wettable sulfur (3 g/L) or spray Difenoconazole 25 EC at first sign of white patches."
    },
    {
      name: "Target Spot",
      latin: "Corynespora cassiicola",
      color: "border-rose-500/40 bg-rose-950/20",
      textColor: "text-rose-300",
      symptoms: "Circular reddish-brown lesions with distinct concentric target-like rings causing early defoliation.",
      action: "Avoid dense planting; spray Azoxystrobin + Difenoconazole during early canopy closure."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center space-x-2">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <span>Cotton Plant Field Identification Guide</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Reference diagnostic guide for key cotton foliar diseases, pest infestations, and photography best practices.
        </p>
      </div>

      {/* Photography Instructions */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-800/30 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <span>Best Photography Practices for Open-Set AI Accuracy</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>1. Clear Single-Leaf Focus</span>
            </div>
            <p className="text-slate-300">
              Fill the frame with a single affected cotton leaf. Ensure sharp focus on disease lesions or pest feeding damage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>2. Natural Even Daylight</span>
            </div>
            <p className="text-slate-300">
              Avoid deep shadows or bright direct glare. Diffused daylight reveals subtle spot colors and texture patterns accurately.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2">
            <div className="font-bold text-amber-300 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>3. Open-Set Gate Protection</span>
            </div>
            <p className="text-slate-300">
              Non-plant objects (soil, boots, machinery) or extreme blur will trigger the Plant Gate and be rejected as "Unclassified".
            </p>
          </div>
        </div>
      </div>

      {/* Disease Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guideItems.map((item, idx) => (
          <div
            key={idx}
            className={`glass-panel rounded-2xl p-6 border ${item.color} space-y-3 transition-all hover:scale-[1.01]`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`text-xl font-bold ${item.textColor}`}>{item.name}</h4>
                <div className="text-xs italic text-slate-400">{item.latin}</div>
              </div>
              <Sparkles className={`w-5 h-5 ${item.textColor}`} />
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-300">Key Visual Symptoms: </span>
                <span className="text-slate-400">{item.symptoms}</span>
              </div>
              <div>
                <span className="font-bold text-emerald-400">Management Action: </span>
                <span className="text-emerald-200/90">{item.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ / Info Footer */}
      <div className="glass-card rounded-xl p-4 text-xs text-slate-400 border border-emerald-900/30 flex items-center space-x-3">
        <HelpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p>
          Note: CottonGuard AI open-set robust pipeline continuously monitors model uncertainty. If you observe unknown leaf symptoms not listed here, submit samples to your local agricultural extension service.
        </p>
      </div>

    </div>
  );
};
