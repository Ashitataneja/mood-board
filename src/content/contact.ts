/** Everything the Contact cloud says (brief §8.5). */
export const contactCopy = {
  askName: "Hi! What's your name?",
  askTopic: (name: string) => `Nice to meet you, ${name}. What should we talk about?`,
  topics: ['A role', 'A project', 'Just saying hi'],
  askEmail: 'Where can I reply?',
  badEmail: "Hmm, that doesn't look like an email address. Try again?",
  askMessage: 'Anything else?',
  sent: "Got it! I'll reply soon.",
  sentMailto:
    'Your email app should open with this ready to go. Hit send there and I’ll reply soon.',
  failed: "Oh no, that didn't go through. You can email me directly instead:",
};
