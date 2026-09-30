export interface PaymentItem {
  id: string;
  date: string;
  status: "paid" | "failed" | "refunded";
  category: "Subscriptions" | "Infrastructure" | "Hardware";
  email: string;
  amount: number;
  children?: PaymentItem[];
}

export const formatShowcaseDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatShowcaseCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

export const SHOWCASE_PAYMENTS_DATA: PaymentItem[] = [
  {
    id: "PAY-1001",
    date: "2026-03-11T15:30:00",
    status: "paid",
    category: "Subscriptions",
    email: "james.anderson@example.com",
    amount: 594,
    children: [
      {
        id: "PAY-1001-A",
        date: "2026-03-11T16:00:00",
        status: "paid",
        category: "Subscriptions",
        email: "james.sub1@example.com",
        amount: 94,
      },
    ],
  },
  {
    id: "PAY-1002",
    date: "2026-03-11T10:10:00",
    status: "failed",
    category: "Infrastructure",
    email: "mia.white@example.com",
    amount: 276,
  },
  {
    id: "PAY-1003",
    date: "2026-03-11T08:50:00",
    status: "refunded",
    category: "Subscriptions",
    email: "william.brown@example.com",
    amount: 315,
  },
  {
    id: "PAY-1004",
    date: "2026-03-10T19:45:00",
    status: "paid",
    category: "Hardware",
    email: "emma.davis@example.com",
    amount: 1529,
  },
  {
    id: "PAY-1005",
    date: "2026-03-10T15:55:00",
    status: "paid",
    category: "Infrastructure",
    email: "ethan.harris@example.com",
    amount: 639,
  },
  {
    id: "PAY-1006",
    date: "2026-03-09T14:20:00",
    status: "paid",
    category: "Hardware",
    email: "noah.clark@example.com",
    amount: 873,
  },
  {
    id: "PAY-1007",
    date: "2026-03-08T22:50:00",
    status: "refunded",
    category: "Subscriptions",
    email: "liam.walker@example.com",
    amount: 701,
  },
  {
    id: "PAY-1008",
    date: "2026-03-08T14:55:00",
    status: "failed",
    category: "Infrastructure",
    email: "amelia.king@example.com",
    amount: 437,
  },
];
