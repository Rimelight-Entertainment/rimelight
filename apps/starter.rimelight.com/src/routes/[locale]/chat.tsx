import { type Component, createSignal, onSettled, onCleanup, For, Show } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t } from "@rimelight/i18n";

interface ChatMsgPayload {
  id: string;
  type: "message" | "join" | "leave" | "presence";
  userId: string;
  username: string;
  content?: string;
  timestamp: number;
}

interface PresenceUser {
  userId: string;
  username: string;
}

interface HistoryPayload {
  type: "history";
  messages: ChatMsgPayload[];
}

type ServerMessage = ChatMsgPayload | HistoryPayload;

const COLORS = [
  "from-red-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-green-500 to-emerald-600",
  "from-yellow-500 to-amber-600",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-fuchsia-600",
  "from-teal-500 to-cyan-600",
  "from-orange-500 to-red-600",
];

function getAvatarGradientClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index] ?? "from-blue-500 to-indigo-600";
}

export const ChatPage: Component = () => {
  const [activeChannel, setActiveChannel] = createSignal("general");
  const [userId, setUserId] = createSignal("");
  const [nickname, setNickname] = createSignal("");
  const [showNickModal, setShowNickModal] = createSignal(false);
  const [nickInputValue, setNickInputValue] = createSignal("");
  const [messageInput, setMessageInput] = createSignal("");
  const [status, setStatus] = createSignal<"connecting" | "connected" | "disconnected">(
    "connecting",
  );
  const [messages, setMessages] = createSignal<ChatMsgPayload[]>([]);
  const [presenceUsers, setPresenceUsers] = createSignal<PresenceUser[]>([]);

  let socket: WebSocket | null = null;
  let messagesContainerRef!: HTMLDivElement;

  const scrollToBottom = () => {
    if (messagesContainerRef) {
      setTimeout(() => {
        messagesContainerRef?.scrollTo({
          top: messagesContainerRef.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
  };

  const connectWebSocket = () => {
    if (typeof window === "undefined") return;
    if (socket) {
      socket.close(1000, "Reconnecting with new settings");
    }

    setStatus("connecting");
    const uId = userId();
    const nick = nickname();
    if (!nick) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socketUrl = `${protocol}//${window.location.host}/api/chat/${activeChannel()}?userId=${encodeURIComponent(uId)}&username=${encodeURIComponent(nick)}`;

    socket = new WebSocket(socketUrl);

    socket.addEventListener("open", () => {
      setStatus("connected");
    });

    socket.addEventListener("message", (event) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);
        if (data.type === "history") {
          setMessages((data as HistoryPayload).messages || []);
          scrollToBottom();
        } else if (data.type === "message" || data.type === "join" || data.type === "leave") {
          setMessages((prev) => [...prev, data as ChatMsgPayload]);
          scrollToBottom();
        } else if (data.type === "presence") {
          const payload = data as any;
          setPresenceUsers(payload.users || []);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    socket.addEventListener("close", (event) => {
      setStatus("disconnected");
      if (event.code !== 1000) {
        setTimeout(connectWebSocket, 3000);
      }
    });

    socket.addEventListener("error", () => {
      setStatus("disconnected");
    });
  };

  onSettled(() => {
    if (typeof window === "undefined") return;
    let id = localStorage.getItem("chat_user_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("chat_user_id", id);
    }
    setUserId(id);

    const savedNick = localStorage.getItem("chat_nickname");
    if (!savedNick) {
      setShowNickModal(true);
    } else {
      setNickname(savedNick);
      connectWebSocket();
    }
  });

  onCleanup(() => {
    if (socket) {
      socket.close(1000, "Component unmounted");
    }
  });

  const handleNicknameSubmit = (e: Event) => {
    e.preventDefault();
    const entered = nickInputValue().trim();
    if (entered) {
      setNickname(entered);
      localStorage.setItem("chat_nickname", entered);
      setShowNickModal(false);
      connectWebSocket();
    }
  };

  const handleSendMessage = (e: Event) => {
    e.preventDefault();
    const content = messageInput().trim();
    if (content && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "message",
          content,
        }),
      );
      setMessageInput("");
    }
  };

  const switchChannel = (channel: string) => {
    if (channel === activeChannel()) return;
    setActiveChannel(channel);
    setMessages([]);
    connectWebSocket();
  };

  return (
    <AppLayout title={t("chat_page.title")} description={t("chat_page.description")}>
      <div class="min-h-[calc(100vh-var(--rl-header-height,64px)-80px)] flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div class="w-full max-w-6xl h-[650px] rounded-2xl overflow-hidden flex flex-col md:flex-row relative bg-zinc-900/60 border border-white/10 backdrop-blur-md shadow-2xl">
          {/* Side panel: Channels & Nickname */}
          <div class="w-full md:w-64 bg-zinc-900/80 border-b md:border-b-0 md:border-r border-white/10 p-5 flex flex-col justify-between shrink-0">
            <div>
              <div class="mb-6">
                <h3 class="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-3">
                  {t("chat_page.channels_title")}
                </h3>
                <div class="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                  <For each={["general", "lounge", "random", "dev"]}>
                    {(ch) => (
                      <button
                        onClick={() => switchChannel(ch)}
                        class={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                          activeChannel() === ch
                            ? "text-white bg-indigo-500/15 border border-indigo-500/25"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <span class="opacity-50">#</span> {ch}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </div>

            {/* Current user identity profile card */}
            <div class="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col gap-2">
              <div class="flex items-center gap-3">
                <div
                  class={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase select-none bg-gradient-to-br ${
                    nickname() ? getAvatarGradientClass(nickname()) : "from-zinc-600 to-zinc-800"
                  }`}
                >
                  {nickname() ? nickname().charAt(0) : "?"}
                </div>
                <div class="overflow-hidden">
                  <div class="text-xs text-zinc-400">Identity</div>
                  <div class="text-sm font-semibold text-white truncate">
                    {nickname() || "Guest"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setNickInputValue(nickname());
                  setShowNickModal(true);
                }}
                class="w-full text-center py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 transition-all cursor-pointer"
              >
                {t("chat_page.btn_change_nick")}
              </button>
            </div>
          </div>

          {/* Main chat area */}
          <div class="flex-1 flex flex-col bg-zinc-950/70 justify-between overflow-hidden">
            {/* Header banner */}
            <div class="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-zinc-900/30 shrink-0">
              <div>
                <h2 class="text-base font-semibold text-white flex items-center gap-2">
                  <span class="text-zinc-500 font-normal">#</span>
                  <span>{activeChannel()}</span>
                </h2>
              </div>

              {/* Live status badge */}
              <div class="flex items-center gap-2">
                <span
                  class={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    status() === "connected"
                      ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                      : status() === "connecting"
                        ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                        : "bg-rose-500"
                  }`}
                />
                <span
                  class={`text-xs font-medium ${
                    status() === "connected"
                      ? "text-emerald-400"
                      : status() === "connecting"
                        ? "text-amber-400"
                        : "text-rose-500"
                  }`}
                >
                  {status() === "connected"
                    ? "Live"
                    : status() === "connecting"
                      ? t("chat_page.status_connecting")
                      : "Offline"}
                </span>
              </div>
            </div>

            {/* Chat messages stream */}
            <div
              ref={(el) => (messagesContainerRef = el)}
              class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin"
            >
              <For each={messages()}>
                {(msg) => {
                  if (msg.type === "join" || msg.type === "leave") {
                    const time = new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div class="self-center py-1.5 px-3 bg-white/5 rounded-full border border-white/5 text-[10px] text-zinc-400 flex items-center gap-1.5">
                        <span
                          class={`w-1.5 h-1.5 rounded-full ${
                            msg.type === "join" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        <span class="font-medium text-zinc-300">{msg.username}</span>
                        {msg.type === "join" ? " joined the room " : " left "}
                        <span class="text-zinc-500">{time}</span>
                      </div>
                    );
                  }

                  const isMe = msg.userId === userId();
                  const time = new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      class={`flex gap-3 items-end max-w-[85%] md:max-w-[70%] ${
                        isMe ? "self-end flex-row-reverse" : "self-start"
                      }`}
                    >
                      <div
                        class={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase bg-gradient-to-br ${getAvatarGradientClass(
                          msg.username,
                        )} select-none shrink-0 mb-1`}
                      >
                        {msg.username.charAt(0)}
                      </div>
                      <div class="flex flex-col gap-1">
                        <div
                          class={`flex gap-2 items-center text-[10px] text-zinc-400 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span class="font-semibold text-zinc-300">{msg.username}</span>
                          <span>{time}</span>
                        </div>
                        <div
                          class={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                            isMe
                              ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-indigo-500/30 rounded-br-sm"
                              : "bg-white/5 text-zinc-100 border-white/5 rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>

            {/* Chat input panel */}
            <form
              onSubmit={handleSendMessage}
              class="p-4 border-t border-white/10 bg-zinc-900/30 flex gap-3 items-center shrink-0"
            >
              <input
                type="text"
                value={messageInput()}
                onInput={(e) => setMessageInput(e.currentTarget.value)}
                placeholder={t("chat_page.placeholder_msg")}
                maxlength={500}
                required
                autocomplete="off"
                class="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                type="submit"
                class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
              >
                {t("chat_page.btn_send")}
              </button>
            </form>
          </div>

          {/* Side panel: Presence/Active users */}
          <div class="w-56 bg-zinc-900/40 border-l border-white/10 p-5 shrink-0 hidden lg:flex flex-col">
            <h3 class="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-3 flex items-center gap-2">
              {t("chat_page.online_title")}
              <span class="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                {presenceUsers().length}
              </span>
            </h3>
            <div class="flex-1 overflow-y-auto flex flex-col gap-2">
              <Show
                when={presenceUsers().length > 0}
                fallback={<div class="text-xs text-zinc-500 italic p-2">No other users</div>}
              >
                <For each={presenceUsers()}>
                  {(user) => {
                    const isMe = user.userId === userId();
                    const gradient = getAvatarGradientClass(user.username);
                    return (
                      <div class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                        <div
                          class={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase bg-gradient-to-br ${gradient} select-none shrink-0`}
                        >
                          {user.username.charAt(0)}
                        </div>
                        <span class="text-xs text-zinc-200 truncate flex-1 font-medium">
                          {user.username}{" "}
                          {isMe && <span class="text-[9px] text-indigo-400">(you)</span>}
                        </span>
                      </div>
                    );
                  }}
                </For>
              </Show>
            </div>
          </div>

          {/* Welcome Overlay Modal */}
          <Show when={showNickModal()}>
            <div class="absolute inset-0 bg-zinc-950/95 backdrop-blur-md z-30 flex items-center justify-center p-4 transition-all duration-300">
              <div class="bg-zinc-900 border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-5">
                <div class="text-center">
                  <h2 class="text-xl font-bold text-white mb-2">{t("chat_page.welcome_title")}</h2>
                  <p class="text-sm text-zinc-400">{t("chat_page.welcome_desc")}</p>
                </div>
                <form onSubmit={handleNicknameSubmit} class="flex flex-col gap-4">
                  <div>
                    <label class="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                      {t("chat_page.nickname_label")}
                    </label>
                    <input
                      type="text"
                      value={nickInputValue()}
                      onInput={(e) => setNickInputValue(e.currentTarget.value)}
                      maxlength={20}
                      required
                      autocomplete="off"
                      placeholder="Enter nickname..."
                      class="w-full bg-white/5 border border-white/10 focus:border-indigo-500/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer text-sm"
                  >
                    {t("chat_page.btn_join")}
                  </button>
                </form>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
