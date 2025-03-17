Akyba: Empowering Community Savings on the Cardano Blockchain
Abstract
Akyba is a decentralized platform built on the Cardano blockchain, designed to modernize traditional tontines—a centuries-old community savings system. By leveraging smart contracts, State Thread Tokens (STTs), CIP-68 dynamic NFTs, and Merkle Patricia Forestry (MPF), Akyba addresses the limitations of traditional tontines, such as lack of transparency, fraud risks, and limited financial growth. Akyba empowers users to create, customize, and manage tontines in a secure, transparent, and yield-generating ecosystem.
________________________________________
The Problem with Traditional Tontines
Traditional tontines, while effective in fostering community savings, face significant challenges:
1.	Trust Issues: Dependence on a central organizer increases the risk of fraud or mismanagement.
2.	Lack of Transparency: Participants have limited visibility into fund management.
3.	No Financial Growth: Pooled funds remain idle, missing opportunities for yield generation.
Akyba aims to preserve the core value of tontines—community-based financial cooperation—while addressing these inefficiencies.
________________________________________
The Vision of Akyba
Akyba transforms tontines into a decentralized, transparent, and yield-generating platform. Key objectives include:
1.	Trustless Operations: Smart contracts automate contributions and distributions, eliminating the need for a central organizer.
2.	Transparency: All transactions are immutably recorded on the blockchain.
3.	Customizability: Users define tontine rules, including contribution schedules, payout mechanisms, and governance models.
4.	Financial Growth: Pooled funds are actively invested in DeFi strategies to maximize returns.
5.	Scalability: Advanced features like STTs, CIP-68, and MPF ensure efficient and secure operations for large participant pools.
________________________________________
Key Features
1. User-Created Tontines
Users can create tontines tailored to their financial goals, with customizable parameters:
•	Contribution Rules: Fixed or variable amounts, frequency, and thresholds.
•	Payout Rules: Fixed, rotating, or proportional distributions.
•	Governance Models: DAO-driven or creator-controlled decision-making.
A user-friendly interface ensures accessibility, while smart contracts guarantee secure and autonomous operations.
________________________________________
2. CIP-68 Dynamic NFTs for State Management
CIP-68 dynamic NFTs manage tontine states, members, and rounds:
•	Pool NFTs: Track tontine state (e.g., total funds, contributions, payout progress).
•	Member NFTs: Store participant contributions, payout history, and eligibility.
•	Round NFTs: Monitor contributions and payouts for specific cycles.
These NFTs enable modular, transparent, and efficient on-chain state tracking.
________________________________________
3. State Thread Tokens (STTs) for Stateful Tontines
STTs manage the mutable global state of tontine pools:
•	Atomic Updates: Ensure synchronized updates to parameters like total_funds and current_round.
•	Immutable Ownership: Tontine states are cryptographically tied to STTs, preventing unauthorized changes.
•	Scalable State Management: Efficiently handle updates for large participant pools.
________________________________________
4. Merkle Patricia Forestry (MPF) for Data Integrity
MPF ensures efficient and scalable data management:
•	Efficient Storage: Contributions and payouts are stored compactly in an MPF.
•	Scalable Verification: MPF proofs enable verification without loading entire datasets on-chain.
Example: When a participant contributes, their data is added to the MPF, and the STT validator updates the pool’s root hash.
________________________________________
5. Yield-Generating Investments
Pooled funds are actively invested in DeFi strategies:
•	Staking: Earn rewards through Cardano's native mechanisms.
•	Yield Farming: Provide liquidity to Cardano-based protocols.
•	Lending: Earn interest on idle capital.
Participants benefit from financial growth on their contributions.
________________________________________
6. DAO-Driven Governance
Akyba integrates Decentralized Autonomous Organization (DAO) capabilities:
•	Participants propose and vote on tontine rules, investment strategies, and dispute resolutions.
•	Voting power is proportional to contributions, ensuring fairness.
________________________________________
Tontine Creation Workflow
1.	Onboarding:
o	Users connect their Cardano wallets and access the platform dashboard.
o	Optional: Mint an Identity NFT for verifiable participation.
2.	Tontine Setup:
o	Creators configure tontine parameters (e.g., pool type, contribution rules, governance settings).
o	Smart contracts deploy Pool NFTs and STTs for state management.
3.	Participant Management:
o	Members join by locking funds and receiving Member NFTs.
o	Contributions are added to the MPF, and the pool state is updated via STT validators.
4.	Lifecycle Management:
o	Contributions and payouts are validated on-chain.
o	Rounds progress automatically, with updates reflected in Pool NFTs and STT datums.
________________________________________
Platform Architecture
Frontend
•	Dashboard: Enables tontine creation, joining, and management.
•	Explorer: Provides real-time visibility into tontine states, contributions, and payouts.
Backend
•	CIP-68 Metadata Management: Dynamically updates NFTs for pools, members, and rounds.
•	MPF Proof Generation: Handles participant data storage and verification.
•	Transaction Coordination: Ensures atomic state updates via STTs.
________________________________________
Conclusion
Akyba revolutionizes community savings by combining decentralized governance, transparent operations, and yield optimization. Through advanced blockchain technologies like STTs, CIP-68, and MPF, Akyba ensures state integrity, scalability, and financial growth, empowering individuals and communities to take control of their financial future.
________________________________________
Akyba is not just a platform—it’s a movement toward decentralized, community-driven financial empowerment.


USER EXPERIENCE - This is the POC of the Akyba project , for testing purpose : 
The winner's address is added to : line 237 of CheckRedeem.tsx 
Connect to the wallet.
1) All members contribute 2 ADA , by interacting with the button "Contribute Fund" after inputing 2 in the field
2) The designated winner interacts with the button "Collect Fund" then, all contributions are added into his account 

![User Experience](https://github.com/user-attachments/assets/4f1630f9-b033-49a1-957e-3ba416522e58)

The final project workflow would be 

![Final Project](https://github.com/user-attachments/assets/89e91961-1082-4b75-9798-0e9203693efb)
