import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../../../../src/core/events/EventBus.js';

describe('EventBus', () => {
  it('transmet les données aux écouteurs du type publié uniquement', () => {
    const bus = new EventBus();
    const received = [];
    bus.on('a', (payload) => received.push(['a', payload]));
    bus.on('b', (payload) => received.push(['b', payload]));

    bus.emit('a', { value: 1 });

    assert.deepEqual(received, [['a', { value: 1 }]]);
  });

  it('ne notifie plus un écouteur désabonné', () => {
    const bus = new EventBus();
    let calls = 0;
    const unsubscribe = bus.on('a', () => {
      calls += 1;
    });

    unsubscribe();
    bus.emit('a');

    assert.equal(calls, 0);
  });

  it('notifie les écouteurs globaux avec le type et les données', () => {
    const bus = new EventBus();
    const received = [];
    const unsubscribe = bus.onAny((type, payload) => received.push({ type, payload }));

    bus.emit('x', { n: 2 });
    unsubscribe();
    bus.emit('y');

    assert.deepEqual(received, [{ type: 'x', payload: { n: 2 } }]);
  });

  it('accepte une publication sans écouteur ni données', () => {
    const bus = new EventBus();

    assert.doesNotThrow(() => bus.emit('nobody-listens'));
  });

  it("ignore un désabonnement d'un type inconnu", () => {
    const bus = new EventBus();

    assert.doesNotThrow(() => bus.off('unknown', () => {}));
  });
});
