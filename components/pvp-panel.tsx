'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Copy,
  LogOut,
  RotateCcw,
  Swords,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localizeTree } from '@/lib/localize-tree';
import type { Locale } from '@/lib/i18n';
import { RUNES, runeById } from '@/lib/game/runes';
import { otherSlot } from '@/lib/pvp/engine';
import type { PvpController } from '@/hooks/use-pvp';
import { PvpArena } from '@/components/pvp-arena';
import type { RuneId } from '@/lib/game/types';

function RuneMark({ id }: { id: 'fireball' | 'lightning' }) {
  const rune = runeById(id);
  return (
    <svg
      viewBox="0 0 100 100"
      className="rune-icon"
      aria-hidden="true"
      style={{ color: rune.color }}
    >
      <polyline
        points={rune.points.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function PvpPanel({
  locale,
  pvp,
  cameraReady,
  tracked,
  onEnableCamera,
  onCooldownReady,
}: {
  locale: Locale;
  pvp: PvpController;
  cameraReady: boolean;
  tracked: boolean;
  onEnableCamera: () => void;
  onCooldownReady: (rune: RuneId) => void;
}) {
  const [name, setName] = useState(''),
    [code, setCode] = useState(''),
    [busy, setBusy] = useState(false),
    [formError, setFormError] = useState(''),
    [now, setNow] = useState(0);
  const previousCooldowns = useRef<Set<RuneId> | null>(null);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = localStorage.getItem('spellbound.pvp.name.v1');
        if (saved) setName(saved);
        const query = new URLSearchParams(location.search).get('room');
        if (query) setCode(query.toUpperCase());
      } catch {}
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);
  const serverNow = now + pvp.clockOffset,
    state = pvp.state,
    me = state && pvp.slot ? state.players[pvp.slot] : null,
    opponent = state && pvp.slot ? state.players[otherSlot(pvp.slot)] : null;
  const meStun = Math.max(0, (me?.stunnedUntil || 0) - serverNow),
    opponentStun = Math.max(0, (opponent?.stunnedUntil || 0) - serverNow),
    globalRemaining = Math.max(0, (me?.globalCooldownUntil || 0) - serverNow);
  useEffect(() => {
    if (!me || state?.status !== 'active') {
      previousCooldowns.current = null;
      return;
    }
    const current = new Set(
      RUNES.filter((rune) => (me.cooldowns[rune.id] || 0) > serverNow).map(
        (rune) => rune.id,
      ),
    );
    if (previousCooldowns.current)
      for (const rune of previousCooldowns.current)
        if (!current.has(rune)) onCooldownReady(rune);
    previousCooldowns.current = current;
  }, [me, onCooldownReady, serverNow, state?.status]);
  const incoming = useMemo(
    () =>
      state && pvp.slot
        ? state.incoming
            .filter((spell) => spell.to === pvp.slot)
            .sort((a, b) => a.landsAt - b.landsAt || a.id - b.id)
        : [],
    [state, pvp.slot],
  );
  const submit = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setFormError('');
    try {
      const clean = name.trim();
      if (clean.length < 1 || clean.length > 24)
        throw new Error('Enter a name between 1 and 24 characters.');
      localStorage.setItem('spellbound.pvp.name.v1', clean);
      await action();
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const copyRoom = async () => {
    const link = new URL(location.href);
    link.searchParams.set('room', pvp.roomCode);
    try {
      await navigator.clipboard.writeText(link.toString());
      setFormError('Invite link copied.');
    } catch {
      setFormError(`Room code: ${pvp.roomCode}`);
    }
  };
  if (!pvp.roomCode)
    return localizeTree(
      <div className="arena-center pvp-lobby">
        <div className="rune-halo">
          <Swords />
        </div>
        <p className="eyebrow">PRIVATE ONLINE DUEL</p>
        <h2>Challenge another spellcaster.</h2>
        <p>
          Use a guest name, then create a room or join with a six-character
          code.
        </p>
        <label>
          Guest name
          <input
            maxLength={24}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label>
          Room code
          <input
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(
                event.target.value
                  .toUpperCase()
                  .replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, ''),
              )
            }
            placeholder="ABC234"
            autoCapitalize="characters"
          />
        </label>
        <div className="row">
          <Button
            className="primary-action"
            disabled={busy}
            onClick={() => void submit(() => pvp.createRoom(name.trim()))}
          >
            Create room
          </Button>
          <Button
            variant="outline"
            disabled={busy || code.length !== 6}
            onClick={() => void submit(() => pvp.joinRoom(code, name.trim()))}
          >
            Join room
          </Button>
        </div>
        {(formError || pvp.error) && (
          <p
            role="alert"
            className={
              formError === 'Invite link copied.' ? 'success' : 'error'
            }
          >
            {formError || pvp.error}
          </p>
        )}
        <small>
          Camera frames and hand landmarks stay on your device. During an active
          duel, normalized rune coordinates are shared temporarily with your
          opponent.
        </small>
      </div>,
      locale,
    );
  if (!state || !me)
    return localizeTree(
      <div className="arena-center pvp-lobby">
        <Wifi />
        <p className="eyebrow">ROOM {pvp.roomCode}</p>
        <h2>Connecting to the duel…</h2>
        <p>{pvp.error || 'Opening a secure match connection.'}</p>
        <Button variant="outline" onClick={pvp.leave}>
          <LogOut /> Leave room
        </Button>
      </div>,
      locale,
    );
  if (state.status === 'waiting')
    return localizeTree(
      <div className="arena-center pvp-lobby">
        <p className="eyebrow">ROOM {state.code}</p>
        <h2>
          {opponent
            ? 'Both spellcasters are here.'
            : 'Waiting for an opponent…'}
        </h2>
        <div className="room-code">
          <strong>{state.code}</strong>
          <Button variant="outline" onClick={() => void copyRoom()}>
            <Copy /> Copy invite
          </Button>
        </div>
        <ul className="player-list">
          <li>
            <span>{me.name} (you)</span>
            <b>{me.ready ? 'Ready' : 'Not ready'}</b>
          </li>
          {opponent && (
            <li>
              <span>{opponent.name}</span>
              <b>{opponent.ready ? 'Ready' : 'Not ready'}</b>
            </li>
          )}
        </ul>
        {!cameraReady ? (
          <Button className="primary-action" onClick={onEnableCamera}>
            <Camera /> Enable camera
          </Button>
        ) : (
          <Button
            className="primary-action"
            disabled={!tracked || me.ready || pvp.connection !== 'open'}
            onClick={pvp.ready}
          >
            {me.ready
              ? 'Ready — waiting'
              : tracked
                ? 'Ready to duel'
                : 'Show your hand to ready'}
          </Button>
        )}
        <div className="row">
          <span className="connection-label">
            {pvp.connection === 'open' ? <Wifi /> : <WifiOff />}
            {pvp.connection}
          </span>
          <Button variant="outline" onClick={pvp.leave}>
            <LogOut /> Leave
          </Button>
        </div>
        {(formError || pvp.error) && (
          <p
            role="alert"
            className={
              formError === 'Invite link copied.' ? 'success' : 'error'
            }
          >
            {formError || pvp.error}
          </p>
        )}
      </div>,
      locale,
    );
  if (state.status === 'countdown')
    return localizeTree(
      <div className="arena-center pvp-countdown">
        <p className="eyebrow">DUEL BEGINS IN</p>
        <strong>
          {Math.max(
            1,
            Math.ceil(
              ((state.countdownEndsAt || serverNow) - serverNow) / 1000,
            ),
          )}
        </strong>
        <h2>
          {me.name} vs {opponent?.name}
        </h2>
        <p>Curl your index finger to prepare.</p>
      </div>,
      locale,
    );
  if (state.status === 'paused')
    return localizeTree(
      <div className="arena-overlay">
        <WifiOff />
        <p className="eyebrow">CONNECTION PAUSED</p>
        <h2>Waiting for a spellcaster to reconnect.</h2>
        <p>
          {Math.max(
            0,
            Math.ceil(
              ((state.disconnectDeadline || serverNow) - serverNow) / 1000,
            ),
          )}{' '}
          seconds remaining
        </p>
        <Button variant="outline" onClick={pvp.leave}>
          <LogOut /> Leave match
        </Button>
      </div>,
      locale,
    );
  if (state.status === 'finished') {
    const title =
      state.outcome === 'draw'
        ? 'The duel is a draw.'
        : state.outcome === pvp.slot
          ? 'Victory is yours.'
          : `${opponent?.name || 'Your opponent'} wins.`;
    return localizeTree(
      <div className="arena-overlay">
        <Swords />
        <p className="eyebrow">PVP DUEL COMPLETE</p>
        <h2>{title}</h2>
        <p>
          {me.rematch
            ? 'Rematch requested. Waiting for your opponent.'
            : 'Both players must request a rematch.'}
        </p>
        <div className="row">
          <Button
            className="primary-action"
            disabled={me.rematch}
            onClick={pvp.rematch}
          >
            <RotateCcw /> {me.rematch ? 'Rematch requested' : 'Request rematch'}
          </Button>
          <Button variant="outline" onClick={pvp.leave}>
            <LogOut /> Leave room
          </Button>
        </div>
      </div>,
      locale,
    );
  }
  const soonest = incoming[0];
  return localizeTree(
    <>
      <PvpArena
        state={state}
        slot={pvp.slot!}
        clockOffset={pvp.clockOffset}
        trail={pvp.remoteTrail}
        events={pvp.events}
      />
      <div className="health-display pvp-health">
        <div>
          <span>
            YOU {me.shield && '◯'} <b>{me.health}</b>
          </span>
          <meter value={me.health} min="0" max="100" aria-label="Your health" />
        </div>
        <div>
          <span>
            {opponent?.name || 'OPPONENT'} <b>{opponent?.health || 0}</b>
          </span>
          <meter
            className="enemy-health"
            value={opponent?.health || 0}
            min="0"
            max="100"
            aria-label="Opponent health"
          />
        </div>
      </div>
      <div className="burn-status">
        <span className={me.burning ? 'on-fire' : ''}>
          {me.burning ? 'You are burning — cast Water.' : 'You: not burning'}
        </span>
        <span className={opponent?.burning ? 'on-fire' : ''}>
          {opponent?.burning ? 'Opponent is burning' : 'Opponent: not burning'}
        </span>
      </div>
      {(meStun > 0 || opponentStun > 0) && (
        <div className="stun-status">
          {meStun > 0 && (
            <span>You are stunned — {(meStun / 1000).toFixed(1)}s</span>
          )}
          {opponentStun > 0 && (
            <span>Opponent stunned — {(opponentStun / 1000).toFixed(1)}s</span>
          )}
        </div>
      )}
      {soonest ? (
        <div className="attack-prompt pvp-incoming">
          <p className="eyebrow">INCOMING SPELL</p>
          <RuneMark id={soonest.rune} />
          <h2>{runeById(soonest.rune).name}</h2>
          <strong>
            {Math.max(0, (soonest.landsAt - serverNow) / 1000).toFixed(1)}
            <small>s</small>
          </strong>
          <p>Cast Ward, Frost, or Dispel.</p>
        </div>
      ) : (
        <div className="arena-center pvp-cast-prompt">
          <Swords />
          <p className="eyebrow">
            {meStun > 0 ? 'YOU ARE STUNNED' : 'REAL-TIME DUEL'}
          </p>
          <h2>
            {meStun > 0
              ? 'Casting is disabled briefly.'
              : 'Draw a rune to cast.'}
          </h2>
          <p>
            {meStun > 0
              ? 'Wait for the stun to end.'
              : 'Attacks give your opponent four seconds to counter.'}
          </p>
        </div>
      )}
      <div className="pvp-cooldowns" aria-label="PvP spell cooldowns">
        {RUNES.map((rune) => {
          const remaining = Math.max(
            0,
            (me.cooldowns[rune.id] || 0) - serverNow,
          );
          return (
            <span
              key={rune.id}
              className={
                remaining
                  ? remaining <= 3000
                    ? 'cooling nearly-ready'
                    : 'cooling'
                  : 'ready'
              }
            >
              <b>{rune.name}</b>
              <em>
                {remaining ? (remaining / 1000).toFixed(1) + 's' : 'Ready'}
              </em>
            </span>
          );
        })}
      </div>
      {globalRemaining > 0 && (
        <output className="pvp-global-cooldown">
          Wand recovery {(globalRemaining / 1000).toFixed(1)}s
        </output>
      )}
      {!cameraReady && (
        <div className="pvp-camera-warning">
          <span>Camera is off. The duel continues.</span>
          <Button variant="outline" onClick={onEnableCamera}>
            <Camera /> Enable camera
          </Button>
        </div>
      )}
      <div className="pvp-connection">
        <span className="connection-label">
          {pvp.connection === 'open' ? <Wifi /> : <WifiOff />}match{' '}
          {pvp.connection}
        </span>
        <span className="connection-label">
          {pvp.trailConnection === 'open' ? <Wifi /> : <WifiOff />}runes{' '}
          {pvp.trailConnection}
        </span>
        <Button variant="outline" onClick={pvp.leave}>
          <LogOut /> Leave match
        </Button>
      </div>
      {pvp.events.length > 0 && (
        <ol className="pvp-mini-log">
          {pvp.events.slice(-3).map((event) => (
            <li key={event.id}>{event.text}</li>
          ))}
        </ol>
      )}
      {pvp.error && (
        <p role="alert" className="pvp-error error">
          {pvp.error}
        </p>
      )}
    </>,
    locale,
  );
}
