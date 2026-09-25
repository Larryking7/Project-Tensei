# Project Tensei

> **Re-imagining AWS Support for an AI-Native World**  
> *Developed by the August 2026 AWS CSE Intern Cohort (Team of 7).*

---

## Overview
Project Tensei is a proof-of-concept reimagining of the AWS Support Center, shifting the paradigm from a reactive model (where customers fill out blank forms and wait) to an proactive, collaborative workflow where humans and AI work as teammates. 

The project connects pre-deployment guidance with post-failure troubleshooting to ensure issues are either prevented or resolved with total transparency.

## The Team & Core Features
Built collaboratively by a team of 7 interns as part of the August 2026 AWS CSE internship, Project Tensei integrates four core pillars into a shared frontend prototype:

* **Configuration Assistant (Pre-Deployment Review):** Proactively reviews workload manifests against target clusters, flagging misconfigurations (such as missing GPU tolerations on tainted nodes) inline before deployment.
* **Context Tool / Support AI (My Contribution):** Built the environment context retrieval and consent-gated investigation tools that pass critical session and cluster data securely into the support hub.
* **Diagnostic Investigation Graph:** Visualizes the reasoning path of the AI (separating evidence nodes from conclusion nodes) so customers can audit the diagnostic steps rather than trusting a black box.
* **Log Explainer & Impact Simulator:** Translates complex `FailedScheduling` and `Pending` events into plain language and previews the impact of fixes before execution.

## Tech Stack
* **Frontend:** Static HTML, CSS, Vanilla JavaScript (iframe components and shared shell state).
* **Architecture:** Modular component-based local prototype demonstrating end-to-end support operations.
