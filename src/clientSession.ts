let clientSessionPromise: Promise<string> | null = null;

function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getClientSessionId() {
  if (!clientSessionPromise) {
    clientSessionPromise = Promise.resolve(createSessionId());
  }

  return clientSessionPromise;
}
