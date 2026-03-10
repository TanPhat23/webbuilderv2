type Listener<T extends unknown[]> = (...args: T) => void;

type EventMap = Record<string, unknown[]>;

export class EventEmitter<Events extends EventMap = Record<string, unknown[]>> {
  private readonly _listeners = new Map<string, Set<Listener<unknown[]>>>();
  private readonly _onceListeners = new Map<string, Set<Listener<unknown[]>>>();

  on<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event)!.add(listener as Listener<unknown[]>);
    return this;
  }

  once<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this {
    if (!this._onceListeners.has(event)) this._onceListeners.set(event, new Set());
    this._onceListeners.get(event)!.add(listener as Listener<unknown[]>);
    return this;
  }

  off<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this {
    this._listeners.get(event)?.delete(listener as Listener<unknown[]>);
    this._onceListeners.get(event)?.delete(listener as Listener<unknown[]>);
    return this;
  }

  emit<K extends keyof Events & string>(event: K, ...args: Events[K]): boolean {
    const persistent = this._listeners.get(event);
    const once = this._onceListeners.get(event);

    if ((!persistent || persistent.size === 0) && (!once || once.size === 0)) {
      return false;
    }

    persistent?.forEach((fn) => fn(...args));

    if (once && once.size > 0) {
      once.forEach((fn) => fn(...args));
      this._onceListeners.delete(event);
    }

    return true;
  }

  removeAllListeners(event?: keyof Events & string): this {
    if (event) {
      this._listeners.delete(event);
      this._onceListeners.delete(event);
    } else {
      this._listeners.clear();
      this._onceListeners.clear();
    }
    return this;
  }

  listenerCount(event: keyof Events & string): number {
    return (
      (this._listeners.get(event)?.size ?? 0) +
      (this._onceListeners.get(event)?.size ?? 0)
    );
  }
}
