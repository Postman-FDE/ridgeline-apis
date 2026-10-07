// markets: events and odds. Owner: Team Trading.
export default {
  routes: [
    { method: 'GET', path: '/v1/events', handler: ({ state }) => ({ events: state.events }) },
    { method: 'GET', path: '/v1/markets', handler: ({ state, query }) => ({ markets: query.event_id ? state.markets.filter((m) => m.event_id === query.event_id) : state.markets }) },
  ],
};
