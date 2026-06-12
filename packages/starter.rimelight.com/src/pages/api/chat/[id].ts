import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return new Response('Missing room id', { status: 400 });
  }

  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }



  // Get the Durable Object namespace via the modern cloudflare:workers env import
  const chatRoomNamespace = (env as any).ChatRoom;
  if (!chatRoomNamespace) {
    return new Response('ChatRoom Durable Object namespace not bound', { status: 500 });
  }

  // Retrieve the Durable Object stub by the room id name
  const chatRoomId = chatRoomNamespace.idFromName(id);
  const chatRoomStub = chatRoomNamespace.get(chatRoomId);

  // Forward the WebSocket upgrade request to the Durable Object
  return chatRoomStub.fetch(request);
};
