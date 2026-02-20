'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getSocket, destroySocket, type GameSocket } from '@/lib/ws/client';
import { bindSocketToStore, unbindSocketFromStore } from '@/store/wsMiddleware';
import { useGameStore } from '@/store';

export function useWebSocket() {
  const socketRef = useRef<GameSocket | null>(null);
  const boundRef = useRef(false);
  const setConnected = useGameStore((s) => s.setConnected);
  const setReconnecting = useGameStore((s) => s.setReconnecting);
  const setError = useGameStore((s) => s.setError);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Only bind listeners once to prevent duplicate handlers on reconnect
    if (!boundRef.current) {
      boundRef.current = true;

      socket.on('connect', () => {
        setConnected(true);
        setReconnecting(false);
        bindSocketToStore(socket);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.io.on('reconnect_attempt', () => {
        setReconnecting(true);
      });

      socket.io.on('reconnect', () => {
        setReconnecting(false);
        setConnected(true);
      });

      socket.io.on('reconnect_failed', () => {
        setReconnecting(false);
        setError('Connection lost. Please refresh the page.');
      });
    }

    socket.connect();
  }, [setConnected, setReconnecting, setError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      unbindSocketFromStore(socketRef.current);
    }
    destroySocket();
    socketRef.current = null;
    setConnected(false);
  }, [setConnected]);

  const emit = useCallback(<Ev extends keyof import('@/lib/ws/protocol').ClientToServerEvents>(
    ev: Ev,
    ...args: Parameters<import('@/lib/ws/protocol').ClientToServerEvents[Ev]>
  ) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn('Socket not connected, cannot emit');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (socket.emit as any)(ev, ...args);
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        unbindSocketFromStore(socketRef.current);
        destroySocket();
        socketRef.current = null;
      }
    };
  }, []);

  return { connect, disconnect, emit, socket: socketRef };
}
