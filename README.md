<div align="center">
  <img src="assets/header.svg" alt="Nikodem Jachec — AI Automation Engineer" width="100%">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Wroc%C5%82aw-Poland-161B22?style=for-the-badge&logo=googlemaps&logoColor=8B949E" alt="Location">
  <img src="https://img.shields.io/badge/Focus-AI_%26_Voice_Automation-161B22?style=for-the-badge&logo=n8n&logoColor=EA4B71" alt="Focus">
  <img src="https://komarev.com/ghpvc/?username=NikodemJachec99&style=for-the-badge&color=161B22&label=VISITORS" alt="Visitor counter">
</div>

<img src="assets/divider.svg" width="100%" alt="">

## &nbsp;About me

```js
const nikodem = {
  role:     "AI Automation Engineer / Integration Developer",
  builds:   ["voice agents", "LLM pipelines", "business process automation"],
  core:     ["n8n", "FastAPI", "NestJS", "PostgreSQL + RLS", "Docker"],
  ai:       ["OpenAI Realtime", "Gemini / Vertex AI", "ElevenLabs", "Deepgram"],
  hardware: "AEROS — wearable ECG on nRF52840",
  studies:  "Medical Informatics @ Wrocław University of Science and Technology",
  approach: "API-first, event-driven, structured output over guesswork"
};
```

- 🤖 &nbsp;**AI pipelines and agent systems** — structured output constrained by JSON Schema, tool calling, RAG on Supabase Vector Store, embeddings from Vertex AI
- 📞 &nbsp;**Voice agents over the phone** — Twilio ConversationRelay, SIP B2BUA on FreeSWITCH, real-time STT with Deepgram Nova-3 and TTS with ElevenLabs
- ⚙️ &nbsp;**Multi-tenant n8n** as the orchestration layer, wired into GoHighLevel, Baselinker, Zapier, Copart, OneDrive and Google Drive
- 🗄️ &nbsp;**Backend** on FastAPI and NestJS, PostgreSQL with **RLS** (tenant isolation enforced in the database, not in application code), Redis, nginx — all containerised
- 📱 &nbsp;**Offline-first Flutter** with idempotent sync via `client_uuid` — the app works with no network and never duplicates data on retry
- 🩺 &nbsp;**AEROS** — wearable ECG: nRF52840 Sense Plus, ADS1292 analog front-end, BQ25185 power management
- 🎓 &nbsp;Studying **[Medical Informatics](https://medinf.pwr.edu.pl/)** at Wrocław University of Science and Technology — an engineering degree taught entirely in English, Faculty of Fundamental Problems of Technology
- 🔬 &nbsp;Member of **[KN BioAddMed](https://github.com/BioAddMed)** — a student research club working on additive manufacturing for medical applications
- 🎨 &nbsp;After hours: **LoRA fine-tuning** on FLUX and Stable Diffusion — Kohya_ss locally on an RTX 4070, FluxGym in Colab

> [!NOTE]
> My commercial work lives in private client repositories and n8n instances, so you won't find it here. The public repos are mostly coursework: different stack, different era.

<img src="assets/divider.svg" width="100%" alt="">

## &nbsp;Stack

<div align="center">

**AI / LLM**

<img src="https://img.shields.io/badge/OpenAI-161B22?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzc0QUE5QyI%2BPHBhdGggZD0iTTEyIDEuNWwyLjYgNy45IDcuOSAyLjYtNy45IDIuNkwxMiAyMi41bC0yLjYtNy45TDEuNSAxMmw3LjktMi42eiIvPjwvc3ZnPg%3D%3D" alt="OpenAI">
<img src="https://img.shields.io/badge/Gemini-161B22?style=for-the-badge&logo=googlegemini&logoColor=8E75B2" alt="Google Gemini">
<img src="https://img.shields.io/badge/Vertex_AI-161B22?style=for-the-badge&logo=googlecloud&logoColor=4285F4" alt="Vertex AI">
<img src="https://img.shields.io/badge/ElevenLabs-161B22?style=for-the-badge&logo=elevenlabs&logoColor=E8E8E8" alt="ElevenLabs">
<img src="https://img.shields.io/badge/Deepgram-161B22?style=for-the-badge&logo=deepgram&logoColor=13EF93" alt="Deepgram">
<img src="https://img.shields.io/badge/Supabase_Vector-161B22?style=for-the-badge&logo=supabase&logoColor=3FCF8E" alt="Supabase Vector Store">

**Voice / telephony**

<img src="https://img.shields.io/badge/Twilio-161B22?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0YyMkY0NiI%2BPHBhdGggZD0iTTYuNiAxMC44YzEuNCAyLjggMy44IDUuMiA2LjYgNi42bDIuMi0yLjJjLjMtLjMuNy0uNCAxLjEtLjIgMS4yLjQgMi41LjYgMy44LjYuNiAwIDEgLjQgMSAxVjIwYzAgLjYtLjQgMS0xIDFDMTAuNiAyMSAzIDEzLjQgMyA0YzAtLjYuNC0xIDEtMWgzLjVjLjYgMCAxIC40IDEgMSAwIDEuMy4yIDIuNi42IDMuOC4xLjQgMCAuOC0uMiAxLjF6Ii8%2BPC9zdmc%2B" alt="Twilio">
<img src="https://img.shields.io/badge/FreeSWITCH-161B22?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0M5RDFEOSI%2BPHBhdGggZD0iTTMgM2gxOHY1SDN6bTAgNi41aDE4djVIM3pNMyAxNmgxOHY1SDN6bTIuNSAyLjVhMSAxIDAgMTAwLTIgMSAxIDAgMDAwIDJ6bTAtNi41YTEgMSAwIDEwMC0yIDEgMSAwIDAwMCAyem0wLTYuNWExIDEgMCAxMDAtMiAxIDEgMCAwMDAgMnoiLz48L3N2Zz4%3D" alt="FreeSWITCH">
<img src="https://img.shields.io/badge/Asterisk-161B22?style=for-the-badge&logo=asterisk&logoColor=FF7A00" alt="Asterisk">
<img src="https://img.shields.io/badge/SIP_B2BUA-161B22?style=for-the-badge&logoColor=C9D1D9" alt="SIP B2BUA">

**Backend & data**

<img src="https://img.shields.io/badge/Python-161B22?style=for-the-badge&logo=python&logoColor=FFD43B" alt="Python">
<img src="https://img.shields.io/badge/FastAPI-161B22?style=for-the-badge&logo=fastapi&logoColor=009688" alt="FastAPI">
<img src="https://img.shields.io/badge/NestJS-161B22?style=for-the-badge&logo=nestjs&logoColor=E0234E" alt="NestJS">
<img src="https://img.shields.io/badge/Node.js-161B22?style=for-the-badge&logo=nodedotjs&logoColor=5FA04E" alt="Node.js">
<img src="https://img.shields.io/badge/PostgreSQL_+_RLS-161B22?style=for-the-badge&logo=postgresql&logoColor=4169E1" alt="PostgreSQL + RLS">
<img src="https://img.shields.io/badge/Redis-161B22?style=for-the-badge&logo=redis&logoColor=FF4438" alt="Redis">
<img src="https://img.shields.io/badge/Neo4j-161B22?style=for-the-badge&logo=neo4j&logoColor=4581C3" alt="Neo4j">

**Frontend & mobile**

<img src="https://img.shields.io/badge/Next.js-161B22?style=for-the-badge&logo=nextdotjs&logoColor=E8E8E8" alt="Next.js">
<img src="https://img.shields.io/badge/TypeScript-161B22?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript">
<img src="https://img.shields.io/badge/Flutter-161B22?style=for-the-badge&logo=flutter&logoColor=42A5F5" alt="Flutter">

**Automation & orchestration**

<img src="https://img.shields.io/badge/n8n-161B22?style=for-the-badge&logo=n8n&logoColor=EA4B71" alt="n8n">
<img src="https://img.shields.io/badge/MCP-161B22?style=for-the-badge&logo=modelcontextprotocol&logoColor=C9D1D9" alt="Model Context Protocol">
<img src="https://img.shields.io/badge/GoHighLevel-161B22?style=for-the-badge&logoColor=C9D1D9" alt="GoHighLevel">
<img src="https://img.shields.io/badge/Zapier-161B22?style=for-the-badge&logo=zapier&logoColor=FF4F00" alt="Zapier">

**Infrastructure & hardware**

<img src="https://img.shields.io/badge/Docker-161B22?style=for-the-badge&logo=docker&logoColor=2496ED" alt="Docker">
<img src="https://img.shields.io/badge/Kubernetes-161B22?style=for-the-badge&logo=kubernetes&logoColor=326CE5" alt="Kubernetes">
<img src="https://img.shields.io/badge/nginx-161B22?style=for-the-badge&logo=nginx&logoColor=009639" alt="nginx">
<img src="https://img.shields.io/badge/Linux-161B22?style=for-the-badge&logo=linux&logoColor=FCC624" alt="Linux">
<img src="https://img.shields.io/badge/CUDA-161B22?style=for-the-badge&logo=nvidia&logoColor=76B900" alt="CUDA">
<img src="https://img.shields.io/badge/nRF52840-161B22?style=for-the-badge&logo=nordicsemiconductor&logoColor=00A9CE" alt="Nordic nRF52840">

</div>

<img src="assets/divider.svg" width="100%" alt="">

## &nbsp;How I build

Frameworks come and go; the patterns stay. These describe my work better than any tool list:

| | |
|---|---|
| **Multi-tenancy** | PostgreSQL + RLS — tenant isolation enforced by the database, not by application code |
| **Offline-first sync** | Flutter + idempotent sync via `client_uuid` — retries never create duplicates |
| **Voice agents** | Twilio ConversationRelay and SIP B2BUA on FreeSWITCH, real-time STT/TTS |
| **RAG** | Supabase Vector Store + Vertex AI embeddings |
| **Structured extraction** | enforced JSON Schema — the model has no way to hand back garbage |
| **Event-driven** | webhooks and queues instead of polling |

Docker and nginx are in production. Scaling n8n across Docker Swarm and Kubernetes is a designed path, not a deployment yet — I'd rather say so plainly.

<img src="assets/divider.svg" width="100%" alt="">

## &nbsp;Projects

<table>
<tr>
<td width="50%" valign="top">

### 🩺 &nbsp;AEROS

`nRF52840` &nbsp;`ADS1292` &nbsp;`BQ25185` &nbsp;`embedded`

A wearable ECG recorder. An **ADS1292** analog front-end captures the electrode signal, an **nRF52840 Sense Plus** runs the device, and a **BQ25185** handles power and charging. The hardware side of what I study on Medical Informatics.

</td>
<td width="50%" valign="top">

### 🎓 &nbsp;Smart Campus PWR

`Kotlin` &nbsp;`Android`

An Android app for students of Wrocław University of Science and Technology — everyday campus business gathered in one place, instead of bouncing between five separate university systems.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🥗 &nbsp;NeuroDiet AI

`Flutter` &nbsp;`Dart` &nbsp;`LLM`

A Flutter app that puts an LLM behind meal planning — it reads what you actually eat and adapts, rather than handing you a static calorie table.

</td>
<td width="50%" valign="top">

### 🧠 &nbsp;AI Doktor

`LLM` &nbsp;`web`

A web-based medical assistant built on an LLM — it runs the initial interview and turns loose symptoms into something structured. Triage support, not a diagnosis.

</td>
</tr>
</table>

> [!NOTE]
> These live in private repositories, so there are no links — descriptions only.

<img src="assets/divider.svg" width="100%" alt="">

## &nbsp;Stats

<div align="center">

  <img height="190" src="assets/stats.svg" alt="GitHub stats">
  <img height="190" src="assets/langs.svg" alt="Most used languages">

  <br><br>

  <img height="190" src="https://streak-stats.demolab.com?user=NikodemJachec99&background=0D1117&border=30363D&stroke=30363D&ring=58A6FF&fire=58A6FF&currStreakLabel=58A6FF&sideLabels=C9D1D9&currStreakNum=E6EDF3&sideNums=E6EDF3&dates=8B949E&border_radius=10" alt="Commit streak">

  <br><br>

  <img width="98%" src="https://github-readme-activity-graph.vercel.app/graph?username=NikodemJachec99&custom_title=Contribution%20Activity&bg_color=0D1117&color=C9D1D9&title_color=58A6FF&line=58A6FF&point=3FB950&area=true&area_color=1F6FEB&hide_border=false&border_color=30363D&radius=10" alt="Contribution activity graph">

</div>

<img src="assets/divider.svg" width="100%" alt="">

## &nbsp;Snake eating my contributions

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NikodemJachec99/NikodemJachec99/output/snake-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/NikodemJachec99/NikodemJachec99/output/snake.svg">
    <img alt="Snake eating the contribution grid" src="https://raw.githubusercontent.com/NikodemJachec99/NikodemJachec99/output/snake.svg">
  </picture>
</div>

<img src="assets/divider.svg" width="100%" alt="">

## &nbsp;Contact

<div align="center">
  <a href="mailto:nikodem@automee.pl">
    <img src="https://img.shields.io/badge/nikodem@automee.pl-161B22?style=for-the-badge&logo=maildotru&logoColor=58A6FF" alt="E-mail">
  </a>
  <a href="https://medinf.pwr.edu.pl/">
    <img src="https://img.shields.io/badge/Medical_Informatics-PWR-161B22?style=for-the-badge&logo=googlescholar&logoColor=C9D1D9" alt="Medical Informatics @ PWR">
  </a>
  <a href="https://github.com/BioAddMed">
    <img src="https://img.shields.io/badge/KN_BioAddMed-161B22?style=for-the-badge&logo=github&logoColor=C9D1D9" alt="KN BioAddMed">
  </a>
</div>

<img src="assets/divider.svg" width="100%" alt="">

<div align="center">
  <sub>Got a process eating your team's time? It can probably be automated. Get in touch.</sub>
</div>
