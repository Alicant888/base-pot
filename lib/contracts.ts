export const BASE_POT_ABI = [
  {
    type: "function",
    name: "createPot",
    stateMutability: "nonpayable",
    inputs: [
      { name: "goalAmount", type: "uint256" },
      { name: "deadline", type: "uint64" },
      { name: "recipient", type: "address" }
    ],
    outputs: [{ name: "potId", type: "uint256" }]
  },
  {
    type: "function",
    name: "contribute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "potId", type: "uint256" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "finalize",
    stateMutability: "nonpayable",
    inputs: [{ name: "potId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "cancelPot",
    stateMutability: "nonpayable",
    inputs: [{ name: "potId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "claimRefund",
    stateMutability: "nonpayable",
    inputs: [{ name: "potId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "getPot",
    stateMutability: "view",
    inputs: [{ name: "potId", type: "uint256" }],
    outputs: [
      { name: "organizer", type: "address" },
      { name: "recipient", type: "address" },
      { name: "goalAmount", type: "uint256" },
      { name: "raisedAmount", type: "uint256" },
      { name: "deadline", type: "uint64" },
      { name: "cancelled", type: "bool" },
      { name: "finalized", type: "bool" }
    ]
  },
  {
    type: "function",
    name: "contributions",
    stateMutability: "view",
    inputs: [
      { name: "potId", type: "uint256" },
      { name: "contributor", type: "address" }
    ],
    outputs: [{ name: "amount", type: "uint256" }]
  },
  {
    type: "event",
    name: "PotCreated",
    anonymous: false,
    inputs: [
      { name: "potId", type: "uint256", indexed: true },
      { name: "organizer", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "goalAmount", type: "uint256", indexed: false },
      { name: "deadline", type: "uint64", indexed: false }
    ]
  },
  {
    type: "event",
    name: "ContributionReceived",
    anonymous: false,
    inputs: [
      { name: "potId", type: "uint256", indexed: true },
      { name: "contributor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "totalRaised", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "PotFinalized",
    anonymous: false,
    inputs: [
      { name: "potId", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "PotCancelled",
    anonymous: false,
    inputs: [
      { name: "potId", type: "uint256", indexed: true },
      { name: "organizer", type: "address", indexed: true }
    ]
  },
  {
    type: "event",
    name: "RefundClaimed",
    anonymous: false,
    inputs: [
      { name: "potId", type: "uint256", indexed: true },
      { name: "contributor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  }
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" }
    ],
    outputs: [{ name: "success", type: "bool" }]
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "remaining", type: "uint256" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }]
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "decimals", type: "uint8" }]
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
] as const;
