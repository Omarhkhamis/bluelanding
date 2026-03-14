import "server-only";

import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { newDb } from "pg-mem";
import { Pool, type PoolClient } from "pg";
import {
  badges,
  beforeAfterItems,
  certificatesGalleryDefaults,
  clinicGallery,
  faqItems,
  googleReviewsDefaults,
  heroGridImages,
  hotelFeatures,
  influencerVideos,
  lpbmFooterDefaults,
  lpbmHeaderDefaults,
  lpbmHeroDefaults,
  luckySpinDefaults,
  navLinks,
  serviceDetailCards,
  services,
  socialLinks,
  teamMembers,
  treatmentMatrixDefaults,
  trustpilotReviewsDefaults,
  whatsappUrl,
  whyChooseItems
} from "@/lib/site-data";
import { getSafeWhatsAppUrl } from "@/lib/whatsapp";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

type JsonValue = Record<string, unknown> | Array<unknown> | null;

export type SiteSettings = {
  locale: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  whatsappUrl: string;
};

export type SocialLink = {
  id: number;
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
};

export type FooterSettings = {
  locale: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  copyrightText: string;
  socialLinks: SocialLink[];
};

export type SeoSettings = {
  locale: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImageUrl: string;
  robots: string;
  canonicalUrl: string;
};

export type CustomCode = {
  id: number;
  name: string;
  placement: string;
  code: string;
  isActive: boolean;
};

export type SectionItem = {
  id: number;
  sectionKey: string;
  itemType: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
  settings: Record<string, unknown>;
};

export type Section = {
  id: number;
  key: string;
  locale: string;
  name: string;
  sectionType: string;
  sortOrder: number;
  isActive: boolean;
  heading: string;
  subheading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl: string;
  settings: Record<string, unknown>;
  items: SectionItem[];
};

export type MediaAsset = {
  id: number;
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  category: string;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
};

export type FormSubmission = {
  id: number;
  locale: string;
  source: string;
  formName: string;
  page: string;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export const supportedDashboardLocales = ["en", "ru"] as const;
export type DashboardLocale = (typeof supportedDashboardLocales)[number];
export const managedPageKeys = ["thankyou", "privacy-policy", "terms"] as const;
export type ManagedPageKey = (typeof managedPageKeys)[number];

export type ManagedPage = {
  id: number;
  key: ManagedPageKey;
  locale: string;
  title: string;
  content: string;
  updatedAt: string;
};

const defaultManagedPageCopy: Record<
  ManagedPageKey,
  Record<DashboardLocale, { title: string; content: string }>
> = {
  thankyou: {
    en: {
      title: "Thank You",
      content:
        "Thank you for trusting our clinic.\n\nWe received your request and are preparing the best plan for you.\n\nA patient coordinator will review your details, call you to confirm the next steps, and share the available time slots.\n\nIf you would like to talk now, use the call or WhatsApp buttons below."
    },
    ru: {
      title: "Спасибо",
      content:
        "Спасибо за доверие к нашей клинике.\n\nМы получили ваш запрос и готовим для вас лучший план лечения.\n\nКоординатор по работе с пациентами рассмотрит ваши данные, свяжется с вами по телефону, чтобы подтвердить следующие шаги, и сообщит о доступных временных слотах.\n\nЕсли хотите поговорить сейчас, воспользуйтесь кнопками звонка или WhatsApp ниже."
    }
  },
  "privacy-policy": {
    en: {
      title: "Privacy Policy",
      content:
        "We value your privacy and are committed to protecting your personal information.\n\nWe only collect data that is necessary to provide our services, improve your experience, and communicate with you when needed.\n\nWe do not sell or share your information with third parties except where required by law or to deliver services you have requested.\n\nYou can request access to your data or ask us to delete it at any time by contacting our support team."
    },
    ru: {
      title: "Политика конфиденциальности",
      content:
        "Мы ценим вашу конфиденциальность и обязуемся защищать вашу личную информацию.\n\nМы собираем только те данные, которые необходимы для предоставления услуг, улучшения вашего опыта и связи с вами при необходимости.\n\nМы не продаём и не передаём вашу информацию третьим лицам, кроме случаев, предусмотренных законом или необходимых для оказания запрошенных вами услуг.\n\nВы можете запросить доступ к своим данным или попросить удалить их в любое время, связавшись с нашей службой поддержки."
    }
  },
  terms: {
    en: {
      title: "Terms",
      content:
        "By using this website, you agree to the following terms and conditions.\n\nAll content is provided for informational purposes only and does not replace professional medical advice.\n\nAppointments, pricing, and treatment plans are confirmed after clinical assessment.\n\nWe reserve the right to update these terms at any time. Continued use of the website indicates your acceptance of any changes."
    },
    ru: {
      title: "Условия",
      content:
        "Используя этот сайт, вы соглашаетесь со следующими условиями.\n\nВся информация предоставляется только в ознакомительных целях и не заменяет профессиональную медицинскую консультацию.\n\nЗаписи, стоимость и планы лечения подтверждаются после клинической оценки.\n\nМы оставляем за собой право обновлять эти условия в любое время. Продолжая пользоваться сайтом, вы подтверждаете согласие с изменениями."
    }
  }
};

type SeedSection = {
  key: string;
  name: string;
  sectionType: string;
  sortOrder: number;
  heading?: string;
  subheading?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  imageUrl?: string;
  settings?: JsonValue;
  items?: Array<{
    itemType: string;
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    altText?: string;
    sortOrder: number;
    settings?: JsonValue;
  }>;
};

function getExtendedSectionSeeds(): SeedSection[] {
  return [
    {
      key: "team",
      name: "Team",
      sectionType: "collection",
      sortOrder: 2,
      heading: "Meet The Team Supporting Your Smile Journey",
      items: teamMembers.map((item, index) => ({
        itemType: "team-member",
        title: item.title,
        description: item.description,
        imageUrl: item.image,
        sortOrder: index
      }))
    },
    {
      key: "header-2",
      name: "Header 2",
      sectionType: "navigation",
      sortOrder: -1,
      heading: "Header 2",
      settings: {
        ...lpbmHeaderDefaults,
        variant: "lpbm"
      }
    },
    {
      key: "hero-2",
      name: "Hero 2",
      sectionType: "static",
      sortOrder: 0,
      heading: lpbmHeroDefaults.titleLine1,
      subheading: lpbmHeroDefaults.kicker,
      description: lpbmHeroDefaults.subtitle,
      buttonLabel: lpbmHeroDefaults.whatsappCta,
      buttonUrl: whatsappUrl,
      imageUrl: "/uploads/bm/hero-2.jpg",
      settings: {
        ...lpbmHeroDefaults,
        variant: "lpbm"
      },
      items: [
        ...heroGridImages.map((imageUrl, index) => ({
          itemType: "image",
          imageUrl,
          altText: `Hero 2 image ${index + 1}`,
          sortOrder: index
        })),
        ...badges.map((badge, index) => ({
          itemType: "badge",
          title: badge.alt,
          imageUrl: badge.src,
          altText: badge.alt,
          sortOrder: 100 + index
        }))
      ]
    },
    {
      key: "footer",
      name: "Footer",
      sectionType: "static",
      sortOrder: 999,
      heading: "Footer",
      settings: lpbmFooterDefaults
    },
    {
      key: "footer-2",
      name: "Footer 2",
      sectionType: "static",
      sortOrder: 999,
      heading: "Footer 2",
      settings: {
        ...lpbmFooterDefaults,
        variant: "lpbm"
      }
    },
    {
      key: "treatment-matrix",
      name: "Treatment Matrix",
      sectionType: "matrix",
      sortOrder: 11,
      heading: treatmentMatrixDefaults.title,
      subheading: treatmentMatrixDefaults.kicker,
      description: treatmentMatrixDefaults.description,
      settings: {
        columns: treatmentMatrixDefaults.columns,
        rows: treatmentMatrixDefaults.rows.map((values) => ({ values }))
      }
    },
    {
      key: "certificates-gallery",
      name: "Certificates Gallery",
      sectionType: "gallery",
      sortOrder: 12,
      heading: certificatesGalleryDefaults.title,
      subheading: certificatesGalleryDefaults.kicker,
      description: certificatesGalleryDefaults.description,
      items: certificatesGalleryDefaults.items.map((item, index) => ({
        itemType: "image",
        imageUrl: item.image,
        altText: item.alt,
        sortOrder: index
      }))
    },
    {
      key: "google-reviews",
      name: "Google Reviews",
      sectionType: "reviews",
      sortOrder: 13,
      heading: googleReviewsDefaults.title,
      subheading: googleReviewsDefaults.kicker,
      description: googleReviewsDefaults.description,
      buttonLabel: googleReviewsDefaults.ctaText,
      buttonUrl: whatsappUrl,
      settings: {
        provider: "google",
        rating: googleReviewsDefaults.rating,
        ratingCountLabel: googleReviewsDefaults.ratingCountLabel
      },
      items: googleReviewsDefaults.items.map((item, index) => ({
        itemType: "review",
        title: item.name,
        subtitle: item.count,
        description: item.text,
        altText: item.initials,
        sortOrder: index
      }))
    },
    {
      key: "trustpilot-reviews",
      name: "Trustpilot Reviews",
      sectionType: "reviews",
      sortOrder: 14,
      heading: trustpilotReviewsDefaults.title,
      subheading: trustpilotReviewsDefaults.kicker,
      description: trustpilotReviewsDefaults.description,
      buttonLabel: trustpilotReviewsDefaults.ctaText,
      buttonUrl: whatsappUrl,
      settings: {
        provider: "trustpilot",
        rating: trustpilotReviewsDefaults.rating,
        ratingCountLabel: trustpilotReviewsDefaults.ratingCountLabel
      },
      items: trustpilotReviewsDefaults.items.map((item, index) => ({
        itemType: "review",
        title: item.name,
        subtitle: item.count,
        description: item.text,
        altText: item.initials,
        sortOrder: index
      }))
    },
    {
      key: "lucky-spin",
      name: "Lucky Spin",
      sectionType: "interactive",
      sortOrder: 15,
      heading: luckySpinDefaults.title,
      subheading: luckySpinDefaults.kicker,
      description: luckySpinDefaults.description,
      buttonLabel: luckySpinDefaults.spinLabel,
      buttonUrl: whatsappUrl,
      imageUrl: luckySpinDefaults.backgroundImage,
      settings: {
        tagline: luckySpinDefaults.tagline,
        resultLabel: luckySpinDefaults.resultLabel,
        resultPlaceholder: luckySpinDefaults.resultPlaceholder,
        spinLoadingLabel: luckySpinDefaults.spinLoadingLabel,
        prizes: luckySpinDefaults.prizes,
        formTitle: luckySpinDefaults.formTitle,
        formDescription: luckySpinDefaults.formDescription,
        formSubmitText: luckySpinDefaults.formSubmitText,
        formPrivacyNote: luckySpinDefaults.formPrivacyNote,
        backgroundAlt: luckySpinDefaults.backgroundAlt
      }
    }
  ];
}

async function insertSeedSection(client: PoolClient, locale: string, section: SeedSection) {
  await client.query(
    `
      INSERT INTO sections (
        section_key, locale, name, section_type, sort_order, is_active, heading, subheading,
        description, button_label, button_url, image_url, settings_json
      ) VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, $8, $9, $10, $11, $12::jsonb)
    `,
    [
      section.key,
      locale,
      section.name,
      section.sectionType,
      section.sortOrder,
      section.heading || null,
      section.subheading || null,
      section.description || null,
      section.buttonLabel || null,
      section.buttonUrl || null,
      section.imageUrl || null,
      JSON.stringify(section.settings || null)
    ]
  );

  for (const item of section.items || []) {
    await client.query(
      `
        INSERT INTO section_items (
          section_key, locale, item_type, title, subtitle, description, image_url,
          video_url, link_url, alt_text, sort_order, is_active, settings_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, $12::jsonb)
      `,
      [
        section.key,
        locale,
        item.itemType,
        item.title || null,
        item.subtitle || null,
        item.description || null,
        item.imageUrl || null,
        item.videoUrl || null,
        item.linkUrl || null,
        item.altText || null,
        item.sortOrder,
        JSON.stringify(item.settings || null)
      ]
    );
  }
}

type AdminAuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  isActive: boolean;
};

function getPool() {
  const globalScope = globalThis as unknown as { __cmsPool?: Pool };

  if (globalScope.__cmsPool) {
    return globalScope.__cmsPool;
  }

  let pool: Pool;

  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  } else {
    const memoryDb = newDb();
    const adapter = memoryDb.adapters.createPg();
    pool = new adapter.Pool();
  }

  globalScope.__cmsPool = pool;
  return pool;
}

const pool = getPool();
let initPromise: Promise<void> | null = null;

function parseJson<T>(value: unknown): T | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }

  return value as T;
}

function getLegacyHeroNavLinks(settings: unknown) {
  return (
    parseJson<{ navLinks?: Array<{ href: string; label: string }> }>(settings)?.navLinks ||
    navLinks
  );
}

function normalizeManagedLocale(locale?: string): DashboardLocale {
  return supportedDashboardLocales.includes(locale as DashboardLocale)
    ? (locale as DashboardLocale)
    : "en";
}

function getManagedPageDefault(
  key: ManagedPageKey,
  locale?: string
): { title: string; content: string } {
  const normalizedLocale = normalizeManagedLocale(locale);
  return defaultManagedPageCopy[key][normalizedLocale];
}

export function getManagedPagePath(key: ManagedPageKey) {
  return key === "thankyou" ? "/thankyou" : `/${key}`;
}

async function backfillDefaultPages() {
  for (const key of managedPageKeys) {
    for (const locale of supportedDashboardLocales) {
      const page = getManagedPageDefault(key, locale);
      await pool.query(
        `
          INSERT INTO pages (page_key, locale, title, content, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (page_key, locale) DO NOTHING
        `,
        [key, locale, page.title, page.content]
      );
    }
  }
}

async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function initCms() {
  if (!initPromise) {
    initPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS locales (
          code TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          direction TEXT NOT NULL DEFAULT 'ltr',
          is_default BOOLEAN NOT NULL DEFAULT FALSE,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS site_settings (
          locale TEXT PRIMARY KEY,
          site_name TEXT NOT NULL,
          site_title TEXT NOT NULL,
          site_description TEXT,
          logo_url TEXT,
          favicon_url TEXT,
          whatsapp_url TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS footer_settings (
          locale TEXT PRIMARY KEY,
          logo_url TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          copyright_text TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS social_links (
          id SERIAL PRIMARY KEY,
          locale TEXT NOT NULL,
          platform TEXT NOT NULL,
          label TEXT NOT NULL,
          url TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS seo_settings (
          locale TEXT PRIMARY KEY,
          meta_title TEXT,
          meta_description TEXT,
          meta_keywords TEXT,
          og_image_url TEXT,
          robots TEXT,
          canonical_url TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS custom_codes (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          placement TEXT NOT NULL,
          code TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sections (
          id SERIAL PRIMARY KEY,
          section_key TEXT NOT NULL,
          locale TEXT NOT NULL DEFAULT 'en',
          name TEXT NOT NULL,
          section_type TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          heading TEXT,
          subheading TEXT,
          description TEXT,
          button_label TEXT,
          button_url TEXT,
          image_url TEXT,
          settings_json JSONB,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS section_items (
          id SERIAL PRIMARY KEY,
          section_key TEXT NOT NULL,
          locale TEXT NOT NULL DEFAULT 'en',
          item_type TEXT NOT NULL DEFAULT 'default',
          title TEXT,
          subtitle TEXT,
          description TEXT,
          image_url TEXT,
          video_url TEXT,
          link_url TEXT,
          alt_text TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          settings_json JSONB,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS media_assets (
          id SERIAL PRIMARY KEY,
          file_name TEXT NOT NULL UNIQUE,
          original_name TEXT NOT NULL,
          url TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL DEFAULT 0,
          alt_text TEXT,
          category TEXT NOT NULL DEFAULT 'library',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          avatar_url TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS form_submissions (
          id SERIAL PRIMARY KEY,
          locale TEXT NOT NULL DEFAULT 'en',
          source TEXT NOT NULL DEFAULT 'website',
          form_name TEXT,
          page TEXT,
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          message TEXT,
          payload_json JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS pages (
          id SERIAL PRIMARY KEY,
          page_key TEXT NOT NULL,
          locale TEXT NOT NULL DEFAULT 'en',
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_section_key_key;
        CREATE UNIQUE INDEX IF NOT EXISTS sections_section_key_locale_idx
        ON sections (section_key, locale);
        CREATE UNIQUE INDEX IF NOT EXISTS pages_page_key_locale_idx
        ON pages (page_key, locale);
      `);

      const existingSite = await pool.query(
        "SELECT locale FROM site_settings WHERE locale = 'en' LIMIT 1"
      );

      if (!existingSite.rowCount) {
        await seedCms();
      }

      await backfillDefaultPages();
    })();
  }

  return initPromise;
}

async function seedCms() {
  await withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO locales (code, label, direction, is_default, is_active)
        VALUES 
          ('en', 'English', 'ltr', TRUE, TRUE),
          ('ru', 'Russian', 'ltr', FALSE, TRUE)
      `
    );

    await client.query(
      `
        INSERT INTO site_settings (
          locale, site_name, site_title, site_description, logo_url, favicon_url, whatsapp_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        "en",
        "CevreDent",
        "CevreDent - Dental Clinic in Turkey",
        "Experience world-class dental treatments with CevreDent.",
        "/assets/images/image-005.png",
        "/assets/images/image-004.ico",
        whatsappUrl
      ]
    );

    await client.query(
      `
        INSERT INTO footer_settings (
          locale, logo_url, phone, email, address, copyright_text
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        "en",
        "/assets/images/image-027.png",
        "+90 551 862 25 25",
        "info@cevredent.com",
        "Mecidiyeköy Mahallesi, Büyükdere Cd. Ocak Apt No:91 Kat 2 Daire:2, 34387 Şişli/İstanbul",
        "© 2024 CevreDent Clinic. All rights reserved."
      ]
    );

    for (const [index, link] of socialLinks.entries()) {
      await client.query(
        `
          INSERT INTO social_links (locale, platform, label, url, sort_order)
          VALUES ($1, $2, $3, $4, $5)
        `,
        ["en", link.label.toLowerCase(), link.label, link.href, index]
      );
    }

    await client.query(
      `
        INSERT INTO seo_settings (
          locale, meta_title, meta_description, meta_keywords, og_image_url, robots, canonical_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        "en",
        "CevreDent - Dental Clinic in Turkey",
        "Affordable dental implants, veneers, crowns, and smile makeovers in Turkey.",
        "dental clinic turkey, dental implants, veneers, hollywood smile",
        "/assets/images/image-001.png",
        "index,follow",
        "https://dental.cevredentalturkey.com"
      ]
    );

    await client.query(
      `
        INSERT INTO custom_codes (name, placement, code, is_active)
        VALUES
          ('Analytics Placeholder', 'HEAD', '<!-- Add analytics code here -->', FALSE),
          ('Body Widget Placeholder', 'BODY_END', '<!-- Add widget code here -->', FALSE)
      `
    );

    const sections: SeedSection[] = [
      {
        key: "header",
        name: "Header",
        sectionType: "navigation",
        sortOrder: -1,
        heading: "Header",
        items: navLinks.map((link, index) => ({
          itemType: "nav-link",
          title: link.label,
          linkUrl: link.href,
          sortOrder: index
        }))
      },
      {
        key: "hero",
        name: "Hero",
        sectionType: "static",
        sortOrder: 0,
        heading: "Dental Clinic in Turkey",
        subheading: "Enhance Your Smile",
        description: "with CevreDent Clinic's Affordable Services",
        buttonLabel: "Get the Best Dental Solution",
        buttonUrl: whatsappUrl,
        items: [
          ...heroGridImages.map((imageUrl, index) => ({
            itemType: "image",
            imageUrl,
            altText: `Hero image ${index + 1}`,
            sortOrder: index
          })),
          ...badges.map((badge, index) => ({
            itemType: "badge",
            title: badge.alt,
            imageUrl: badge.src,
            altText: badge.alt,
            sortOrder: 100 + index
          }))
        ]
      },
      {
        key: "why-choose",
        name: "Why Choose",
        sectionType: "list",
        sortOrder: 1,
        heading: "Why Choose Us?",
        subheading: "Don't Miss Out on 20% Spring Discounts!",
        description:
          "Complete the form and allow our experts to promptly address any questions you may have.",
        items: whyChooseItems.map((item, index) => ({
          itemType: "feature",
          title: item.title,
          description: item.description,
          sortOrder: index
        }))
      },
      {
        key: "services",
        name: "Services",
        sectionType: "collection",
        sortOrder: 2,
        heading: "Check Out Our Highly Recommended Dental Solutions",
        buttonUrl: whatsappUrl,
        items: services.map((item, index) => ({
          itemType: "service",
          title: item.title,
          subtitle: item.packageTitle,
          imageUrl: item.image,
          sortOrder: index,
          settings: { items: item.items }
        }))
      },
      {
        key: "before-after",
        name: "Before & After",
        sectionType: "slider",
        sortOrder: 3,
        heading: "Before & After",
        buttonLabel: "Get the Best Dental Treatment",
        buttonUrl: whatsappUrl,
        items: beforeAfterItems.map((item, index) => ({
          itemType: "slide",
          title: item.title,
          subtitle: item.subtitle,
          imageUrl: item.image,
          altText: item.alt,
          sortOrder: index
        }))
      },
      {
        key: "service-details",
        name: "Service Details",
        sectionType: "cards",
        sortOrder: 4,
        heading: "CevreDent Service Details Content",
        buttonLabel: "Get Price Information",
        buttonUrl: whatsappUrl,
        items: serviceDetailCards.map((item, index) => ({
          itemType: "detail-card",
          title: item.title,
          description: item.description,
          sortOrder: index
        }))
      },
      {
        key: "hotel",
        name: "Hotel",
        sectionType: "static",
        sortOrder: 5,
        heading: "Exclusive 5-Star Stay: Mercure Hotel",
        description:
          "Your comfort is our priority! We host all our patients at the luxurious 5-star Mercure Hotel. Recover in style with premium amenities, a central location, and the exceptional hospitality you deserve during your smooth dental treatment journey.",
        imageUrl: "/assets/images/image-020.jpg",
        items: hotelFeatures.map((title, index) => ({
          itemType: "feature",
          title,
          sortOrder: index
        }))
      },
      {
        key: "clinic-gallery",
        name: "Clinic Gallery",
        sectionType: "gallery",
        sortOrder: 6,
        heading: "Discover Our Clinic with Photos",
        items: clinicGallery.map((imageUrl, index) => ({
          itemType: "image",
          imageUrl,
          altText: `Clinic Photo ${index + 1}`,
          sortOrder: index
        }))
      },
      {
        key: "consultation-virtual",
        name: "Consultation CTA Virtual",
        sectionType: "cta",
        sortOrder: 7,
        heading: "Free Online Consultation",
        subheading: "Virtual Consultation:",
        description: "Connect with us before your surgery for a personalized pre-op meeting",
        buttonLabel: "Contact Us",
        buttonUrl: whatsappUrl
      },
      {
        key: "influencers",
        name: "Influencers",
        sectionType: "videos",
        sortOrder: 8,
        heading: "Youtube Influencer Videos",
        items: influencerVideos.map((item, index) => ({
          itemType: "video",
          title: item.title,
          description: item.description,
          sortOrder: index
        }))
      },
      {
        key: "consultation-online",
        name: "Consultation CTA Online",
        sectionType: "cta",
        sortOrder: 9,
        heading: "Free Online Consultation",
        subheading: "Virtual Consultation:",
        description: "Connect with us before your surgery for a personalized pre-op meeting",
        buttonLabel: "Contact Us",
        buttonUrl: whatsappUrl
      },
      {
        key: "faq",
        name: "FAQ",
        sectionType: "faq",
        sortOrder: 10,
        heading: "FAQ",
        subheading: "Don't Miss Out on 20% Spring Discounts!",
        description: "Frequently asked questions collected from the original page content.",
        items: faqItems.map((item, index) => ({
          itemType: "faq",
          title: item.question,
          description: item.answer,
          sortOrder: index
        }))
      },
      ...getExtendedSectionSeeds()
    ];

    for (const section of sections) {
      await insertSeedSection(client, "en", section);
    }

    const mediaFiles = [
      "/assets/images/image-004.ico",
      "/assets/images/image-005.png",
      "/assets/images/image-011.png",
      "/assets/images/image-012.png",
      "/assets/images/image-013.png",
      "/assets/images/image-014.svg",
      "/assets/images/image-015.webp",
      "/assets/images/image-016.webp",
      "/assets/images/image-017.webp",
      "/assets/images/image-018.webp",
      "/assets/images/image-019.webp",
      "/assets/images/image-020.jpg",
      "/assets/images/image-021.webp",
      "/assets/images/image-022.webp",
      "/assets/images/image-023.webp",
      "/assets/images/image-024.webp",
      "/assets/images/image-025.webp",
      "/assets/images/image-027.png"
    ];

    for (const mediaUrl of mediaFiles) {
      const originalName = mediaUrl.split("/").pop() || mediaUrl;
      await client.query(
        `
          INSERT INTO media_assets (file_name, original_name, url, mime_type, size_bytes, category)
          VALUES ($1, $2, $3, 'image/*', 0, 'seed')
        `,
        [originalName, originalName, mediaUrl]
      );
    }

    await client.query(
      `
        INSERT INTO admin_users (name, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, 'super_admin', TRUE)
      `,
      ["Primary Admin", "admin@cevredent.local", bcrypt.hashSync("Admin123!", 10)]
    );
  });
}

async function ensureHeaderSection(locale: string) {
  await initCms();

  const headerResult = await pool.query(
    "SELECT id FROM sections WHERE section_key = 'header' AND locale = $1 LIMIT 1",
    [locale]
  );
  const headerItemsResult = await pool.query(
    "SELECT COUNT(*)::int AS count FROM section_items WHERE section_key = 'header' AND locale = $1",
    [locale]
  );

  if (headerResult.rowCount && headerItemsResult.rows[0]?.count > 0) {
    return;
  }

  const heroResult = await pool.query(
    "SELECT settings_json FROM sections WHERE section_key = 'hero' AND locale = $1 LIMIT 1",
    [locale]
  );
  const headerLinks = getLegacyHeroNavLinks(heroResult.rows[0]?.settings_json);

  await withTransaction(async (client) => {
    if (!headerResult.rowCount) {
      await client.query(
        `
          INSERT INTO sections (
            section_key, locale, name, section_type, sort_order, is_active, heading, subheading,
            description, button_label, button_url, image_url, settings_json, updated_at
          ) VALUES ('header', $1, 'Header', 'navigation', -1, TRUE, 'Header', '', '', '', '', '', NULL, NOW())
        `,
        [locale]
      );
    }

    if (headerItemsResult.rows[0]?.count <= 0) {
      for (const [index, link] of headerLinks.entries()) {
        await client.query(
          `
            INSERT INTO section_items (
              section_key, locale, item_type, title, subtitle, description, image_url,
              video_url, link_url, alt_text, sort_order, is_active, settings_json, updated_at
            ) VALUES ('header', $1, 'nav-link', $2, '', '', '', '', $3, '', $4, TRUE, NULL, NOW())
          `,
          [locale, link.label, link.href, index]
        );
      }
    }
  });
}

async function ensureExtendedSections(locale: string) {
  await initCms();
  const sections = getExtendedSectionSeeds();

  await withTransaction(async (client) => {
    for (const section of sections) {
      const sectionResult = await client.query(
        "SELECT id FROM sections WHERE section_key = $1 AND locale = $2 LIMIT 1",
        [section.key, locale]
      );

      if (!sectionResult.rowCount) {
        await insertSeedSection(client, locale, section);
        continue;
      }

      const itemCountResult = await client.query(
        "SELECT COUNT(*)::int AS count FROM section_items WHERE section_key = $1 AND locale = $2",
        [section.key, locale]
      );
      const itemCount = itemCountResult.rows[0]?.count || 0;

      if (itemCount <= 0 && (section.items?.length || 0) > 0) {
        for (const item of section.items || []) {
          await client.query(
            `
              INSERT INTO section_items (
                section_key, locale, item_type, title, subtitle, description, image_url,
                video_url, link_url, alt_text, sort_order, is_active, settings_json
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, $12::jsonb)
            `,
            [
              section.key,
              locale,
              item.itemType,
              item.title || null,
              item.subtitle || null,
              item.description || null,
              item.imageUrl || null,
              item.videoUrl || null,
              item.linkUrl || null,
              item.altText || null,
              item.sortOrder,
              JSON.stringify(item.settings || null)
            ]
          );
        }
      }

      if (section.key === "team" && (section.items?.length || 0) > 0) {
        const existingTeamItems = await client.query(
          `
            SELECT id, sort_order, description
            FROM section_items
            WHERE section_key = 'team' AND locale = $1
            ORDER BY sort_order ASC, id ASC
          `,
          [locale]
        );

        for (const seedItem of section.items || []) {
          const matchingItem = existingTeamItems.rows.find(
            (row) => row.sort_order === seedItem.sortOrder
          );

          if (matchingItem && !(matchingItem.description || "").trim() && seedItem.description) {
            await client.query(
              `
                UPDATE section_items
                SET description = $1, updated_at = NOW()
                WHERE id = $2
              `,
              [seedItem.description, matchingItem.id]
            );
          }
        }
      }
    }
  });
}

async function ensureLocaleContent(locale: string) {
  await initCms();

  if (locale === "en") {
    await ensureHeaderSection(locale);
    await ensureExtendedSections(locale);
    return;
  }

  const localeExists = await pool.query("SELECT code FROM locales WHERE code = $1 LIMIT 1", [
    locale
  ]);

  if (!localeExists.rowCount) {
    await pool.query(
      `
        INSERT INTO locales (code, label, direction, is_default, is_active)
        VALUES ($1, $2, 'ltr', FALSE, TRUE)
      `,
      [locale, locale.toUpperCase()]
    );
  }

  const siteExists = await pool.query(
    "SELECT locale FROM site_settings WHERE locale = $1 LIMIT 1",
    [locale]
  );

  if (!siteExists.rowCount) {
    await withTransaction(async (client) => {
      await client.query(
        `
          INSERT INTO site_settings (
            locale, site_name, site_title, site_description, logo_url, favicon_url, whatsapp_url, updated_at
          )
          SELECT $1, site_name, site_title, site_description, logo_url, favicon_url, whatsapp_url, NOW()
          FROM site_settings
          WHERE locale = 'en'
        `,
        [locale]
      );

      await client.query(
        `
          INSERT INTO footer_settings (
            locale, logo_url, phone, email, address, copyright_text, updated_at
          )
          SELECT $1, logo_url, phone, email, address, copyright_text, NOW()
          FROM footer_settings
          WHERE locale = 'en'
        `,
        [locale]
      );

      await client.query(
        `
          INSERT INTO social_links (locale, platform, label, url, sort_order)
          SELECT $1, platform, label, url, sort_order
          FROM social_links
          WHERE locale = 'en'
        `,
        [locale]
      );

      await client.query(
        `
          INSERT INTO seo_settings (
            locale, meta_title, meta_description, meta_keywords, og_image_url, robots, canonical_url, updated_at
          )
          SELECT $1, meta_title, meta_description, meta_keywords, og_image_url, robots, canonical_url, NOW()
          FROM seo_settings
          WHERE locale = 'en'
        `,
        [locale]
      );

      await client.query(
        `
          INSERT INTO sections (
            section_key, locale, name, section_type, sort_order, is_active, heading, subheading,
            description, button_label, button_url, image_url, settings_json, updated_at
          )
          SELECT
            section_key, $1, name, section_type, sort_order, is_active, heading, subheading,
            description, button_label, button_url, image_url, settings_json, NOW()
          FROM sections
          WHERE locale = 'en'
        `,
        [locale]
      );

      await client.query(
        `
          INSERT INTO section_items (
            section_key, locale, item_type, title, subtitle, description, image_url,
            video_url, link_url, alt_text, sort_order, is_active, settings_json, updated_at
          )
          SELECT
            section_key, $1, item_type, title, subtitle, description, image_url,
            video_url, link_url, alt_text, sort_order, is_active, settings_json, NOW()
          FROM section_items
          WHERE locale = 'en'
        `,
        [locale]
      );
    });
  }

  await ensureHeaderSection(locale);
  await ensureExtendedSections(locale);
}

export async function getSiteSettings(locale = "en"): Promise<SiteSettings> {
  await ensureLocaleContent(locale);
  await initCms();
  const result = await pool.query(
    "SELECT * FROM site_settings WHERE locale = $1 LIMIT 1",
    [locale]
  );
  const row = result.rows[0];

  return {
    locale: row.locale,
    siteName: row.site_name,
    siteTitle: row.site_title,
    siteDescription: row.site_description || "",
    logoUrl: row.logo_url || "",
    faviconUrl: row.favicon_url || "",
    whatsappUrl: getSafeWhatsAppUrl(row.whatsapp_url)
  };
}

export async function getFooterSettings(locale = "en"): Promise<FooterSettings> {
  await ensureLocaleContent(locale);
  await initCms();
  const [footerResult, linksResult] = await Promise.all([
    pool.query("SELECT * FROM footer_settings WHERE locale = $1 LIMIT 1", [locale]),
    pool.query(
      "SELECT * FROM social_links WHERE locale = $1 ORDER BY sort_order ASC, id ASC",
      [locale]
    )
  ]);
  const row = footerResult.rows[0];

  return {
    locale: row.locale,
    logoUrl: row.logo_url || "",
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    copyrightText: row.copyright_text || "",
    socialLinks: linksResult.rows.map((link) => ({
      id: link.id,
      platform: link.platform,
      label: link.label,
      url: link.url,
      sortOrder: link.sort_order
    }))
  };
}

export async function getSeoSettings(locale = "en"): Promise<SeoSettings> {
  await ensureLocaleContent(locale);
  await initCms();
  const result = await pool.query(
    "SELECT * FROM seo_settings WHERE locale = $1 LIMIT 1",
    [locale]
  );
  const row = result.rows[0];

  return {
    locale,
    metaTitle: row?.meta_title || "",
    metaDescription: row?.meta_description || "",
    metaKeywords: row?.meta_keywords || "",
    ogImageUrl: row?.og_image_url || "",
    robots: row?.robots || "",
    canonicalUrl: row?.canonical_url || ""
  };
}

export async function getCustomCodes(): Promise<CustomCode[]> {
  await initCms();
  const result = await pool.query("SELECT * FROM custom_codes ORDER BY id ASC");
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    placement: row.placement,
    code: row.code,
    isActive: row.is_active
  }));
}

export async function getSections(locale = "en"): Promise<Section[]> {
  await ensureLocaleContent(locale);
  await initCms();
  const [sectionResult, itemResult] = await Promise.all([
    pool.query(
      "SELECT * FROM sections WHERE locale = $1 ORDER BY sort_order ASC, id ASC",
      [locale]
    ),
    pool.query(
      "SELECT * FROM section_items WHERE locale = $1 ORDER BY sort_order ASC, id ASC",
      [locale]
    )
  ]);

  return sectionResult.rows.map((section) => ({
    id: section.id,
    key: section.section_key,
    locale: section.locale,
    name: section.name,
    sectionType: section.section_type,
    sortOrder: section.sort_order,
    isActive: section.is_active,
    heading: section.heading || "",
    subheading: section.subheading || "",
    description: section.description || "",
    buttonLabel: section.button_label || "",
    buttonUrl: section.button_url || "",
    imageUrl: section.image_url || "",
    settings: parseJson<Record<string, unknown>>(section.settings_json) || {},
    items: itemResult.rows
      .filter((item) => item.section_key === section.section_key)
      .map((item) => ({
        id: item.id,
        sectionKey: item.section_key,
        itemType: item.item_type,
        title: item.title || "",
        subtitle: item.subtitle || "",
        description: item.description || "",
        imageUrl: item.image_url || "",
        videoUrl: item.video_url || "",
        linkUrl: item.link_url || "",
        altText: item.alt_text || "",
        sortOrder: item.sort_order,
        isActive: item.is_active,
        settings: parseJson<Record<string, unknown>>(item.settings_json) || {}
      }))
  }));
}

export async function getSectionByKey(
  key: string,
  locale = "en"
): Promise<Section | null> {
  const sections = await getSections(locale);
  return sections.find((section) => section.key === key) || null;
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  await initCms();
  const result = await pool.query(
    "SELECT * FROM media_assets ORDER BY created_at DESC, id DESC"
  );
  return result.rows.map((row) => ({
    id: row.id,
    fileName: row.file_name,
    originalName: row.original_name,
    url: row.url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    altText: row.alt_text || "",
    category: row.category
  }));
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await initCms();
  const result = await pool.query(
    "SELECT * FROM admin_users ORDER BY created_at ASC, id ASC"
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url || "",
    isActive: row.is_active,
    createdAt: row.created_at
  }));
}

export async function getDashboardOverview(locale = "en") {
  const [site, footer, seo, sections, mediaAssets, admins] = await Promise.all([
    getSiteSettings(locale),
    getFooterSettings(locale),
    getSeoSettings(locale),
    getSections(locale),
    getMediaAssets(),
    getAdminUsers()
  ]);

  return {
    site,
    footer,
    seo,
    sectionCount: sections.length,
    activeSectionCount: sections.filter((section) => section.isActive).length,
    mediaCount: mediaAssets.length,
    adminCount: admins.length,
    sections
  };
}

export async function getManagedPages(locale = "en"): Promise<ManagedPage[]> {
  const normalizedLocale = normalizeManagedLocale(locale);
  await initCms();
  const result = await pool.query(
    `
      SELECT *
      FROM pages
      WHERE locale = $1
      ORDER BY CASE page_key
        WHEN 'thankyou' THEN 0
        WHEN 'privacy-policy' THEN 1
        WHEN 'terms' THEN 2
        ELSE 99
      END, id ASC
    `,
    [normalizedLocale]
  );

  return result.rows.map((row) => ({
    id: row.id,
    key: row.page_key as ManagedPageKey,
    locale: row.locale,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at?.toISOString?.() || new Date().toISOString()
  }));
}

export async function getManagedPageByKey(
  key: string,
  locale = "en"
): Promise<ManagedPage | null> {
  if (!managedPageKeys.includes(key as ManagedPageKey)) {
    return null;
  }

  const normalizedLocale = normalizeManagedLocale(locale);
  await initCms();
  const result = await pool.query(
    `
      SELECT *
      FROM pages
      WHERE page_key = $1 AND locale = $2
      LIMIT 1
    `,
    [key, normalizedLocale]
  );
  const row = result.rows[0];

  if (!row) {
    const fallback = getManagedPageDefault(key as ManagedPageKey, normalizedLocale);
    return {
      id: 0,
      key: key as ManagedPageKey,
      locale: normalizedLocale,
      title: fallback.title,
      content: fallback.content,
      updatedAt: new Date().toISOString()
    };
  }

  return {
    id: row.id,
    key: row.page_key as ManagedPageKey,
    locale: row.locale,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at?.toISOString?.() || new Date().toISOString()
  };
}

export async function upsertSiteSettings(data: {
  locale?: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  whatsappUrl: string;
}) {
  await ensureLocaleContent(data.locale || "en");
  await initCms();
  await pool.query(
    `
      INSERT INTO site_settings (
        locale, site_name, site_title, site_description, logo_url, favicon_url, whatsapp_url, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (locale) DO UPDATE SET
        site_name = EXCLUDED.site_name,
        site_title = EXCLUDED.site_title,
        site_description = EXCLUDED.site_description,
        logo_url = EXCLUDED.logo_url,
        favicon_url = EXCLUDED.favicon_url,
        whatsapp_url = EXCLUDED.whatsapp_url,
        updated_at = NOW()
    `,
    [
      data.locale || "en",
      data.siteName,
      data.siteTitle,
      data.siteDescription,
      data.logoUrl,
      data.faviconUrl,
      data.whatsappUrl
    ]
  );
}

export async function upsertFooterSettings(data: {
  locale?: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  copyrightText: string;
}) {
  await ensureLocaleContent(data.locale || "en");
  await initCms();
  await pool.query(
    `
      INSERT INTO footer_settings (
        locale, logo_url, phone, email, address, copyright_text, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (locale) DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        copyright_text = EXCLUDED.copyright_text,
        updated_at = NOW()
    `,
    [
      data.locale || "en",
      data.logoUrl,
      data.phone,
      data.email,
      data.address,
      data.copyrightText
    ]
  );
}

export async function upsertManagedPage(data: {
  key: ManagedPageKey;
  locale?: string;
  title: string;
  content: string;
}) {
  const normalizedLocale = normalizeManagedLocale(data.locale);
  await initCms();
  await pool.query(
    `
      INSERT INTO pages (page_key, locale, title, content, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (page_key, locale) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = NOW()
    `,
    [data.key, normalizedLocale, data.title, data.content]
  );
}

export async function replaceSocialLinks(
  locale: string,
  links: Array<{ platform: string; label: string; url: string }>
) {
  await ensureLocaleContent(locale);
  await initCms();
  await withTransaction(async (client) => {
    await client.query("DELETE FROM social_links WHERE locale = $1", [locale]);
    for (const [index, link] of links.entries()) {
      if (!link.label && !link.url) {
        continue;
      }
      await client.query(
        `
          INSERT INTO social_links (locale, platform, label, url, sort_order)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [locale, link.platform || link.label.toLowerCase(), link.label, link.url, index]
      );
    }
  });
}

export async function upsertSeoSettings(data: {
  locale?: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImageUrl: string;
  robots: string;
  canonicalUrl: string;
}) {
  await ensureLocaleContent(data.locale || "en");
  await initCms();
  await pool.query(
    `
      INSERT INTO seo_settings (
        locale, meta_title, meta_description, meta_keywords, og_image_url, robots, canonical_url, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (locale) DO UPDATE SET
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        meta_keywords = EXCLUDED.meta_keywords,
        og_image_url = EXCLUDED.og_image_url,
        robots = EXCLUDED.robots,
        canonical_url = EXCLUDED.canonical_url,
        updated_at = NOW()
    `,
    [
      data.locale || "en",
      data.metaTitle,
      data.metaDescription,
      data.metaKeywords,
      data.ogImageUrl,
      data.robots,
      data.canonicalUrl
    ]
  );
}

export async function createCustomCode(data: {
  name: string;
  placement: string;
  code: string;
  isActive: boolean;
}) {
  await initCms();
  await pool.query(
    `
      INSERT INTO custom_codes (name, placement, code, is_active, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
    `,
    [data.name, data.placement, data.code, data.isActive]
  );
}

export async function updateCustomCode(data: {
  id: number;
  name: string;
  placement: string;
  code: string;
  isActive: boolean;
}) {
  await initCms();
  await pool.query(
    `
      UPDATE custom_codes
      SET name = $1, placement = $2, code = $3, is_active = $4, updated_at = NOW()
      WHERE id = $5
    `,
    [data.name, data.placement, data.code, data.isActive, data.id]
  );
}

export async function deleteCustomCode(id: number) {
  await initCms();
  await pool.query("DELETE FROM custom_codes WHERE id = $1", [id]);
}

export async function updateSection(data: {
  key: string;
  locale?: string;
  name: string;
  sectionType: string;
  sortOrder: number;
  isActive: boolean;
  heading: string;
  subheading: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl: string;
  settings: JsonValue;
}) {
  await ensureLocaleContent(data.locale || "en");
  await initCms();
  await pool.query(
    `
      UPDATE sections
      SET name = $1, section_type = $2, sort_order = $3, is_active = $4, heading = $5,
          subheading = $6, description = $7, button_label = $8, button_url = $9,
          image_url = $10, settings_json = $11::jsonb, updated_at = NOW()
      WHERE section_key = $12 AND locale = $13
    `,
    [
      data.name,
      data.sectionType,
      data.sortOrder,
      data.isActive,
      data.heading,
      data.subheading,
      data.description,
      data.buttonLabel,
      data.buttonUrl,
      data.imageUrl,
      JSON.stringify(data.settings || null),
      data.key,
      data.locale || "en"
    ]
  );
}

export async function upsertSectionItem(data: {
  id?: number;
  sectionKey: string;
  locale?: string;
  itemType: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
  settings: JsonValue;
}) {
  await ensureLocaleContent(data.locale || "en");
  await initCms();
  if (data.id) {
    await pool.query(
      `
        UPDATE section_items
        SET item_type = $1, title = $2, subtitle = $3, description = $4, image_url = $5,
            video_url = $6, link_url = $7, alt_text = $8, sort_order = $9,
            is_active = $10, settings_json = $11::jsonb, updated_at = NOW()
        WHERE id = $12
      `,
      [
        data.itemType,
        data.title,
        data.subtitle,
        data.description,
        data.imageUrl,
        data.videoUrl,
        data.linkUrl,
        data.altText,
        data.sortOrder,
        data.isActive,
        JSON.stringify(data.settings || null),
        data.id
      ]
    );
    return;
  }

  await pool.query(
    `
      INSERT INTO section_items (
        section_key, locale, item_type, title, subtitle, description, image_url, video_url,
        link_url, alt_text, sort_order, is_active, settings_json, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, NOW())
    `,
    [
      data.sectionKey,
      data.locale || "en",
      data.itemType,
      data.title,
      data.subtitle,
      data.description,
      data.imageUrl,
      data.videoUrl,
      data.linkUrl,
      data.altText,
      data.sortOrder,
      data.isActive,
      JSON.stringify(data.settings || null)
    ]
  );
}

export async function deleteSectionItem(id: number) {
  await initCms();
  await pool.query("DELETE FROM section_items WHERE id = $1", [id]);
}

export async function reorderSections(
  updates: Array<{ key: string; sortOrder: number; isActive: boolean }>,
  locale = "en"
) {
  await ensureLocaleContent(locale);
  await initCms();
  await withTransaction(async (client) => {
    for (const update of updates) {
      await client.query(
        `
          UPDATE sections
          SET sort_order = $1, is_active = $2, updated_at = NOW()
          WHERE section_key = $3 AND locale = $4
        `,
        [update.sortOrder, update.isActive, update.key, locale]
      );
    }
  });
}

export async function createMediaAsset(file: File, altText = "", category = "library") {
  await initCms();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
  const targetPath = path.join(uploadsDir, fileName);
  fs.writeFileSync(targetPath, buffer);

  const url = `/uploads/${fileName}`;
  await pool.query(
    `
      INSERT INTO media_assets (file_name, original_name, url, mime_type, size_bytes, alt_text, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [fileName, file.name, url, file.type || "application/octet-stream", buffer.byteLength, altText, category]
  );

  return url;
}

export async function deleteMediaAsset(id: number) {
  await initCms();
  const result = await pool.query("SELECT * FROM media_assets WHERE id = $1 LIMIT 1", [id]);
  const asset = result.rows[0];

  if (!asset) {
    return;
  }

  if (asset.url.startsWith("/uploads/")) {
    const targetPath = path.join(process.cwd(), "public", asset.url.replace(/^\//, ""));
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  }

  await pool.query("DELETE FROM media_assets WHERE id = $1", [id]);
}

export async function createFormSubmission(data: {
  locale?: string;
  source: string;
  formName?: string;
  page?: string;
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  payload?: Record<string, unknown>;
}) {
  await initCms();
  const result = await pool.query(
    `
      INSERT INTO form_submissions (
        locale, source, form_name, page, full_name, phone, email, message, payload_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      RETURNING id
    `,
    [
      data.locale || "en",
      data.source,
      data.formName || null,
      data.page || null,
      data.fullName,
      data.phone,
      data.email || null,
      data.message || null,
      JSON.stringify(data.payload || null)
    ]
  );

  return Number(result.rows[0]?.id || 0);
}

export async function getFormSubmissions(locale?: string): Promise<FormSubmission[]> {
  await initCms();
  const result = locale
    ? await pool.query(
        `
          SELECT *
          FROM form_submissions
          WHERE locale = $1
          ORDER BY created_at DESC, id DESC
        `,
        [locale]
      )
    : await pool.query(
        `
          SELECT *
          FROM form_submissions
          ORDER BY created_at DESC, id DESC
        `
      );

  return result.rows.map((row) => ({
    id: row.id,
    locale: row.locale,
    source: row.source,
    formName: row.form_name || "",
    page: row.page || "",
    fullName: row.full_name || "",
    phone: row.phone || "",
    email: row.email || "",
    message: row.message || "",
    payload: parseJson<Record<string, unknown>>(row.payload_json) || {},
    createdAt: row.created_at?.toISOString?.() || new Date().toISOString()
  }));
}

export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  avatarUrl: string;
  isActive: boolean;
}) {
  await initCms();
  await pool.query(
    `
      INSERT INTO admin_users (name, email, password_hash, role, avatar_url, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `,
    [
      data.name,
      data.email,
      bcrypt.hashSync(data.password, 10),
      data.role,
      data.avatarUrl,
      data.isActive
    ]
  );
}

export async function updateAdminUser(data: {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  avatarUrl: string;
  isActive: boolean;
}) {
  await initCms();
  const existing = await pool.query(
    "SELECT password_hash FROM admin_users WHERE id = $1 LIMIT 1",
    [data.id]
  );
  const passwordHash =
    data.password && data.password.trim()
      ? bcrypt.hashSync(data.password, 10)
      : existing.rows[0]?.password_hash;

  await pool.query(
    `
      UPDATE admin_users
      SET name = $1, email = $2, password_hash = $3, role = $4, avatar_url = $5,
          is_active = $6, updated_at = NOW()
      WHERE id = $7
    `,
    [
      data.name,
      data.email,
      passwordHash,
      data.role,
      data.avatarUrl,
      data.isActive,
      data.id
    ]
  );
}

export async function deleteAdminUser(id: number) {
  await initCms();
  const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM admin_users");
  if (countResult.rows[0].count <= 1) {
    throw new Error("Cannot delete the last remaining admin.");
  }

  await pool.query("DELETE FROM admin_users WHERE id = $1", [id]);
}

export async function getPublicSiteContent(locale = "en") {
  const [site, footer, seo, sections] = await Promise.all([
    getSiteSettings(locale),
    getFooterSettings(locale),
    getSeoSettings(locale),
    getSections(locale)
  ]);

  const get = (key: string) => sections.find((section) => section.key === key) || null;
  const header = get("header");
  const header2 = get("header-2");
  const footerSection = get("footer");
  const footerSection2 = get("footer-2");
  const hero = get("hero");
  const hero2 = get("hero-2");
  const headerNavLinks =
    header?.items
      .filter((item) => item.isActive && item.linkUrl && item.title)
      .map((item) => ({
        href: item.linkUrl,
        label: item.title
      })) || [];

  return {
    site,
    footer,
    seo,
    sections,
    navLinks:
      headerNavLinks.length > 0
        ? headerNavLinks
        : (((hero2?.isActive ? hero2 : hero)?.settings as {
            navLinks?: Array<{ href: string; label: string }>;
          })?.navLinks as
            | Array<{ href: string; label: string }>
            | undefined) || navLinks,
    header,
    header2,
    footerSection,
    footerSection2,
    hero,
    hero2,
    whyChoose: get("why-choose"),
    servicesSection: get("services"),
    teamSection: get("team"),
    treatmentMatrix: get("treatment-matrix"),
    beforeAfter: get("before-after"),
    serviceDetails: get("service-details"),
    certificatesGallery: get("certificates-gallery"),
    googleReviews: get("google-reviews"),
    trustpilotReviews: get("trustpilot-reviews"),
    hotel: get("hotel"),
    clinicGallerySection: get("clinic-gallery"),
    luckySpin: get("lucky-spin"),
    consultationVirtual: get("consultation-virtual"),
    consultationOnline: get("consultation-online"),
    influencers: get("influencers"),
    faq: get("faq")
  };
}

export async function getAdminAuthUserByEmail(
  email: string
): Promise<AdminAuthUser | null> {
  await initCms();
  const result = await pool.query(
    `
      SELECT id, name, email, role, password_hash, is_active
      FROM admin_users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    isActive: row.is_active
  };
}

export async function getAdminAuthUserById(id: number): Promise<AdminAuthUser | null> {
  await initCms();
  const result = await pool.query(
    `
      SELECT id, name, email, role, password_hash, is_active
      FROM admin_users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    isActive: row.is_active
  };
}
