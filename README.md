# AuditSwap

**AuditSwap** is a decentralized, real-time audit and swap execution engine for Solana tokens. It consumes Birdeye security and listing data, passes token listings through a deterministic audit filter, and executes atomic swaps via Jupiter v6 — only for assets that pass all security checks.

---

## Architecture Overview

### Diagram 1 — End-to-end Pipeline

```mermaid
flowchart LR
    A[Solana Blockchain] -->|New token mints| B[Birdeye /new_listing]
    B -->|Unfiltered token addresses| C[AuditSwap Engine]
    C -->|Request security metrics| D[Birdeye /token_security]
    D -->|Risk scores & flags| C
    C -->|Audit decision: PASS| E[Jupiter v6 API]
    E -->|Quote & route| F[Atomic Swap Execution]
    F -->|Swap complete| G[AuditSwap UI / User]
    
    C -->|Audit decision: FAIL| H[Reject & Log]
    H -->|No swap| G
```

---

### Diagram 2 — Security Decision Tree (Audit Filter)

This is the core audit filter logic — sequential gates, **fail any = abort**.

```mermaid
flowchart TD
    START([New token detected via /new_listing]) --> A{Mint authority present?}
    
    A -->|Yes| REJECT1[❌ REJECT: Centralized mint risk]
    REJECT1 --> ABORT([Abort swap])
    
    A -->|No| B{Honeypot simulation score < threshold?}
    
    B -->|No| REJECT2[❌ REJECT: Honeypot risk]
    REJECT2 --> ABORT
    
    B -->|Yes| C{Top 10 holders concentration < 30%?}
    
    C -->|No| REJECT3[❌ REJECT: Whale concentration risk]
    REJECT3 --> ABORT
    
    C -->|Yes| D{Liquidity > $50k?}
    
    D -->|No| REJECT4[❌ REJECT: Insufficient liquidity]
    REJECT4 --> ABORT
    
    D -->|Yes| PASS([✅ PASS: Eligible for swap])
    PASS --> EXECUTE[Execute via Jupiter v6]
```

---

### Diagram 3 — Birdeye Metric Mapping to AuditSwap Engine

Shows exactly which Birdeye endpoints are consumed and how they map into the audit decision.

```mermaid
flowchart LR
    subgraph BIRDEYE["Birdeye API"]
        NL["/new_listing\n(real-time new token stream)"]
        TS["/token_security\n(risk scores, mint authority, honeypot, holders)"]
        TP["/token_overview\n(price, liquidity, volume)"]
    end

    subgraph AUDIT["AuditSwap Engine"]
        A1["Parse token address"]
        A2["Aggregate security flags"]
        A3["Run decision tree"]
        A4["Output: PASS / FAIL"]
    end

    subgraph JUP["Jupiter v6"]
        J1["/quote"]
        J2["/swap"]
    end

    NL -->|Token address| A1
    TS -->|Mint authority, honeypot, holders| A2
    TP -->|Liquidity, market cap| A2
    A2 --> A3
    A3 -->|If PASS| J1
    J1 --> J2
    J2 -->|Atomic swap| EXECUTION[On-chain swap]
```

---

## Audit Filter Summary

| Gate | Condition | Data Source | Action on Fail |
|------|-----------|-------------|----------------|
| 1 | Mint authority == null | Birdeye `/token_security` | ❌ Reject |
| 2 | Honeypot score < 0.05 | Birdeye simulation | ❌ Reject |
| 3 | Top 10 holders ≤ 30% | Birdeye holder distribution | ❌ Reject |
| 4 | Liquidity > $50k | Birdeye `/token_overview` | ❌ Reject |
| All gates pass | → | → | ✅ Execute Jupiter swap |

---

## Quick Start

### Clone & Install

```bash
git clone https://github.com/youruser/auditswap.git
cd auditswap
npm install
```

### Environment Variables

Create a `.env` file:

```env
BIRDEYE_API_KEY=your_api_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
JUPITER_API=https://quote-api.jup.ag/v6
```

### Run the Audit Listener

```bash
npm run start:listener
```

### Run Tests

```bash
npm test
```

---

## Repository Structure

```
auditswap/
├── src/
│   ├── birdeye/      # Birdeye API clients
│   ├── audit/        # Decision tree logic
│   ├── jupiter/      # Jupiter v6 integration
│   └── listener/     # Real-time /new_listing consumer
├── tests/            # Unit + integration tests
├── config/           # Threshold configuration
└── README.md
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the audit filter contribution guidelines.

---

## License

MIT — see [LICENSE](LICENSE) for details.
