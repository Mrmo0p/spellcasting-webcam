import type {DuelStats} from '@/lib/game/combat';
import type {Locale} from '@/lib/i18n';
import {localizeTree} from '@/lib/localize-tree';
export function DuelSummary({stats,locale}:{stats?:DuelStats;locale:Locale}){
 if(!stats)return null;
 return localizeTree(<section className="duel-summary" aria-label="Duel summary"><dl>{[
  ['Burn damage dealt',stats.burnDealt],['Burn damage taken',stats.burnTaken],
  ['Your extinguishes',stats.waterCasts],['Opponent extinguishes',stats.opponentWaterCasts],
 ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><small>Burn damage excludes the initial fire hit.</small></section>,locale);
}
