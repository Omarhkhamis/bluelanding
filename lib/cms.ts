import "server-only";

import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { Pool, type PoolClient } from "pg";
import {
  badges,
  beforeAfterItems,
  certificatesGalleryDefaults,
  clinicGallery,
  costDifferenceDefaults,
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
import {
  defaultSiteKey,
  normalizeLocaleSegment,
  normalizeSiteKey,
  parseSiteKey,
  supportedSiteKeys,
  type SiteKey
} from "@/lib/sites";
import { getSafeWhatsAppUrl } from "@/lib/whatsapp";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

type JsonValue = Record<string, unknown> | Array<unknown> | null;

export type SiteSettings = {
  siteKey: SiteKey;
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
  siteKey: SiteKey;
  locale: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  copyrightText: string;
  socialLinks: SocialLink[];
};

export type SeoSettings = {
  siteKey: SiteKey;
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
  siteKey: SiteKey;
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
  siteKey: SiteKey;
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
  siteKey: SiteKey;
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
  siteKey: SiteKey;
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

export type SpinSubmission = {
  id: string;
  siteKey: SiteKey;
  locale: string;
  source: string;
  page: string;
  fullName: string;
  phone: string;
  prize: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

type SubmissionQueryOptions = {
  siteKey?: string;
  locale?: string;
  order?: "asc" | "desc" | "newest" | "oldest";
  month?: string;
  from?: string;
  to?: string;
};

export const supportedDashboardLocales = ["en", "ru"] as const;
export type DashboardLocale = (typeof supportedDashboardLocales)[number];
export const managedPageKeys = ["thankyou", "privacy-policy", "terms"] as const;
export type ManagedPageKey = (typeof managedPageKeys)[number];

export type ManagedPage = {
  id: number;
  key: ManagedPageKey;
  siteKey: SiteKey;
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
      key: "cost-difference",
      name: "Cost Difference",
      sectionType: "static",
      sortOrder: 1,
      heading: costDifferenceDefaults.headingLine1,
      subheading: costDifferenceDefaults.headingLine2,
      description: costDifferenceDefaults.paragraphs[0],
      buttonLabel: costDifferenceDefaults.buttonText,
      buttonUrl: whatsappUrl,
      imageUrl: costDifferenceDefaults.mainImage,
      settings: {
        paragraph2: costDifferenceDefaults.paragraphs[1],
        mainImageAlt: costDifferenceDefaults.mainImageAlt,
        detailImage: costDifferenceDefaults.detailImage,
        detailImageAlt: costDifferenceDefaults.detailImageAlt
      }
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

async function insertSeedSection(
  client: PoolClient,
  siteKey: SiteKey,
  locale: string,
  section: SeedSection
) {
  await client.query(
    `
      INSERT INTO sections (
        site_key, section_key, locale, name, section_type, sort_order, is_active, heading,
        subheading, description, button_label, button_url, image_url, settings_json
      ) VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8, $9, $10, $11, $12, $13::jsonb)
      ON CONFLICT (site_key, section_key, locale) DO NOTHING
    `,
    [
      siteKey,
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
          site_key, section_key, locale, item_type, title, subtitle, description, image_url,
          video_url, link_url, alt_text, sort_order, is_active, settings_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, $13::jsonb)
      `,
      [
        siteKey,
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

function createDatabasePool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

function getPool() {
  const globalScope = globalThis as unknown as {
    __cmsPool?: Pool;
  };

  if (globalScope.__cmsPool) {
    return globalScope.__cmsPool;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const pool = createDatabasePool();

  globalScope.__cmsPool = pool;
  return pool;
}

const pool = getPool();
let initPromise: Promise<void> | null = null;
const localeContentPromises = new Map<string, Promise<void>>();

const legacyCevreWhatsAppUrl =
  "https://api.whatsapp.com/send?phone=905518622525&text=What%20are%20the%20options%20and%20pricing%20for%20dental%20treatment";

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

function normalizeCmsLocale(locale?: string | null) {
  return normalizeLocaleSegment(locale || "en");
}

function normalizeSiteLocaleArgs(siteOrLocale?: string, maybeLocale?: string) {
  if (maybeLocale !== undefined || parseSiteKey(siteOrLocale)) {
    return {
      siteKey: normalizeSiteKey(siteOrLocale),
      locale: normalizeCmsLocale(maybeLocale)
    };
  }

  return {
    siteKey: defaultSiteKey,
    locale: normalizeCmsLocale(siteOrLocale)
  };
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
  return key === "thankyou" ? "thankyou" : key;
}

export function getManagedPagePublicPath(
  key: ManagedPageKey,
  siteKey = defaultSiteKey,
  locale = "en"
) {
  const pagePath = getManagedPagePath(key);
  return `/${siteKey}/${normalizeCmsLocale(locale)}/${pagePath}`;
}

async function backfillDefaultPages(siteKey = defaultSiteKey) {
  for (const key of managedPageKeys) {
    for (const locale of supportedDashboardLocales) {
      const page = getManagedPageDefault(key, locale);
      await pool.query(
        `
          INSERT INTO pages (site_key, page_key, locale, title, content, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (site_key, page_key, locale) DO NOTHING
        `,
        [siteKey, key, locale, page.title, page.content]
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

async function lockCmsScope(
  client: PoolClient,
  scope: string,
  siteKey: SiteKey,
  locale: string
) {
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [
    scope,
    `${siteKey}:${locale}`
  ]);
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
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          locale TEXT NOT NULL DEFAULT 'en',
          site_name TEXT NOT NULL,
          site_title TEXT NOT NULL,
          site_description TEXT,
          logo_url TEXT,
          favicon_url TEXT,
          whatsapp_url TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS footer_settings (
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          locale TEXT NOT NULL DEFAULT 'en',
          logo_url TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          copyright_text TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS social_links (
          id SERIAL PRIMARY KEY,
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          locale TEXT NOT NULL,
          platform TEXT NOT NULL,
          label TEXT NOT NULL,
          url TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS seo_settings (
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          locale TEXT NOT NULL DEFAULT 'en',
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
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          name TEXT NOT NULL,
          placement TEXT NOT NULL,
          code TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sections (
          id SERIAL PRIMARY KEY,
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
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
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
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
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          file_name TEXT NOT NULL,
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
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
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

        CREATE TABLE IF NOT EXISTS spin_submissions (
          id SERIAL PRIMARY KEY,
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          locale TEXT NOT NULL DEFAULT 'en',
          source TEXT NOT NULL DEFAULT 'lucky-spin',
          page TEXT,
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          prize TEXT NOT NULL DEFAULT '',
          payload_json JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS pages (
          id SERIAL PRIMARY KEY,
          site_key TEXT NOT NULL DEFAULT 'hollywood-smile',
          page_key TEXT NOT NULL,
          locale TEXT NOT NULL DEFAULT 'en',
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE social_links ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE seo_settings ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE custom_codes ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE sections ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE section_items ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE spin_submissions ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';
        ALTER TABLE pages ADD COLUMN IF NOT EXISTS site_key TEXT NOT NULL DEFAULT 'hollywood-smile';

        ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
        ALTER TABLE footer_settings DROP CONSTRAINT IF EXISTS footer_settings_pkey;
        ALTER TABLE seo_settings DROP CONSTRAINT IF EXISTS seo_settings_pkey;
        ALTER TABLE media_assets DROP CONSTRAINT IF EXISTS media_assets_file_name_key;
        ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_section_key_key;
        DROP INDEX IF EXISTS sections_section_key_locale_idx;
        DROP INDEX IF EXISTS pages_page_key_locale_idx;
        CREATE UNIQUE INDEX IF NOT EXISTS site_settings_site_locale_idx
        ON site_settings (site_key, locale);
        CREATE UNIQUE INDEX IF NOT EXISTS footer_settings_site_locale_idx
        ON footer_settings (site_key, locale);
        CREATE UNIQUE INDEX IF NOT EXISTS seo_settings_site_locale_idx
        ON seo_settings (site_key, locale);
        CREATE UNIQUE INDEX IF NOT EXISTS media_assets_site_file_name_idx
        ON media_assets (site_key, file_name);
        CREATE UNIQUE INDEX IF NOT EXISTS sections_site_section_key_locale_idx
        ON sections (site_key, section_key, locale);
        CREATE UNIQUE INDEX IF NOT EXISTS pages_site_page_key_locale_idx
        ON pages (site_key, page_key, locale);
      `);

      const existingSite = await pool.query(
        "SELECT locale FROM site_settings WHERE site_key = $1 AND locale = 'en' LIMIT 1",
        [defaultSiteKey]
      );

      if (!existingSite.rowCount) {
        await seedCms();
      }

      await normalizeLegacyCevreBranding();

      for (const siteKey of supportedSiteKeys) {
        if (siteKey !== defaultSiteKey) {
          await ensureSiteBaseContent(siteKey);
        }

        await backfillDefaultPages(siteKey);
      }
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

async function normalizeLegacyCevreBranding() {
  await withTransaction(async (client) => {
    await client.query(
      `
        UPDATE site_settings
        SET
          site_name = CASE
            WHEN site_name = 'CevreDent' THEN 'Blue Medical Plus'
            ELSE site_name
          END,
          site_title = CASE
            WHEN site_title = 'CevreDent - Dental Clinic in Turkey'
              THEN 'Your comfort is our expertise.'
            ELSE site_title
          END,
          site_description = CASE
            WHEN site_description = 'Experience world-class dental treatments with CevreDent.'
              THEN 'Over 16,000 happy patients around the world have placed their trust in us. Begin your journey to a new smile with us.'
            ELSE site_description
          END,
          whatsapp_url = CASE
            WHEN whatsapp_url = $1 THEN $2
            ELSE whatsapp_url
          END,
          updated_at = NOW()
        WHERE
          site_name = 'CevreDent'
          OR site_title = 'CevreDent - Dental Clinic in Turkey'
          OR site_description = 'Experience world-class dental treatments with CevreDent.'
          OR whatsapp_url = $1
      `,
      [legacyCevreWhatsAppUrl, whatsappUrl]
    );

    await client.query(
      `
        UPDATE footer_settings
        SET
          email = CASE
            WHEN email = 'info@cevredent.com' THEN 'info@bluemedicalplus.com'
            ELSE email
          END,
          address = CASE
            WHEN address = 'Mecidiyeköy Mahallesi, Büyükdere Cd. Ocak Apt No:91 Kat 2 Daire:2, 34387 Şişli/İstanbul'
              THEN 'Beypalas Sitesi A Blok No: 6/1 Ic Kapi No: 65 Esenyurt / Istanbul'
            ELSE address
          END,
          copyright_text = CASE
            WHEN copyright_text = '© 2024 CevreDent Clinic. All rights reserved.'
              THEN '© 2026 Blue Medical Plus. All rights reserved.'
            ELSE copyright_text
          END,
          updated_at = NOW()
        WHERE
          email = 'info@cevredent.com'
          OR address = 'Mecidiyeköy Mahallesi, Büyükdere Cd. Ocak Apt No:91 Kat 2 Daire:2, 34387 Şişli/İstanbul'
          OR copyright_text = '© 2024 CevreDent Clinic. All rights reserved.'
      `
    );

    await client.query(
      `
        UPDATE social_links
        SET
          platform = CASE
            WHEN url = 'https://www.instagram.com/cevredent/' THEN 'instagram'
            WHEN url = 'https://www.facebook.com/cevredent/' THEN 'facebook'
            WHEN url = 'https://www.tiktok.com/@cevredent' THEN 'youtube'
            ELSE platform
          END,
          label = CASE
            WHEN url = 'https://www.instagram.com/cevredent/' THEN 'Instagram'
            WHEN url = 'https://www.facebook.com/cevredent/' THEN 'Facebook'
            WHEN url = 'https://www.tiktok.com/@cevredent' THEN 'YouTube'
            ELSE label
          END,
          url = CASE
            WHEN url = 'https://www.instagram.com/cevredent/'
              THEN 'https://www.instagram.com/bluemedicalplus/'
            WHEN url = 'https://www.facebook.com/cevredent/'
              THEN 'https://www.facebook.com/bluemedicalplus/'
            WHEN url = 'https://www.tiktok.com/@cevredent'
              THEN 'https://www.youtube.com/@bluemedicalplus/'
            ELSE url
          END
        WHERE url IN (
          'https://www.instagram.com/cevredent/',
          'https://www.facebook.com/cevredent/',
          'https://www.tiktok.com/@cevredent'
        )
      `
    );

    await client.query(
      `
        UPDATE seo_settings
        SET
          meta_title = CASE
            WHEN meta_title IN (
              'CevreDent - Dental Clinic in Turkey',
              'Blue - Dental Clinic in Turkey'
            )
              THEN 'Blue Medical Plus - Your comfort is our expertise.'
            ELSE meta_title
          END,
          meta_description = CASE
            WHEN meta_description = 'Affordable dental implants, veneers, crowns, and smile makeovers in Turkey.'
              THEN 'Over 16,000 happy patients around the world have placed their trust in us. Begin your journey to a new smile with us.'
            ELSE meta_description
          END,
          canonical_url = CASE
            WHEN canonical_url = 'https://dental.cevredentalturkey.com'
              THEN 'https://lp.bluemedicalplus.com'
            ELSE canonical_url
          END,
          updated_at = NOW()
        WHERE
          meta_title IN (
            'CevreDent - Dental Clinic in Turkey',
            'Blue - Dental Clinic in Turkey'
          )
          OR meta_description = 'Affordable dental implants, veneers, crowns, and smile makeovers in Turkey.'
          OR canonical_url = 'https://dental.cevredentalturkey.com'
      `
    );

    await client.query(
      `
        UPDATE sections
        SET
          heading = CASE
            WHEN heading = 'CevreDent Service Details Content'
              THEN 'Blue Medical Plus Service Details'
            ELSE heading
          END,
          description = CASE
            WHEN description = 'with CevreDent Clinic''s Affordable Services'
              THEN 'with Blue Medical Plus'
            ELSE description
          END,
          button_url = CASE
            WHEN button_url = $1 THEN $2
            ELSE button_url
          END,
          updated_at = NOW()
        WHERE
          heading = 'CevreDent Service Details Content'
          OR description = 'with CevreDent Clinic''s Affordable Services'
          OR button_url = $1
      `,
      [legacyCevreWhatsAppUrl, whatsappUrl]
    );

    await client.query(
      `
        UPDATE section_items
        SET
          subtitle = CASE
            WHEN subtitle = 'CevreDent' THEN 'Blue Medical Plus'
            ELSE subtitle
          END,
          description = CASE
            WHEN description = 'Discover CevreDent''s full range of dental services, including restorations, procedures, and solutions designed to suit all of your dental requirements.'
              THEN 'Discover Blue Medical Plus''s full range of dental services, including restorations, procedures, and solutions designed to suit all of your dental requirements.'
            ELSE description
          END,
          updated_at = NOW()
        WHERE
          subtitle = 'CevreDent'
          OR description = 'Discover CevreDent''s full range of dental services, including restorations, procedures, and solutions designed to suit all of your dental requirements.'
      `
    );
  });
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
          site_key, locale, site_name, site_title, site_description, logo_url, favicon_url, whatsapp_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        defaultSiteKey,
        "en",
        "Blue Medical Plus",
        "Your comfort is our expertise.",
        "Over 16,000 happy patients around the world have placed their trust in us. Begin your journey to a new smile with us.",
        "/assets/images/image-005.png",
        "/assets/images/image-004.ico",
        whatsappUrl
      ]
    );

    await client.query(
      `
        INSERT INTO footer_settings (
          site_key, locale, logo_url, phone, email, address, copyright_text
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        defaultSiteKey,
        "en",
        "/assets/images/image-005.png",
        "+90 552 800 70 00",
        "info@bluemedicalplus.com",
        "Beypalas Sitesi A Blok No: 6/1 Ic Kapi No: 65 Esenyurt / Istanbul",
        "© 2026 Blue Medical Plus. All rights reserved."
      ]
    );

    for (const [index, link] of socialLinks.entries()) {
      await client.query(
        `
          INSERT INTO social_links (site_key, locale, platform, label, url, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [defaultSiteKey, "en", link.label.toLowerCase(), link.label, link.href, index]
      );
    }

    await client.query(
      `
        INSERT INTO seo_settings (
          site_key, locale, meta_title, meta_description, meta_keywords, og_image_url, robots, canonical_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        defaultSiteKey,
        "en",
        "Blue Medical Plus - Your comfort is our expertise.",
        "Over 16,000 happy patients around the world have placed their trust in us. Begin your journey to a new smile with us.",
        "dental clinic turkey, dental implants, veneers, hollywood smile",
        "/assets/images/image-001.png",
        "index,follow",
        "https://lp.bluemedicalplus.com"
      ]
    );

    await client.query(
      `
        INSERT INTO custom_codes (site_key, name, placement, code, is_active)
        VALUES
          ($1, 'Analytics Placeholder', 'HEAD', '<!-- Add analytics code here -->', FALSE),
          ($1, 'Body Widget Placeholder', 'BODY_END', '<!-- Add widget code here -->', FALSE)
      `
      ,
      [defaultSiteKey]
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
        description: "with Blue Medical Plus",
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
        heading: "Blue Medical Plus Service Details",
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
      await insertSeedSection(client, defaultSiteKey, "en", section);
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
      "/assets/images/image-025.webp"
    ];

    for (const mediaUrl of mediaFiles) {
      const originalName = mediaUrl.split("/").pop() || mediaUrl;
      await client.query(
        `
          INSERT INTO media_assets (
            site_key, file_name, original_name, url, mime_type, size_bytes, category
          )
          VALUES ($1, $2, $3, $4, 'image/*', 0, 'seed')
          ON CONFLICT (site_key, file_name) DO NOTHING
        `,
        [defaultSiteKey, originalName, originalName, mediaUrl]
      );
    }

    await client.query(
      `
        INSERT INTO admin_users (name, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, 'super_admin', TRUE)
        ON CONFLICT (email) DO NOTHING
      `,
      ["Primary Admin", "admin@bluemedicalplus.local", bcrypt.hashSync("Admin123!", 10)]
    );
  });
}

async function ensureSiteBaseContent(siteKey: SiteKey) {
  if (siteKey === defaultSiteKey) {
    return;
  }

  const existingBase = await pool.query(
    "SELECT 1 FROM site_settings WHERE site_key = $1 AND locale = 'en' LIMIT 1",
    [siteKey]
  );
  const customCodesCount = await pool.query(
    "SELECT COUNT(*)::int AS count FROM custom_codes WHERE site_key = $1",
    [siteKey]
  );
  const mediaCount = await pool.query(
    "SELECT COUNT(*)::int AS count FROM media_assets WHERE site_key = $1",
    [siteKey]
  );

  if (
    existingBase.rowCount &&
    (customCodesCount.rows[0]?.count || 0) > 0 &&
    (mediaCount.rows[0]?.count || 0) > 0
  ) {
    return;
  }

  await withTransaction(async (client) => {
    if (!existingBase.rowCount) {
      await client.query(
        `
          INSERT INTO site_settings (
            site_key, locale, site_name, site_title, site_description, logo_url, favicon_url,
            whatsapp_url, updated_at
          )
          SELECT $1, locale, site_name, site_title, site_description, logo_url, favicon_url,
            whatsapp_url, NOW()
          FROM site_settings
          WHERE site_key = $2 AND locale = 'en'
        `,
        [siteKey, defaultSiteKey]
      );

      await client.query(
        `
          INSERT INTO footer_settings (
            site_key, locale, logo_url, phone, email, address, copyright_text, updated_at
          )
          SELECT $1, locale, logo_url, phone, email, address, copyright_text, NOW()
          FROM footer_settings
          WHERE site_key = $2 AND locale = 'en'
        `,
        [siteKey, defaultSiteKey]
      );

      await client.query(
        `
          INSERT INTO social_links (site_key, locale, platform, label, url, sort_order)
          SELECT $1, locale, platform, label, url, sort_order
          FROM social_links
          WHERE site_key = $2 AND locale = 'en'
        `,
        [siteKey, defaultSiteKey]
      );

      await client.query(
        `
          INSERT INTO seo_settings (
            site_key, locale, meta_title, meta_description, meta_keywords, og_image_url, robots,
            canonical_url, updated_at
          )
          SELECT $1, locale, meta_title, meta_description, meta_keywords, og_image_url, robots,
            canonical_url, NOW()
          FROM seo_settings
          WHERE site_key = $2 AND locale = 'en'
        `,
        [siteKey, defaultSiteKey]
      );

      await client.query(
        `
          INSERT INTO sections (
            site_key, section_key, locale, name, section_type, sort_order, is_active, heading,
            subheading, description, button_label, button_url, image_url, settings_json, updated_at
          )
          SELECT
            $1, section_key, locale, name, section_type, sort_order, is_active, heading,
            subheading, description, button_label, button_url, image_url, settings_json, NOW()
          FROM sections
          WHERE site_key = $2 AND locale = 'en'
        `,
        [siteKey, defaultSiteKey]
      );

      await client.query(
        `
          INSERT INTO section_items (
            site_key, section_key, locale, item_type, title, subtitle, description, image_url,
            video_url, link_url, alt_text, sort_order, is_active, settings_json, updated_at
          )
          SELECT
            $1, section_key, locale, item_type, title, subtitle, description, image_url,
            video_url, link_url, alt_text, sort_order, is_active, settings_json, NOW()
          FROM section_items
          WHERE site_key = $2 AND locale = 'en'
        `,
        [siteKey, defaultSiteKey]
      );

      await client.query(
        `
          INSERT INTO pages (site_key, page_key, locale, title, content, updated_at)
          SELECT $1, page_key, locale, title, content, NOW()
          FROM pages
          WHERE site_key = $2 AND locale = 'en'
          ON CONFLICT (site_key, page_key, locale) DO NOTHING
        `,
        [siteKey, defaultSiteKey]
      );
    }

    if ((customCodesCount.rows[0]?.count || 0) <= 0) {
      await client.query(
        `
          INSERT INTO custom_codes (site_key, name, placement, code, is_active, updated_at)
          SELECT $1, name, placement, code, is_active, NOW()
          FROM custom_codes
          WHERE site_key = $2
        `,
        [siteKey, defaultSiteKey]
      );
    }

    if ((mediaCount.rows[0]?.count || 0) <= 0) {
      await client.query(
        `
          INSERT INTO media_assets (
            site_key, file_name, original_name, url, mime_type, size_bytes, alt_text, category
          )
          SELECT $1, file_name, original_name, url, mime_type, size_bytes, alt_text, category
          FROM media_assets
          WHERE site_key = $2
        `,
        [siteKey, defaultSiteKey]
      );
    }
  });
}

async function cloneLocaleContent(siteKey: SiteKey, locale: string, sourceLocale = "en") {
  const normalizedLocale = normalizeCmsLocale(locale);

  if (normalizedLocale === "en") {
    return;
  }

  await initCms();
  const existingLocale = await pool.query(
    "SELECT 1 FROM site_settings WHERE site_key = $1 AND locale = $2 LIMIT 1",
    [siteKey, normalizedLocale]
  );

  if (existingLocale.rowCount) {
    return;
  }

  await withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO site_settings (
          site_key, locale, site_name, site_title, site_description, logo_url, favicon_url,
          whatsapp_url, updated_at
        )
        SELECT $1, $2, site_name, site_title, site_description, logo_url, favicon_url,
          whatsapp_url, NOW()
        FROM site_settings
        WHERE site_key = $1 AND locale = $3
      `,
      [siteKey, normalizedLocale, sourceLocale]
    );

    await client.query(
      `
        INSERT INTO footer_settings (
          site_key, locale, logo_url, phone, email, address, copyright_text, updated_at
        )
        SELECT $1, $2, logo_url, phone, email, address, copyright_text, NOW()
        FROM footer_settings
        WHERE site_key = $1 AND locale = $3
      `,
      [siteKey, normalizedLocale, sourceLocale]
    );

    await client.query(
      `
        INSERT INTO social_links (site_key, locale, platform, label, url, sort_order)
        SELECT $1, $2, platform, label, url, sort_order
        FROM social_links
        WHERE site_key = $1 AND locale = $3
      `,
      [siteKey, normalizedLocale, sourceLocale]
    );

    await client.query(
      `
        INSERT INTO seo_settings (
          site_key, locale, meta_title, meta_description, meta_keywords, og_image_url, robots,
          canonical_url, updated_at
        )
        SELECT $1, $2, meta_title, meta_description, meta_keywords, og_image_url, robots,
          canonical_url, NOW()
        FROM seo_settings
        WHERE site_key = $1 AND locale = $3
      `,
      [siteKey, normalizedLocale, sourceLocale]
    );

    await client.query(
      `
        INSERT INTO sections (
          site_key, section_key, locale, name, section_type, sort_order, is_active, heading,
          subheading, description, button_label, button_url, image_url, settings_json, updated_at
        )
        SELECT
          $1, section_key, $2, name, section_type, sort_order, is_active, heading, subheading,
          description, button_label, button_url, image_url, settings_json, NOW()
        FROM sections
        WHERE site_key = $1 AND locale = $3
      `,
      [siteKey, normalizedLocale, sourceLocale]
    );

    await client.query(
      `
        INSERT INTO section_items (
          site_key, section_key, locale, item_type, title, subtitle, description, image_url,
          video_url, link_url, alt_text, sort_order, is_active, settings_json, updated_at
        )
        SELECT
          $1, section_key, $2, item_type, title, subtitle, description, image_url, video_url,
          link_url, alt_text, sort_order, is_active, settings_json, NOW()
        FROM section_items
        WHERE site_key = $1 AND locale = $3
      `,
      [siteKey, normalizedLocale, sourceLocale]
    );

    await client.query(
      `
        INSERT INTO pages (site_key, page_key, locale, title, content, updated_at)
        SELECT $1, page_key, $2, title, content, NOW()
        FROM pages
        WHERE site_key = $1 AND locale = $3
        ON CONFLICT (site_key, page_key, locale) DO NOTHING
      `,
      [siteKey, normalizedLocale, sourceLocale]
    );
  });
}

async function ensureHeaderSection(siteKey: SiteKey, locale: string) {
  await initCms();

  await withTransaction(async (client) => {
    await lockCmsScope(client, "ensure-header-section", siteKey, locale);

    const [headerResult, headerItemsResult, heroResult] = await Promise.all([
      client.query(
        `
          SELECT id
          FROM sections
          WHERE site_key = $1 AND section_key = 'header' AND locale = $2
          LIMIT 1
        `,
        [siteKey, locale]
      ),
      client.query(
        `
          SELECT COUNT(*)::int AS count
          FROM section_items
          WHERE site_key = $1 AND section_key = 'header' AND locale = $2
        `,
        [siteKey, locale]
      ),
      client.query(
        `
          SELECT settings_json
          FROM sections
          WHERE site_key = $1 AND section_key = 'hero' AND locale = $2
          LIMIT 1
        `,
        [siteKey, locale]
      )
    ]);

    if (headerResult.rowCount && headerItemsResult.rows[0]?.count > 0) {
      return;
    }

    const headerLinks = getLegacyHeroNavLinks(heroResult.rows[0]?.settings_json);

    if (!headerResult.rowCount) {
      await client.query(
        `
          INSERT INTO sections (
            site_key, section_key, locale, name, section_type, sort_order, is_active, heading,
            subheading, description, button_label, button_url, image_url, settings_json, updated_at
          ) VALUES (
            $1, 'header', $2, 'Header', 'navigation', -1, TRUE, 'Header', '', '', '', '', '',
            NULL, NOW()
          )
          ON CONFLICT (site_key, section_key, locale) DO NOTHING
        `,
        [siteKey, locale]
      );
    }

    if (headerItemsResult.rows[0]?.count <= 0) {
      for (const [index, link] of headerLinks.entries()) {
        await client.query(
          `
            INSERT INTO section_items (
              site_key, section_key, locale, item_type, title, subtitle, description, image_url,
              video_url, link_url, alt_text, sort_order, is_active, settings_json, updated_at
            ) VALUES (
              $1, 'header', $2, 'nav-link', $3, '', '', '', '', $4, '', $5, TRUE, NULL, NOW()
            )
          `,
          [siteKey, locale, link.label, link.href, index]
        );
      }
    }
  });
}

async function ensureExtendedSections(siteKey: SiteKey, locale: string) {
  await initCms();
  const sections = getExtendedSectionSeeds();

  await withTransaction(async (client) => {
    await lockCmsScope(client, "ensure-extended-sections", siteKey, locale);

    for (const section of sections) {
      const sectionResult = await client.query(
        `
          SELECT id
          FROM sections
          WHERE site_key = $1 AND section_key = $2 AND locale = $3
          LIMIT 1
        `,
        [siteKey, section.key, locale]
      );

      if (!sectionResult.rowCount) {
        await insertSeedSection(client, siteKey, locale, section);
        continue;
      }

      const itemCountResult = await client.query(
        `
          SELECT COUNT(*)::int AS count
          FROM section_items
          WHERE site_key = $1 AND section_key = $2 AND locale = $3
        `,
        [siteKey, section.key, locale]
      );
      const itemCount = itemCountResult.rows[0]?.count || 0;

      if (itemCount <= 0 && (section.items?.length || 0) > 0) {
        for (const item of section.items || []) {
          await client.query(
            `
              INSERT INTO section_items (
                site_key, section_key, locale, item_type, title, subtitle, description, image_url,
                video_url, link_url, alt_text, sort_order, is_active, settings_json
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, $13::jsonb)
            `,
            [
              siteKey,
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
            WHERE site_key = $1 AND section_key = 'team' AND locale = $2
            ORDER BY sort_order ASC, id ASC
          `,
          [siteKey, locale]
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

async function ensureLocaleContent(siteKey: SiteKey, locale: string) {
  const normalizedLocale = normalizeCmsLocale(locale);
  const contentKey = `${siteKey}:${normalizedLocale}`;
  const existingPromise = localeContentPromises.get(contentKey);

  if (existingPromise) {
    await existingPromise;
    return;
  }

  const contentPromise = (async () => {
    await initCms();

    const localeExists = await pool.query("SELECT code FROM locales WHERE code = $1 LIMIT 1", [
      normalizedLocale
    ]);

    if (!localeExists.rowCount) {
      await pool.query(
        `
          INSERT INTO locales (code, label, direction, is_default, is_active)
          VALUES ($1, $2, 'ltr', FALSE, TRUE)
        `,
        [normalizedLocale, normalizedLocale.toUpperCase()]
      );
    }

    await ensureSiteBaseContent(siteKey);

    if (normalizedLocale !== "en") {
      await cloneLocaleContent(siteKey, normalizedLocale);
    }

    await ensureHeaderSection(siteKey, normalizedLocale);
    await ensureExtendedSections(siteKey, normalizedLocale);
  })();

  localeContentPromises.set(contentKey, contentPromise);

  try {
    await contentPromise;
  } finally {
    if (localeContentPromises.get(contentKey) === contentPromise) {
      localeContentPromises.delete(contentKey);
    }
  }
}

export async function getSiteSettings(
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
): Promise<SiteSettings> {
  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  const result = await pool.query(
    "SELECT * FROM site_settings WHERE site_key = $1 AND locale = $2 LIMIT 1",
    [siteKey, locale]
  );
  const row = result.rows[0];

  return {
    siteKey,
    locale: row.locale,
    siteName: row.site_name,
    siteTitle: row.site_title,
    siteDescription: row.site_description || "",
    logoUrl: row.logo_url || "",
    faviconUrl: row.favicon_url || "",
    whatsappUrl: getSafeWhatsAppUrl(row.whatsapp_url)
  };
}

export async function getFooterSettings(
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
): Promise<FooterSettings> {
  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  const [footerResult, linksResult] = await Promise.all([
    pool.query("SELECT * FROM footer_settings WHERE site_key = $1 AND locale = $2 LIMIT 1", [
      siteKey,
      locale
    ]),
    pool.query(
      `
        SELECT *
        FROM social_links
        WHERE site_key = $1 AND locale = $2
        ORDER BY sort_order ASC, id ASC
      `,
      [siteKey, locale]
    )
  ]);
  const row = footerResult.rows[0];

  return {
    siteKey,
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

export async function getSeoSettings(
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
): Promise<SeoSettings> {
  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  const result = await pool.query(
    "SELECT * FROM seo_settings WHERE site_key = $1 AND locale = $2 LIMIT 1",
    [siteKey, locale]
  );
  const row = result.rows[0];

  return {
    siteKey,
    locale,
    metaTitle: row?.meta_title || "",
    metaDescription: row?.meta_description || "",
    metaKeywords: row?.meta_keywords || "",
    ogImageUrl: row?.og_image_url || "",
    robots: row?.robots || "",
    canonicalUrl: row?.canonical_url || ""
  };
}

export async function getCustomCodes(siteKey = defaultSiteKey): Promise<CustomCode[]> {
  await initCms();
  const result = await pool.query(
    "SELECT * FROM custom_codes WHERE site_key = $1 ORDER BY id ASC",
    [siteKey]
  );
  return result.rows.map((row) => ({
    id: row.id,
    siteKey: normalizeSiteKey(row.site_key),
    name: row.name,
    placement: row.placement,
    code: row.code,
    isActive: row.is_active
  }));
}

export async function getSections(
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
): Promise<Section[]> {
  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  const [sectionResult, itemResult] = await Promise.all([
    pool.query(
      `
        SELECT *
        FROM sections
        WHERE site_key = $1 AND locale = $2
        ORDER BY sort_order ASC, id ASC
      `,
      [siteKey, locale]
    ),
    pool.query(
      `
        SELECT *
        FROM section_items
        WHERE site_key = $1 AND locale = $2
        ORDER BY sort_order ASC, id ASC
      `,
      [siteKey, locale]
    )
  ]);

  return sectionResult.rows.map((section) => ({
    id: section.id,
    key: section.section_key,
    siteKey: normalizeSiteKey(section.site_key),
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
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
): Promise<Section | null> {
  const sections = await getSections(siteOrLocale, maybeLocale);
  return sections.find((section) => section.key === key) || null;
}

export async function getMediaAssets(siteKey = defaultSiteKey): Promise<MediaAsset[]> {
  await initCms();
  const result = await pool.query(
    `
      SELECT *
      FROM media_assets
      WHERE site_key = $1
      ORDER BY created_at DESC, id DESC
    `,
    [siteKey]
  );
  return result.rows.map((row) => ({
    id: row.id,
    siteKey: normalizeSiteKey(row.site_key),
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

export async function getDashboardOverview(
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
) {
  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  const [site, footer, seo, sections, mediaAssets, admins] = await Promise.all([
    getSiteSettings(siteKey, locale),
    getFooterSettings(siteKey, locale),
    getSeoSettings(siteKey, locale),
    getSections(siteKey, locale),
    getMediaAssets(siteKey),
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

export async function getManagedPages(
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
): Promise<ManagedPage[]> {
  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  const normalizedLocale = normalizeManagedLocale(locale);
  await initCms();
  const result = await pool.query(
    `
      SELECT *
      FROM pages
      WHERE site_key = $1 AND locale = $2
      ORDER BY CASE page_key
        WHEN 'thankyou' THEN 0
        WHEN 'privacy-policy' THEN 1
        WHEN 'terms' THEN 2
        ELSE 99
      END, id ASC
    `,
    [siteKey, normalizedLocale]
  );

  return result.rows.map((row) => ({
    id: row.id,
    key: row.page_key as ManagedPageKey,
    siteKey: normalizeSiteKey(row.site_key),
    locale: row.locale,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at?.toISOString?.() || new Date().toISOString()
  }));
}

export async function getManagedPageByKey(
  key: string,
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
): Promise<ManagedPage | null> {
  if (!managedPageKeys.includes(key as ManagedPageKey)) {
    return null;
  }

  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  const normalizedLocale = normalizeManagedLocale(locale);
  await initCms();
  const result = await pool.query(
    `
      SELECT *
      FROM pages
      WHERE site_key = $1 AND page_key = $2 AND locale = $3
      LIMIT 1
    `,
    [siteKey, key, normalizedLocale]
  );
  const row = result.rows[0];

  if (!row) {
    const fallback = getManagedPageDefault(key as ManagedPageKey, normalizedLocale);
    return {
      id: 0,
      key: key as ManagedPageKey,
      siteKey,
      locale: normalizedLocale,
      title: fallback.title,
      content: fallback.content,
      updatedAt: new Date().toISOString()
    };
  }

  return {
    id: row.id,
    key: row.page_key as ManagedPageKey,
    siteKey: normalizeSiteKey(row.site_key),
    locale: row.locale,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at?.toISOString?.() || new Date().toISOString()
  };
}

export async function upsertSiteSettings(data: {
  siteKey?: string;
  locale?: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  whatsappUrl: string;
}) {
  const siteKey = normalizeSiteKey(data.siteKey);
  const locale = normalizeCmsLocale(data.locale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  await pool.query(
    `
      INSERT INTO site_settings (
        site_key, locale, site_name, site_title, site_description, logo_url, favicon_url,
        whatsapp_url, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (site_key, locale) DO UPDATE SET
        site_name = EXCLUDED.site_name,
        site_title = EXCLUDED.site_title,
        site_description = EXCLUDED.site_description,
        logo_url = EXCLUDED.logo_url,
        favicon_url = EXCLUDED.favicon_url,
        whatsapp_url = EXCLUDED.whatsapp_url,
        updated_at = NOW()
    `,
    [
      siteKey,
      locale,
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
  siteKey?: string;
  locale?: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  copyrightText: string;
}) {
  const siteKey = normalizeSiteKey(data.siteKey);
  const locale = normalizeCmsLocale(data.locale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  await pool.query(
    `
      INSERT INTO footer_settings (
        site_key, locale, logo_url, phone, email, address, copyright_text, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (site_key, locale) DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        copyright_text = EXCLUDED.copyright_text,
        updated_at = NOW()
    `,
    [
      siteKey,
      locale,
      data.logoUrl,
      data.phone,
      data.email,
      data.address,
      data.copyrightText
    ]
  );
}

export async function upsertManagedPage(data: {
  siteKey?: string;
  key: ManagedPageKey;
  locale?: string;
  title: string;
  content: string;
}) {
  const siteKey = normalizeSiteKey(data.siteKey);
  const normalizedLocale = normalizeManagedLocale(data.locale);
  await initCms();
  await pool.query(
    `
      INSERT INTO pages (site_key, page_key, locale, title, content, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (site_key, page_key, locale) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = NOW()
    `,
    [siteKey, data.key, normalizedLocale, data.title, data.content]
  );
}

export async function replaceSocialLinks(
  siteKey: SiteKey,
  locale: string,
  links: Array<{ platform: string; label: string; url: string }>
) {
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  await withTransaction(async (client) => {
    await client.query("DELETE FROM social_links WHERE site_key = $1 AND locale = $2", [
      siteKey,
      locale
    ]);
    for (const [index, link] of links.entries()) {
      if (!link.label && !link.url) {
        continue;
      }
      await client.query(
        `
          INSERT INTO social_links (site_key, locale, platform, label, url, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [siteKey, locale, link.platform || link.label.toLowerCase(), link.label, link.url, index]
      );
    }
  });
}

export async function upsertSeoSettings(data: {
  siteKey?: string;
  locale?: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImageUrl: string;
  robots: string;
  canonicalUrl: string;
}) {
  const siteKey = normalizeSiteKey(data.siteKey);
  const locale = normalizeCmsLocale(data.locale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  await pool.query(
    `
      INSERT INTO seo_settings (
        site_key, locale, meta_title, meta_description, meta_keywords, og_image_url, robots,
        canonical_url, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (site_key, locale) DO UPDATE SET
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        meta_keywords = EXCLUDED.meta_keywords,
        og_image_url = EXCLUDED.og_image_url,
        robots = EXCLUDED.robots,
        canonical_url = EXCLUDED.canonical_url,
        updated_at = NOW()
    `,
    [
      siteKey,
      locale,
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
  siteKey?: string;
  name: string;
  placement: string;
  code: string;
  isActive: boolean;
}) {
  await initCms();
  await pool.query(
    `
      INSERT INTO custom_codes (site_key, name, placement, code, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `,
    [normalizeSiteKey(data.siteKey), data.name, data.placement, data.code, data.isActive]
  );
}

export async function updateCustomCode(data: {
  id: number;
  siteKey?: string;
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
      WHERE id = $5 AND site_key = $6
    `,
    [data.name, data.placement, data.code, data.isActive, data.id, normalizeSiteKey(data.siteKey)]
  );
}

export async function deleteCustomCode(id: number, siteKey = defaultSiteKey) {
  await initCms();
  await pool.query("DELETE FROM custom_codes WHERE id = $1 AND site_key = $2", [id, siteKey]);
}

export async function updateSection(data: {
  key: string;
  siteKey?: string;
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
  const siteKey = normalizeSiteKey(data.siteKey);
  const locale = normalizeCmsLocale(data.locale);
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  await pool.query(
    `
      UPDATE sections
      SET name = $1, section_type = $2, sort_order = $3, is_active = $4, heading = $5,
          subheading = $6, description = $7, button_label = $8, button_url = $9,
          image_url = $10, settings_json = $11::jsonb, updated_at = NOW()
      WHERE site_key = $12 AND section_key = $13 AND locale = $14
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
      siteKey,
      data.key,
      locale
    ]
  );
}

export async function upsertSectionItem(data: {
  id?: number;
  siteKey?: string;
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
  const siteKey = normalizeSiteKey(data.siteKey);
  const locale = normalizeCmsLocale(data.locale);
  await ensureLocaleContent(siteKey, locale);
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
        site_key, section_key, locale, item_type, title, subtitle, description, image_url,
        video_url, link_url, alt_text, sort_order, is_active, settings_json, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, NOW()
      )
    `,
    [
      siteKey,
      data.sectionKey,
      locale,
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
  siteKey = defaultSiteKey,
  locale = "en"
) {
  await ensureLocaleContent(siteKey, locale);
  await initCms();
  await withTransaction(async (client) => {
    for (const update of updates) {
      await client.query(
        `
          UPDATE sections
          SET sort_order = $1, is_active = $2, updated_at = NOW()
          WHERE site_key = $3 AND section_key = $4 AND locale = $5
        `,
        [update.sortOrder, update.isActive, siteKey, update.key, locale]
      );
    }
  });
}

export async function createMediaAsset(
  file: File,
  altText = "",
  category = "library",
  siteKey = defaultSiteKey
) {
  await initCms();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
  const targetPath = path.join(uploadsDir, fileName);
  fs.writeFileSync(targetPath, buffer);

  const url = `/uploads/${fileName}`;
  await pool.query(
    `
      INSERT INTO media_assets (
        site_key, file_name, original_name, url, mime_type, size_bytes, alt_text, category
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      siteKey,
      fileName,
      file.name,
      url,
      file.type || "application/octet-stream",
      buffer.byteLength,
      altText,
      category
    ]
  );

  return url;
}

export async function deleteMediaAsset(id: number, siteKey = defaultSiteKey) {
  await initCms();
  const result = await pool.query(
    "SELECT * FROM media_assets WHERE id = $1 AND site_key = $2 LIMIT 1",
    [id, siteKey]
  );
  const asset = result.rows[0];

  if (!asset) {
    return;
  }

  const relatedAssetCount = await pool.query(
    "SELECT COUNT(*)::int AS count FROM media_assets WHERE url = $1 AND id <> $2",
    [asset.url, id]
  );

  if (asset.url.startsWith("/uploads/")) {
    const targetPath = path.join(process.cwd(), "public", asset.url.replace(/^\//, ""));
    if ((relatedAssetCount.rows[0]?.count || 0) <= 0 && fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  }

  await pool.query("DELETE FROM media_assets WHERE id = $1 AND site_key = $2", [id, siteKey]);
}

export async function createFormSubmission(data: {
  siteKey?: string;
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
  const siteKey = normalizeSiteKey(data.siteKey);
  const result = await pool.query(
    `
      INSERT INTO form_submissions (
        site_key, locale, source, form_name, page, full_name, phone, email, message, payload_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
      RETURNING id
    `,
    [
      siteKey,
      normalizeCmsLocale(data.locale),
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

export async function createSpinSubmission(data: {
  siteKey?: string;
  locale?: string;
  source?: string;
  page?: string;
  fullName: string;
  phone: string;
  prize: string;
  payload?: Record<string, unknown>;
}) {
  await initCms();
  const siteKey = normalizeSiteKey(data.siteKey);
  const result = await pool.query(
    `
      INSERT INTO spin_submissions (
        site_key, locale, source, page, full_name, phone, prize, payload_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      RETURNING id
    `,
    [
      siteKey,
      normalizeCmsLocale(data.locale),
      data.source || "lucky-spin",
      data.page || null,
      data.fullName,
      data.phone,
      data.prize,
      JSON.stringify(data.payload || null)
    ]
  );

  return Number(result.rows[0]?.id || 0);
}

function normalizeSubmissionQueryOptions(
  options: string | SubmissionQueryOptions | undefined
): SubmissionQueryOptions {
  if (typeof options === "string") {
    return { locale: options };
  }

  return options || {};
}

function normalizeSubmissionOrder(order: SubmissionQueryOptions["order"]) {
  return order === "asc" || order === "oldest" ? "ASC" : "DESC";
}

function getSubmissionDateRange(options: SubmissionQueryOptions) {
  const month = String(options.month || "").trim();

  if (month) {
    const [yearValue, monthValue] = month.split("-").map(Number);
    if (!Number.isNaN(yearValue) && !Number.isNaN(monthValue)) {
      const start = new Date(yearValue, monthValue - 1, 1, 0, 0, 0, 0);
      const end = new Date(yearValue, monthValue, 1, 0, 0, 0, 0);
      return { start, end, endOperator: "<" as const };
    }
  }

  const fromValue = String(options.from || "").trim();
  const toValue = String(options.to || "").trim();
  const start = fromValue ? new Date(`${fromValue}T00:00:00`) : null;
  const end = toValue ? new Date(`${toValue}T23:59:59.999`) : null;

  return {
    start: start && !Number.isNaN(start.getTime()) ? start : null,
    end: end && !Number.isNaN(end.getTime()) ? end : null,
    endOperator: "<=" as const
  };
}

export async function getFormSubmissions(
  options?: string | SubmissionQueryOptions
): Promise<FormSubmission[]> {
  const queryOptions = normalizeSubmissionQueryOptions(options);
  await initCms();
  const params: Array<string | Date> = [];
  const conditions = [
    `site_key = $${params.push(normalizeSiteKey(queryOptions.siteKey))}`,
    "COALESCE(source, '') <> 'lucky-spin'",
    "COALESCE(payload_json->>'prize', '') = ''",
    "COALESCE(payload_json->>'spinPrize', '') = ''"
  ];
  const { start, end, endOperator } = getSubmissionDateRange(queryOptions);

  if (queryOptions.locale) {
    params.push(queryOptions.locale);
    conditions.push(`locale = $${params.length}`);
  }

  if (start) {
    params.push(start);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (end) {
    params.push(end);
    conditions.push(`created_at ${endOperator} $${params.length}`);
  }

  const order = normalizeSubmissionOrder(queryOptions.order);
  const result = await pool.query(
    `
      SELECT *
      FROM form_submissions
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at ${order}, id ${order}
    `,
    params
  );

  return result.rows.map((row) => ({
    id: row.id,
    siteKey: normalizeSiteKey(row.site_key),
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

export async function getSpinSubmissions(
  options?: string | SubmissionQueryOptions
): Promise<SpinSubmission[]> {
  const queryOptions = normalizeSubmissionQueryOptions(options);
  await initCms();
  const params: Array<string | Date> = [];
  const conditions: string[] = [`site_key = $${params.push(normalizeSiteKey(queryOptions.siteKey))}`];
  const { start, end, endOperator } = getSubmissionDateRange(queryOptions);

  if (queryOptions.locale) {
    params.push(queryOptions.locale);
    conditions.push(`locale = $${params.length}`);
  }

  if (start) {
    params.push(start);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (end) {
    params.push(end);
    conditions.push(`created_at ${endOperator} $${params.length}`);
  }

  const order = normalizeSubmissionOrder(queryOptions.order);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `
      WITH all_spin AS (
        SELECT
          CONCAT('spin-', id) AS id,
          site_key,
          locale,
          source,
          page,
          full_name,
          phone,
          prize,
          payload_json,
          created_at
        FROM spin_submissions

        UNION ALL

        SELECT
          CONCAT('legacy-', id) AS id,
          site_key,
          locale,
          source,
          page,
          full_name,
          phone,
          COALESCE(payload_json->>'prize', payload_json->>'spinPrize', '') AS prize,
          payload_json,
          created_at
        FROM form_submissions
        WHERE
          COALESCE(source, '') = 'lucky-spin'
          OR COALESCE(payload_json->>'prize', '') <> ''
          OR COALESCE(payload_json->>'spinPrize', '') <> ''
      )
      SELECT *
      FROM all_spin
      ${whereClause}
      ORDER BY created_at ${order}, id ${order}
    `,
    params
  );

  return result.rows.map((row) => ({
    id: String(row.id || ""),
    siteKey: normalizeSiteKey(row.site_key),
    locale: row.locale || "en",
    source: row.source || "lucky-spin",
    page: row.page || "",
    fullName: row.full_name || "",
    phone: row.phone || "",
    prize: row.prize || "",
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

export async function getPublicSiteContent(
  siteOrLocale = defaultSiteKey,
  maybeLocale?: string
) {
  const { siteKey, locale } = normalizeSiteLocaleArgs(siteOrLocale, maybeLocale);
  const [site, footer, seo, sections] = await Promise.all([
    getSiteSettings(siteKey, locale),
    getFooterSettings(siteKey, locale),
    getSeoSettings(siteKey, locale),
    getSections(siteKey, locale)
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
