export default {
  poweredByHeader: false,
  // ship the ticket-image fonts with that route on Vercel
  outputFileTracingIncludes: { "/t/[id]/image": ["./assets/fonts/**"] },
};
