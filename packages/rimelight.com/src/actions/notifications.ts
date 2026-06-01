import { defineAction, ActionError } from "astro:actions"

const mockNotifications = [
  {
    id: 1,
    unread: true,
    sender: {
      name: "Jordan Brown",
      email: "jordan.brown@example.com",
      avatar: {
        src: "https://i.pravatar.cc/128?u=2"
      }
    },
    body: "sent you a message",
    date: new Date(Date.now() - 7 * 60000).toISOString()
  },
  {
    id: 2,
    sender: {
      name: "Lindsay Walton"
    },
    body: "subscribed to your email list",
    date: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    unread: true,
    sender: {
      name: "Taylor Green",
      email: "taylor.green@example.com",
      avatar: {
        src: "https://i.pravatar.cc/128?u=3"
      }
    },
    body: "sent you a message",
    date: new Date(Date.now() - 3 * 3600000).toISOString()
  }
]

export const notifications = {
  getNotifications: defineAction({
    handler: async (_input, context) => {
      const user = context.locals.user
      if (!user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Authentication required."
        })
      }
      return mockNotifications
    }
  })
}
