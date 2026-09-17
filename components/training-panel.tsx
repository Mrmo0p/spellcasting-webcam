import {
  Camera,
  Flame,
  HeartPulse,
  RotateCcw,
  Shield,
  Snowflake,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localizeTree } from '@/lib/localize-tree';
import type { Locale } from '@/lib/i18n';
import { runeById } from '@/lib/game/runes';
import {
  TRAINING_ATTACKS,
  type TrainingAttackId,
  type TrainingState,
} from '@/lib/game/training';

export function TrainingPanel({
  locale,
  state,
  onAttack,
  onDamage,
  onBurn,
  onReset,
  cameraReady,
  onEnableCamera,
}: {
  locale: Locale;
  state: TrainingState;
  onAttack: (id: TrainingAttackId) => void;
  onDamage: () => void;
  onBurn: () => void;
  onReset: () => void;
  cameraReady: boolean;
  onEnableCamera: () => void;
}) {
  const incoming = state.incoming ? TRAINING_ATTACKS[state.incoming.id] : null;
  return localizeTree(
    <div className="training-panel" lang={locale}>
      <div className="health-display training-health">
        <div>
          <span>
            YOU {state.shield && <Shield size={13} />} <b>{state.player}</b>
          </span>
          <meter
            value={state.player}
            min="0"
            max="100"
            aria-label="Player health"
          />
        </div>
        <div>
          <span>
            TRAINING DUMMY <b>{state.dummy}</b>
          </span>
          <meter
            className="enemy-health"
            value={state.dummy}
            min="0"
            max="100"
            aria-label="Training dummy health"
          />
        </div>
      </div>

      <div
        className={
          'training-dummy' +
          (state.dummyBurn ? ' burning' : '') +
          (state.stunned > 0 ? ' stunned' : '')
        }
        aria-hidden="true"
      >
        <div className="dummy-stars">✦ ✧ ✦</div>
        <div className="dummy-head" />
        <div className="dummy-body">
          <Sparkles />
        </div>
        <div className="dummy-base" />
      </div>

      <div className="attack-prompt training-prompt">
        <p className="eyebrow">
          {incoming
            ? 'INCOMING TRAINING ATTACK'
            : state.stunned > 0
              ? 'DUMMY STUNNED'
              : 'FREE CASTING'}
        </p>
        <h2>
          {incoming
            ? incoming.name
            : state.stunned > 0
              ? 'Star stun active'
              : 'Draw any rune'}
        </h2>
        {state.incoming && (
          <>
            <strong>
              {(state.incoming.remaining / 1000).toFixed(1)}
              <small>s</small>
            </strong>
            <p>
              Try {runeById(TRAINING_ATTACKS[state.incoming.id].counter).name}
            </p>
          </>
        )}
        {!state.incoming && state.stunned > 0 && (
          <strong>
            {(state.stunned / 1000).toFixed(1)}
            <small>s</small>
          </strong>
        )}
      </div>

      <output className="training-status" aria-live="polite">
        <span className={state.playerBurn ? 'on-fire' : ''}>
          {state.playerBurn ? 'You are burning — draw Water.' : 'You: safe'}
        </span>
        <span className={state.dummyBurn ? 'on-fire' : ''}>
          {state.dummyBurn ? 'Dummy burning' : 'Dummy: ready'}
        </span>
        <span>
          {state.casts} casts · {state.counters} counters
        </span>
      </output>

      <div className="training-controls" aria-label="Training drills">
        {!cameraReady && (
          <Button className="training-camera" onClick={onEnableCamera}>
            <Camera /> Enable camera to cast
          </Button>
        )}
        <Button variant="outline" onClick={() => onAttack('ember')}>
          <Shield /> Ward drill
        </Button>
        <Button variant="outline" onClick={() => onAttack('nova')}>
          <Sparkles /> Dispel drill
        </Button>
        <Button variant="outline" onClick={() => onAttack('lance')}>
          <Snowflake /> Frost drill
        </Button>
        <Button variant="outline" onClick={onDamage}>
          <HeartPulse /> Mend drill
        </Button>
        <Button variant="outline" onClick={onBurn}>
          <Flame /> Water drill
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw /> Reset
        </Button>
      </div>
    </div>,
    locale,
  );
}
