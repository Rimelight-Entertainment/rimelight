import { defineAction, ActionError } from "astro:actions"
import { auth } from "#auth/auth"

const mockMails = [
  {
    id: 1,
    from: {
      name: "Alex Smith",
      email: "alex.smith@example.com",
      avatar: {
        src: "https://imagedelivery.net/CIt4DwT04j0re9-AzSsOtQ/1bbb9d00-9764-4a9c-305c-add92d1af900/public"
      }
    },
    subject: "Meeting Schedule: Q1 Marketing Strategy Review",
    body: `Dear Team,

I hope this email finds you well. Just a quick reminder about our Q1 Marketing Strategy meeting scheduled for tomorrow at 10 AM EST in Conference Room A.

Agenda:
- Q4 Performance Review
- New Campaign Proposals
- Budget Allocation for Q2
- Team Resource Planning

Please come prepared with your department updates. I've attached the preliminary deck for your review.

Best regards,
Alex Smith
Senior Marketing Director
Tel: (555) 123-4567`,
    date: new Date().toISOString()
  },
  {
    id: 2,
    unread: true,
    from: {
      name: "Jordan Brown",
      email: "jordan.brown@example.com",
      avatar: {
        src: "https://imagedelivery.net/CIt4DwT04j0re9-AzSsOtQ/1bbb9d00-9764-4a9c-305c-add92d1af900/public"
      }
    },
    subject: "RE: Project Phoenix - Sprint 3 Update",
    body: `Hi team,

Quick update on Sprint 3 deliverables:

✅ User authentication module completed
🏗️ Payment integration at 80%
⏳ API documentation pending review

Key metrics:
- Code coverage: 94%
- Sprint velocity: 45 points
- Bug resolution rate: 98%

Please review the attached report for detailed analysis. Let's discuss any blockers in tomorrow's stand-up.

Regards,
Jordan

--
Jordan Brown
Lead Developer | Tech Solutions
Mobile: +1 (555) 234-5678`,
    date: new Date(Date.now() - 7 * 60000).toISOString()
  },
  {
    id: 3,
    unread: true,
    from: {
      name: "Taylor Green",
      email: "taylor.green@example.com",
      avatar: {
        src: "https://imagedelivery.net/CIt4DwT04j0re9-AzSsOtQ/1bbb9d00-9764-4a9c-305c-add92d1af900/public"
      }
    },
    subject: "Lunch Plans",
    body: `Hi there!

I was wondering if you'd like to grab lunch this Friday? There's this amazing new Mexican restaurant downtown called "La Casa" that I've been wanting to try. They're known for their authentic tacos and house-made guacamole.

Would 12:30 PM work for you? It would be great to catch up and discuss the upcoming team building event while we're there.

Let me know what you think!

Best,
Taylor`,
    date: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 4,
    from: {
      name: "Morgan White",
      email: "morgan.white@example.com",
      avatar: {
        src: "https://imagedelivery.net/CIt4DwT04j0re9-AzSsOtQ/1bbb9d00-9764-4a9c-305c-add92d1af900/public"
      }
    },
    subject: "New Proposal: Project Horizon",
    body: `Hi team,

I've just uploaded the comprehensive proposal for Project Horizon to our shared drive. The document includes:

• Detailed project objectives and success metrics
• Resource allocation and team structure
• Timeline with key milestones
• Budget breakdown
• Risk assessment and mitigation strategies

I'm particularly excited about our innovative approach to the user engagement component, which could set a new standard for our industry.

Could you please review and provide feedback by EOD Friday? I'd like to present this to the steering committee next week.

Thanks in advance,

Morgan White
Senior Project Manager
Tel: (555) 234-5678`,
    date: new Date(Date.now() - 24 * 3600000).toISOString()
  }
]

export const mails = {
  getMails: defineAction({
    handler: async (_input, context) => {
      const sessionData = await auth.getSession(context.request)
      const user = sessionData
      if (!user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Authentication required."
        })
      }
      return mockMails
    }
  })
}
