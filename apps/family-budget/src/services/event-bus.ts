type Handler = (...args: unknown[]) => void;

class EventBus {
  private listeners: Map<string, Set<Handler>> = new Map();

  on(event: string, handler: Handler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(...args);
      } catch (e) {
        console.error(`EventBus error in "${event}":`, e);
      }
    });
  }
}

export const eventBus = new EventBus();

// Event constants
export const Events = {
  TRANSACTION_ADDED: 'transaction:added',
  TRANSACTION_DELETED: 'transaction:deleted',
  TRANSACTION_UPDATED: 'transaction:updated',
  CATEGORY_ADDED: 'category:added',
  CATEGORY_DELETED: 'category:deleted',
  FILTER_CHANGED: 'filter:changed',
  ROUTE_CHANGED: 'route:changed',
} as const;
