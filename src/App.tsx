import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Wifi, WifiOff, X } from 'lucide-react';
import { AuroraCanvas } from './components/AuroraCanvas';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { CategoryStage } from './components/CategoryStage';
import { BluffStage } from './components/BluffStage';
import { VoteStage } from './components/VoteStage';
import { RevealStage } from './components/RevealStage';
import { GameOverScreen } from './components/GameOverScreen';
import { ReactionOverlay } from './components/ReactionOverlay';
import { RulesModal } from './components/RulesModal';
import { callGameApi, clearSession, loadSession, pollRoomState } from './lib/api';
import { GameActionPayload, GambitType, Player, RoomState, WagerMultiplier } from './lib/types';
import { sfx } from './lib/sound';

function getInitialRoomCode(): string {
  if (typeof window === 'undefined') return '';
  return (new URLSearchParams(window.location.search).get('room') || '').trim().toUpperCase();
}

export default function App() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [initialRoomCode, setInitialRoomCode] = useState(getInitialRoomCode);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [connected, setConnected] = useState(true);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const pollBusyRef = useRef(false);
  const autoAdvanceKeyRef = useRef('');

  const currentPlayer = useMemo<Player | null>(
    () => room?.players.find((player) => player.id === playerId) || null,
    [room, playerId]
  );

  const applyRoom = useCallback((nextRoom: RoomState) => {
    setRoom((current) => {
      if (current && current.code === nextRoom.code && current.version > nextRoom.version) {
        return current;
      }
      return nextRoom;
    });
    setLastSyncAt(Date.now());
    setConnected(true);
  }, []);

  const updateLocationForRoom = useCallback((code: string | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (code) url.searchParams.set('room', code);
    else url.searchParams.delete('room');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const performAction = useCallback(
    async (payload: GameActionPayload, opts: { quiet?: boolean; busy?: boolean } = {}) => {
      if (opts.busy !== false) setLoading(true);
      if (!opts.quiet) setError(null);
      try {
        const result = await callGameApi(payload);
        applyRoom(result.room);
        if (result.playerId) setPlayerId(result.playerId);
        setRoomCode(result.room.code);
        if (!opts.quiet) setError(null);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        if (!opts.quiet) setError(message);
        setConnected(false);
        return null;
      } finally {
        if (opts.busy !== false) setLoading(false);
      }
    },
    [applyRoom]
  );

  // Restore a previously joined device by secure local session, not by room code alone.
  useEffect(() => {
    const code = getInitialRoomCode();
    setInitialRoomCode(code);
    if (!code) return;
    const session = loadSession(code);
    if (!session) return;

    let cancelled = false;
    setBooting(true);
    setRoomCode(code);
    setPlayerId(session.playerId);
    callGameApi({ action: 'get_room', code, playerId: session.playerId, sessionToken: session.sessionToken })
      .then((result) => {
        if (cancelled) return;
        applyRoom(result.room);
        setRoomCode(result.room.code);
        setPlayerId(result.playerId || session.playerId);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not restore your player session.');
        clearSession(code);
        setPlayerId(null);
        setRoom(null);
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyRoom]);

  // Cross-device shared-room polling. A version guard prevents older responses from rolling state back.
  useEffect(() => {
    if (!roomCode || !playerId) return;
    let cancelled = false;

    const poll = async () => {
      if (cancelled || pollBusyRef.current) return;
      pollBusyRef.current = true;
      try {
        const nextRoom = await pollRoomState(roomCode);
        if (!cancelled) applyRoom(nextRoom);
      } catch (err) {
        if (!cancelled) {
          setConnected(false);
          const message = err instanceof Error ? err.message : '';
          if (message.includes('session expired') || message.includes('no longer in this room')) {
            setError(message);
          }
        }
      } finally {
        pollBusyRef.current = false;
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void poll();
    }, 1400);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      pollBusyRef.current = false;
    };
  }, [roomCode, playerId, applyRoom]);

  const handleCreateRoom = async (name: string, avatar: string, color: string) => {
    const result = await performAction({
      action: 'create_room',
      hostName: name,
      avatar,
      color,
      timerSeconds: 60,
    });
    if (result?.playerId) {
      setPlayerId(result.playerId);
      setRoomCode(result.room.code);
      setInitialRoomCode('');
      updateLocationForRoom(result.room.code);
      sfx.playFanfare();
    }
  };

  const handleJoinRoom = async (code: string, name: string, avatar: string, color: string) => {
    const normalized = code.trim().toUpperCase();
    const result = await performAction({
      action: 'join_room',
      code: normalized,
      playerName: name,
      avatar,
      color,
    });
    if (result?.playerId) {
      setPlayerId(result.playerId);
      setRoomCode(result.room.code);
      setInitialRoomCode('');
      updateLocationForRoom(result.room.code);
      sfx.playLockIn();
    }
  };

  const leaveRoom = () => {
    if (roomCode) clearSession(roomCode);
    setRoom(null);
    setPlayerId(null);
    setRoomCode('');
    setInitialRoomCode('');
    setError(null);
    setLoading(false);
    updateLocationForRoom(null);
  };

  const sendAction = async (action: GameActionPayload) => performAction(action);

  const hostAdvance = async () => {
    if (!room || !currentPlayer) return;
    await performAction({
      action: 'next_phase',
      code: room.code,
      playerId: currentPlayer.id,
      expectedPhase: room.phase,
      expectedPhaseStartedAt: room.phaseStartedAt,
    });
  };

  // Timers have authority on the host client only; the server validates host identity and expected phase.
  useEffect(() => {
    if (!room || !currentPlayer?.isHost || !room.phaseEndsAt || room.phase === 'lobby' || room.phase === 'round_reveal' || room.phase === 'game_over') return;
    const expectedPhase = room.phase;
    const expectedStartedAt = room.phaseStartedAt;
    const key = `${room.code}:${expectedPhase}:${expectedStartedAt}`;
    const delay = Math.max(0, room.phaseEndsAt - Date.now());
    const timeout = window.setTimeout(async () => {
      if (autoAdvanceKeyRef.current === key) return;
      autoAdvanceKeyRef.current = key;
      const result = await performAction(
        {
          action: 'next_phase',
          code: room.code,
          playerId: currentPlayer.id,
          expectedPhase,
          expectedPhaseStartedAt: expectedStartedAt,
        },
        { quiet: true, busy: false }
      );
      if (!result) autoAdvanceKeyRef.current = '';
    }, delay + 80);
    return () => window.clearTimeout(timeout);
  }, [room?.code, room?.phase, room?.phaseStartedAt, room?.phaseEndsAt, currentPlayer?.id, currentPlayer?.isHost, performAction]);

  const activeRoom = Boolean(room && currentPlayer);

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-fuchsia-400/30">
      <AuroraCanvas phase={room?.phase || 'home'} />
      <div className="relative z-10 min-h-screen flex flex-col">
        <TopBar
          room={room}
          currentPlayer={currentPlayer}
          onOpenRules={() => setRulesOpen(true)}
          onLeaveRoom={leaveRoom}
        />

        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b border-white/[0.04] bg-black/10 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5">
            {connected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-300" />}
            {connected ? (activeRoom ? 'Cross-device sync active' : 'Arena ready') : 'Reconnecting to shared room…'}
          </span>
          <span>{lastSyncAt ? `Synced ${Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000))}s ago` : 'No account needed • Use a room code'}</span>
        </div>

        {error && room && currentPlayer && room.phase !== 'write_bluff' && (
          <div role="alert" className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-3">
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-400/25 text-rose-100 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="text-rose-200/70 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <main className="flex-1">
          {!room || !currentPlayer ? (
            booting ? (
              <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 flex items-center justify-center animate-pulse">
                    <span className="text-2xl">🪄</span>
                  </div>
                  <div className="font-display font-bold text-white">Reopening your arena…</div>
                  <div className="text-xs text-slate-400">Restoring your secure player session</div>
                </div>
              </div>
            ) : (
              <HomeScreen
                initialRoomCode={initialRoomCode}
                loading={loading}
                error={error}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onOpenRules={() => setRulesOpen(true)}
              />
            )
          ) : room.phase === 'lobby' ? (
            <LobbyScreen
              room={room}
              currentPlayer={currentPlayer!}
              loading={loading}
              onToggleReady={() => void sendAction({ action: 'toggle_ready', code: room.code, playerId: currentPlayer!.id })}
              onUpdateTimer={(timerSeconds) => void sendAction({ action: 'update_settings', code: room.code, playerId: currentPlayer!.id, timerSeconds })}
              onAddBot={() => void sendAction({ action: 'add_bot', code: room.code, hostId: currentPlayer!.id })}
              onRemovePlayer={(targetPlayerId) => void sendAction({ action: 'remove_player', code: room.code, hostId: currentPlayer!.id, targetPlayerId })}
              onStartGame={() => void sendAction({ action: 'start_game', code: room.code, playerId: currentPlayer!.id })}
            />
          ) : room.phase === 'category_select' ? (
            <CategoryStage
              room={room}
              currentPlayer={currentPlayer!}
              loading={loading}
              onVoteCategory={(categoryId) => void sendAction({ action: 'vote_category', code: room.code, playerId: currentPlayer!.id, categoryId })}
              onForceNextPhase={() => void hostAdvance()}
            />
          ) : room.phase === 'write_bluff' ? (
            <BluffStage
              room={room}
              currentPlayer={currentPlayer!}
              loading={loading}
              error={error}
              onSubmitBluff={(text: string, wager: WagerMultiplier, gambit: GambitType | null) => void sendAction({ action: 'submit_bluff', code: room.code, playerId: currentPlayer!.id, text, wager, gambit })}
              onForceNextPhase={() => void hostAdvance()}
            />
          ) : room.phase === 'vote_truth' ? (
            <VoteStage
              room={room}
              currentPlayer={currentPlayer!}
              loading={loading}
              onUseTruthRadar={() => void sendAction({ action: 'use_truth_radar', code: room.code, playerId: currentPlayer!.id })}
              onSubmitVote={(optionId) => void sendAction({ action: 'submit_vote', code: room.code, playerId: currentPlayer!.id, optionId })}
              onToggleKudos={(optionId) => void sendAction({ action: 'toggle_kudos', code: room.code, playerId: currentPlayer!.id, optionId })}
              onForceNextPhase={() => void hostAdvance()}
            />
          ) : room.phase === 'round_reveal' ? (
            <RevealStage
              room={room}
              currentPlayer={currentPlayer!}
              loading={loading}
              onRevealNext={() => void sendAction({ action: 'advance_reveal_step', code: room.code, playerId: currentPlayer!.id })}
              onContinue={() => void hostAdvance()}
            />
          ) : (
            <GameOverScreen
              room={room}
              currentPlayer={currentPlayer!}
              loading={loading}
              onRestart={() => void sendAction({ action: 'restart_game', code: room.code, playerId: currentPlayer!.id })}
            />
          )}
        </main>

        {room && currentPlayer && (
          <ReactionOverlay
            reactions={room.reactions}
            onSendReaction={(emoji) => void sendAction({ action: 'send_reaction', code: room.code, playerId: currentPlayer.id, emoji })}
          />
        )}

        <footer className="px-4 sm:px-6 py-4 text-center text-[10px] text-slate-600 font-mono tracking-wider">
          MIRAGE ROYALE · BUILT FOR THE BEAUTIFUL ART OF BEING WRONG · V1.0
        </footer>
      </div>

      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
