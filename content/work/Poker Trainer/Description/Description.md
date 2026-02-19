# Description  
**Solver-Driven Poker Training Platform (React + TypeScript)**  
Built a full-stack poker training app that turns raw poker solver outputs into playable, interactive drills. I designed an end-to-end pipeline to generate, organize, and load solver packs, then wired them into a training UI that tests decisions in real game flow with action-level grading, mixed-strategy support, and session tracking.  
**Key contributions**  
* Automated solver data workflow: board packs, batch configs, per-board params, and raw solve ingestion.  
* Implemented dynamic drill generation from solver trees (street-aware, board-aware, and spot-specific).  
* Added multi-pack architecture (e.g. BTN c-bets, turn barrels, BB check-raise drills) with reusable config patterns.  
* Improved grading logic for mixed frequencies (accepting near-equivalent solver actions).  
* Integrated progression/session analytics and review-oriented drill modes.  
**Tech** React, TypeScript, Vite, Tailwind, Node scripts, JSON solver pipelines, open source poker solver data integration.  
