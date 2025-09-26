// Sistema de eventos para detectar mudanças na galáxia
export class GalaxyEvents {
  private static listeners: Map<string, Set<() => void>> = new Map();

  /**
   * Adiciona um listener para um evento
   */
  static addEventListener(event: string, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove um listener de um evento
   */
  static removeEventListener(event: string, callback: () => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Dispara um evento
   */
  static dispatchEvent(event: string): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback());
    }
  }

  /**
   * Eventos disponíveis
   */
  static readonly EVENTS = {
    PLANET_ADDED: 'planet-added',
    PLANET_REMOVED: 'planet-removed',
    PLANET_UPDATED: 'planet-updated',
    GALAXY_CLEARED: 'galaxy-cleared',
  } as const;
}
