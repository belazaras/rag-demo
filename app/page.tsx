"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import PitchChat from "@/components/PitchChat";
import AvatarRing from "@/components/AvatarRing";

export default function HomePhoto() {
  const caseStudies = React.useMemo(
    () => [
      {
      id: "taygra",
      title: "Taygra Shoes - Headless Shopify Replatform",
      client: "Consumer DTC Footwear",
      images: [
        "/work/taygra-cover.jpg",
        "/work/taygra-2.png",
        "/work/taygra-3.png",
      ],
      summary:
        "Built and continuously improved a custom Shopify Hydrogen storefront for international ecommerce delivery and conversion performance.",
      outcomes: [
        "Multi-warehouse and country-aware shopping flow",
        "Extended product variant handling beyond native limits",
        "Personalized UX via saved location and size preferences",
      ],
      links: [
        {
          label: "Live Store",
          href: "https://www.taygra.shoes/",
        },
      ],
    },
    {
      id: "sambat",
      title: "Sambat Maple Bat - Headless Shopify + 3D Configurator",
      client: "Premium Ecommerce Build",
      images: ["/work/sambat-1.png", "/work/sambat-cover.png", "/work/sambat-3.png"],
      summary:
        "Built a Hydrogen storefront from scratch with a real-time 3D customizer, integrating complex product and pricing state with Shopify logic.",
      outcomes: [
        "Premium interactive UX aligned with brand positioning",
        "Complex configurator state wired to ecommerce flows",
        "Production-grade responsive behavior across breakpoints",
      ],
      links: [
      ],
    },
    {
      id: "eda-studio",
      title: "Studio EDA - Booking & Scheduling Platform",
      client: "Operations Platform",
      images: ["/work/eda-studio-cover.jpeg", "/work/eda-studio-2.jpeg"],
      summary:
        "Built booking workflows with time-based logic, auth roles, and transactional backend behavior across frontend and API layers.",
      outcomes: [
        "Reliable state transitions for scheduling logic",
        "Operational dashboards and role-based access control",
        "End-to-end delivery from UI to backend workflows",
      ],
      links: [
      ],
    },
    {
      id: "poker-trainer",
      title: "Poker Trainer - Solver-Driven Training Platform",
      client: "EdTech / Gaming Product",
      images: [
        "/work/poker-trainer-1.png",
        "/work/poker-trainer-2.png",
        "/work/poker-trainer-3.png",
      ],
      summary:
        "Built a full-stack training system that turns raw solver outputs into interactive poker drills with grading and session tracking.",
      outcomes: [
        "Automated solver data ingestion and pack generation",
        "Dynamic drill generation across boards, streets, and spots",
        "Mixed-frequency grading and progression analytics",
      ],
      links: [],
    },
    {
      id: "ip-tracker",
      title: "IP-Based Pricing & Experimentation Tracker",
      client: "Shopify Custom System",
      images: ["/projects/work-placeholder.svg"],
      summary:
        "Built a custom pre-Hydrogen pricing engine with IP/cookie tier assignment, tier persistence, and analytics instrumentation.",
      outcomes: [
        "Geo + cookie logic for stable tier assignment",
        "A/B testing support for dynamic pricing strategies",
        "Tracked product view, add-to-cart, and checkout events",
      ],
      links: [],
    },
    {
      id: "placemarker",
      title: "PlaceMarker",
      client: "Product Build",
      images: [
        "/work/placemarker-cover.jpeg",
        "/work/placemarker-2.jpeg",
        "/work/placemarker-3.jpeg",
      ],
      summary:
        "Built and shipped frontend/product implementation work with responsive UX and production-focused delivery.",
      outcomes: [
        "Clean, user-focused interface implementation",
        "Fast iteration with pragmatic delivery scope",
        "Production-ready handoff and maintainability",
      ],
      links: [],
      },
    ],
    [],
  );
  const testimonials = [
    {
      quote:
        "It's always a pleasure working with this developer. He's intelligent, quickly understands the requirements, and consistently delivers exactly what's expected, often going above and beyond. He has worked on web development using various modern stacks and has proven to be highly versatile. Reliable, communicative, and a great problem solver. Highly recommended.",
      author: "JP Dupere, taygra.shoes",
      source: "Contra · Verified Client Review · Oct 31, 2025",
      rating: "Featured testimonial",
    },
    {
      quote:
        "I have worked with hundreds of developers over my career and Nico is one of the best. It is rare to find a developer who is patient, can communicate ideas, and so well rounded in his skills.",
      author: "Upwork Client",
      source: "Upwork · Full Stack React/Node Developer Needed",
      rating: "5.0/5",
    },
    {
      quote:
        "Nicolas did an excellent job. Required no support on our end, and substantially increased our site speed, which was a major issue for us. Will hire again.",
      author: "Upwork Client",
      source: "Upwork · Shopify Developer Needed for Site Speed Issues",
      rating: "5.0/5",
    },
    {
      quote:
        "Working with Nicolas was perfect. Great communication, fast/efficient work and very reliable. Delivered all his promises on time and exceeded expectations.",
      author: "jordanamz",
      source: "Fiverr · Shopify Custom App Development",
      rating: "5.0/5",
    },
    {
      quote:
        "We tried a lot of developers to find a solution for our complex problem. nbelazaras did a perfect job. Skilled developer!",
      author: "karims",
      source: "Fiverr · Shopify Custom App Development",
      rating: "5.0/5",
    },
    {
      quote:
        "Seller was very professional and delivered early with excellent results... Highly recommend.",
      author: "ryancornell610",
      source: "Fiverr · Shopify Bug Fix",
      rating: "5.0/5",
    },
    {
      quote:
        "Nicolas has been an absolute pleasure to work with... He went above and beyond our expectations as a developer and provided us with a completely customized solution for our business needs.",
      author: "Upwork Client",
      source: "Upwork · Shop Page - 3 into 1",
      rating: "5.0/5",
    },
  ];
  const [carouselIndex, setCarouselIndex] = React.useState<Record<string, number>>({});
  const [lightbox, setLightbox] = React.useState<{ studyId: string; index: number } | null>(null);

  const getStudyImage = (studyId: string, images: string[]) => {
    const idx = carouselIndex[studyId] ?? 0;
    return images[((idx % images.length) + images.length) % images.length];
  };

  const stepStudy = (studyId: string, imagesLength: number, step: number) => {
    setCarouselIndex((prev) => {
      const current = prev[studyId] ?? 0;
      return {
        ...prev,
        [studyId]: (current + step + imagesLength) % imagesLength,
      };
    });
  };

  React.useEffect(() => {
    if (!lightbox) return;
    const study = caseStudies.find((item) => item.id === lightbox.studyId);
    if (!study) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
      } else if (event.key === "ArrowRight") {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index + 1) % study.images.length,
              }
            : prev,
        );
      } else if (event.key === "ArrowLeft") {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index - 1 + study.images.length) % study.images.length,
              }
            : prev,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, caseStudies]);

  return (
    <main className="relative">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-24 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full blur-[120px] opacity-10 gradient-bg" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-16">
        {/* NAV spacer if using sticky navbar */}
        <div className="h-2" />

        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          {/* Left: copy/CTAs */}
          <div className="grid gap-4">
            <div className="flex items-center justify-center">
              <AvatarRing>
                <Image
                  src="/nico.jpg"
                  alt="Nico Belazaras portrait"
                  width={192}
                  height={192}
                  className="h-48 w-48 rounded-full object-cover object-center translate-y-1 translate-x-1"
                />
              </AvatarRing>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                <span className="h-2 w-2 rounded-full gradient-bg" />
                Open to contract work
              </div>

              <h1 className="text-4xl leading-tight md:text-5xl font-semibold">
                <span className="gradient-text">Senior Full-Stack Engineer</span>
                <br />
                React, Node.js, and Data Platforms
              </h1>

              <p className="text-white/70 max-w-xl">
                I help founders and agencies ship revenue-critical web products.
                Primary focus: headless ecommerce, full-stack TypeScript +
                Node.js systems, React Native mobile apps, and AI workflows
                that actually fit operations.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="#work"
                  className="rounded-xl px-5 py-3 font-medium text-white button-glow gradient-bg"
                >
                  View Case Studies
                </Link>
                <Link
                  href="/rag"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-medium text-white/90 hover:bg-white/10"
                >
                  Open RAG Demo
                </Link>
                <a
                  href="https://www.linkedin.com/in/belazaras/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-medium text-white/90 hover:bg-white/10"
                >
                  LinkedIn
                </a>
                <a
                  href="mailto:belazaras@live.com"
                  className="text-sm underline text-white/70 hover:text-white"
                >
                  belazaras@live.com
                </a>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "10+ years in production delivery",
                  "React / Next.js / Remix",
                  "Node.js backend architecture",
                  "AWS + Supabase + PostgreSQL",
                  "React Native",
                  "Python",
                  "Ruby / Rails",
                  "Shopify Hydrogen / Storefront API",
                ].map((t) => (
                  <span
                    key={t}
                    className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: chat card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-2 md:p-3 shadow-[0_0_40px_rgba(0,0,0,0.15)]">
            <PitchChat />
          </div>
        </section>

        {/* Services */}
        <section id="services" className="space-y-4">
          <h2 className="text-2xl font-semibold">Specialized Services</h2>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Headless Ecommerce",
                desc: "Shopify Hydrogen/Remix storefronts built from Figma to production with performance and conversion focus.",
              },
              {
                title: "Full-Stack Product Build",
                desc: "From architecture to shipped web/mobile features across React frontends, Node.js APIs, and data workflows.",
              },
              {
                title: "Data & Real-Time Systems",
                desc: "API integrations, queue/background processing, and event-driven services for reliable operations.",
              },
              {
                title: "AI Productization",
                desc: "RAG assistants and automation pipelines connected to real business context and usable interfaces.",
              },
            ].map((it) => (
              <li
                key={it.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition"
              >
                <div className="font-medium">{it.title}</div>
                <p className="mt-1 text-sm text-white/70">{it.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Work */}
        <section id="work" className="space-y-4">
          <h2 className="text-2xl font-semibold">Selected Work</h2>
          <p className="text-sm text-white/65 max-w-3xl">
            I operate as a focused specialist for clear client positioning:
            headless ecommerce and full-stack product delivery. Under the hood,
            that includes web, mobile, data-intensive services, and AI when
            needed for the business outcome.
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {caseStudies.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition"
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({
                        studyId: item.id,
                        index: carouselIndex[item.id] ?? 0,
                      })
                    }
                    className="block w-full text-left"
                  >
                    <Image
                      src={getStudyImage(item.id, item.images)}
                      alt={item.title}
                      width={800}
                      height={420}
                      className="h-48 w-full object-cover"
                    />
                  </button>
                  {item.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => stepStudy(item.id, item.images.length, -1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 px-2 py-1 text-sm text-white/90 hover:bg-black/65"
                        aria-label={`Previous image for ${item.title}`}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => stepStudy(item.id, item.images.length, 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 px-2 py-1 text-sm text-white/90 hover:bg-black/65"
                        aria-label={`Next image for ${item.title}`}
                      >
                        ›
                      </button>
                      <div className="absolute bottom-2 right-2 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-xs text-white/85">
                        {(carouselIndex[item.id] ?? 0) + 1}/{item.images.length}
                      </div>
                    </>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wide text-white/50">
                    {item.client}
                  </div>
                  <h3 className="mt-2 text-lg font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.summary}</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/80">
                    {item.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full gradient-bg" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {item.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-sm underline underline-offset-2"
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Client Feedback</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Upwork Job Success",
                value: "100%",
                detail: "Top-rated delivery consistency",
              },
              {
                label: "Platform Orders",
                value: "135+",
                detail: "Upwork (68) + Fiverr (67)",
              },
              {
                label: "Upwork Total Hours",
                value: "985",
                detail: "68 total jobs completed",
              },
            ].map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="text-xs uppercase tracking-wide text-white/50">
                  {metric.label}
                </div>
                <div className="mt-2 text-2xl font-semibold">{metric.value}</div>
                <p className="mt-1 text-sm text-white/70">{metric.detail}</p>
              </article>
            ))}
          </div>
          <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 md:p-8">
            <div className="text-xs uppercase tracking-wide text-white/55">
              Featured Testimonial
            </div>
            <p className="mt-3 text-base md:text-lg text-white/90">
              &ldquo;{testimonials[0].quote}&rdquo;
            </p>
            <div className="mt-5 text-sm text-white/65">
              <div className="font-medium text-white/85">{testimonials[0].author}</div>
              <div>{testimonials[0].source}</div>
            </div>
          </article>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.slice(1).map((item) => (
              <article
                key={`${item.author}-${item.source}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-sm text-white/85">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-4 text-xs text-white/60">
                  <div className="font-medium text-white/80">{item.author}</div>
                  <div>{item.source}</div>
                  <div className="mt-1">{item.rating}</div>
                </div>
              </article>
            ))}
          </div>
          <p className="text-sm text-white/65">
            More proof available on{" "}
            <a
              className="underline"
              href="https://www.upwork.com/freelancers/~01a6e19abae095fc43"
              target="_blank"
              rel="noreferrer"
            >
              Upwork
            </a>{" "}
            and{" "}
            <a
              className="underline"
              href="https://www.fiverr.com/nbelazaras"
              target="_blank"
              rel="noreferrer"
            >
              Fiverr
            </a>
            .
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="text-2xl font-semibold">How I Engage</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-white/90">Best Fit</h3>
              <p className="mt-2 text-sm text-white/70">
                Founders, operators, and agencies that need senior execution on
                complex web and ecommerce builds without long onboarding cycles.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/90">
                Engagement Models
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Project-based delivery, fractional engineering support, or
                short discovery and architecture sprints for new initiatives.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/90">Process</h3>
              <p className="mt-2 text-sm text-white/70">
                Clarify outcomes, define scope, build production-ready systems,
                and keep technical decisions transparent for stakeholders.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Let&apos;s Build</h2>
          <p className="text-white/70">
            If you are pitching clients on LinkedIn or staffing agency projects,
            I can support architecture, build, and delivery as a senior
            full-stack partner.
          </p>
          <p className="text-white/80">
            <a className="underline" href="mailto:belazaras@live.com">
              belazaras@live.com
            </a>
            {" · "}
            <a
              className="underline"
              href="https://www.linkedin.com/in/belazaras/"
              target="_blank"
            >
              LinkedIn
            </a>
          </p>
        </section>
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 p-4 md:p-8">
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-white/75">
                {
                  caseStudies.find((item) => item.id === lightbox.studyId)?.title
                }{" "}
                · {lightbox.index + 1}/
                {
                  caseStudies.find((item) => item.id === lightbox.studyId)?.images
                    .length
                }
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/85 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <Image
                src={
                  caseStudies.find((item) => item.id === lightbox.studyId)?.images[
                    lightbox.index
                  ] ?? "/projects/work-placeholder.svg"
                }
                alt="Project screenshot fullscreen"
                fill
                className="object-contain"
              />
              {(
                caseStudies.find((item) => item.id === lightbox.studyId)?.images
                  .length ?? 0
              ) > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) => {
                        if (!prev) return prev;
                        const study = caseStudies.find(
                          (item) => item.id === prev.studyId,
                        );
                        if (!study) return prev;
                        return {
                          ...prev,
                          index:
                            (prev.index - 1 + study.images.length) %
                            study.images.length,
                        };
                      })
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xl text-white/90 hover:bg-black/75"
                    aria-label="Previous fullscreen image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) => {
                        if (!prev) return prev;
                        const study = caseStudies.find(
                          (item) => item.id === prev.studyId,
                        );
                        if (!study) return prev;
                        return {
                          ...prev,
                          index: (prev.index + 1) % study.images.length,
                        };
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xl text-white/90 hover:bg-black/75"
                    aria-label="Next fullscreen image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
