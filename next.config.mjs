export default {
  poweredByHeader: false,
  // ship the ticket-image fonts and logo with that route on Vercel
  outputFileTracingIncludes: { "/t/[id]/image": ["./assets/fonts/**", "./assets/brand/**"] },
};
