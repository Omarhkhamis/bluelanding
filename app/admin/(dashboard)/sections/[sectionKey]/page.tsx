import { notFound } from "next/navigation";
import {
  addSectionItemAction,
  deleteSectionItemAction,
  saveSectionAction
} from "@/app/admin/actions";
import { FooterNavEditor } from "@/components/admin/footer-nav-editor";
import { ImplantMatrixEditor } from "@/components/admin/implant-matrix-editor";
import { IconPickerField } from "@/components/admin/icon-picker-field";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { StatusNotice } from "@/components/admin/status-notice";
import { getSectionItemIconSettings } from "@/lib/admin-icons";
import { getSectionByKey } from "@/lib/cms";
import { getFooterNavItems, normalizeFooterNavItems } from "@/lib/footer-nav";
import { getSiteLabel, normalizeSiteKey } from "@/lib/sites";

export default async function AdminSectionEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ sectionKey: string }>;
  searchParams: Promise<{ locale?: string; site?: string; status?: string }>;
}) {
  const { sectionKey } = await params;
  const { locale = "en", site, status } = await searchParams;
  const siteKey = normalizeSiteKey(site);
  const section = await getSectionByKey(sectionKey, siteKey, locale);

  if (!section) {
    notFound();
  }

  const isHeroSection = section.key === "hero";
  const isHero2Section = section.key === "hero-2";
  const isHeaderSection = section.key === "header";
  const isHeader2Section = section.key === "header-2";
  const isFooterSection = section.key === "footer";
  const isFooter2Section = section.key === "footer-2";
  const isAnyHeroSection = isHeroSection || isHero2Section;
  const isAnyHeaderSection = isHeaderSection || isHeader2Section;
  const isAnyFooterSection = isFooterSection || isFooter2Section;
  const isServicesSection = section.key === "services";
  const isTeamSection = section.key === "team";
  const isTreatmentMatrixSection = section.key === "treatment-matrix";
  const isBeforeAfterSection = section.key === "before-after";
  const isCertificatesGallerySection = section.key === "certificates-gallery";
  const isGoogleReviewsSection = section.key === "google-reviews";
  const isTrustpilotReviewsSection = section.key === "trustpilot-reviews";
  const isClinicGallerySection = section.key === "clinic-gallery";
  const isLuckySpinSection = section.key === "lucky-spin";
  const isInfluencersSection = section.key === "influencers";
  const isHotelSection = section.key === "hotel";
  const isReviewsSection = isGoogleReviewsSection || isTrustpilotReviewsSection;
  const supportsItemIcons = section.key === "why-choose" || section.key === "service-details";
  const isConsultationSection =
    section.key === "consultation-virtual" || section.key === "consultation-online";
  const addItemType = isAnyHeaderSection
    ? "nav-link"
    : isServicesSection
      ? "service"
      : isTeamSection
        ? "team-member"
      : isBeforeAfterSection
        ? "slide"
      : isCertificatesGallerySection
        ? "image"
        : isReviewsSection
          ? "review"
          : isClinicGallerySection
            ? "image"
            : isInfluencersSection
              ? "video"
              : "default";
  const headerSettings =
    section.settings && typeof section.settings === "object" ? section.settings : {};
  const heroSettings =
    section.settings && typeof section.settings === "object" ? section.settings : {};
  const heroBackgroundImage =
    section.imageUrl || section.items.find((item) => item.itemType === "image")?.imageUrl || "";
  const hotelSettings =
    section.settings && typeof section.settings === "object" ? section.settings : {};
  const footerSettings =
    section.settings && typeof section.settings === "object" ? section.settings : {};
  const footerNavItems = Array.isArray(footerSettings.navItems)
    ? normalizeFooterNavItems(footerSettings.navItems)
    : getFooterNavItems(footerSettings);
  const treatmentMatrixSettings =
    section.settings && typeof section.settings === "object" ? section.settings : {};
  const luckySpinSettings =
    section.settings && typeof section.settings === "object" ? section.settings : {};
  const hotelName = String(hotelSettings.hotelName || "Mercure Hotel");
  const hotelStars = Math.min(5, Math.max(1, Number(hotelSettings.hotelStars) || 5));

  return (
    <>
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">Section Editor</div>
          <h1 className="admin-page-title">{section.name}</h1>
          <p className="admin-help">
            Editing {getSiteLabel(siteKey)} / {locale.toUpperCase()} for key{" "}
            <strong>{section.key}</strong>.
          </p>
        </div>
      </div>

      <StatusNotice status={status} />

      <form action={saveSectionAction} className="admin-form">
        <input type="hidden" name="site" value={siteKey} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value={`/admin/sections/${section.key}`} />
        <input type="hidden" name="key" value={section.key} />
        <input type="hidden" name="sectionKey" value={section.key} />
        <input type="hidden" name="addItemType" value={addItemType} />

        {isAnyHeaderSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Header settings</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>
            <input type="hidden" name="name" value={section.name} />

            <input
              type="hidden"
              name="headerVariant"
              value={isHeader2Section ? "lpbm" : "default"}
            />

            {isHeader2Section ? (
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="headerCtaLabel">CTA label</label>
                  <input
                    id="headerCtaLabel"
                    name="headerCtaLabel"
                    defaultValue={String(headerSettings.ctaLabel || "Book Consultation")}
                    className="admin-input"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="headerCallLabel">Call label</label>
                  <input
                    id="headerCallLabel"
                    name="headerCallLabel"
                    defaultValue={String(headerSettings.callLabel || "Call Us")}
                    className="admin-input"
                  />
                </div>
              </div>
            ) : (
              <p className="admin-help">
                This is the original site header. Navigation links below control the old header layout.
              </p>
            )}

            {isHeaderSection ? (
              <>
                <div className="admin-list">
                  {section.items.map((item, index) => (
                    <article key={item.id} className="admin-card admin-form">
                      <input type="hidden" name={`items.${index}.id`} value={item.id} />
                      <div className="admin-card-header">
                        <div>
                          <div className="admin-eyebrow">Item {index + 1}</div>
                          <h3>{item.itemType}</h3>
                        </div>
                      </div>

                      <div className="admin-form-grid">
                        <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                        <input type="hidden" name={`items.${index}.subtitle`} value={item.subtitle} />
                        <input type="hidden" name={`items.${index}.imageUrl`} value={item.imageUrl} />
                        <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                        <input type="hidden" name={`items.${index}.altText`} value={item.altText} />
                        <input
                          type="hidden"
                          name={`items.${index}.description`}
                          value={item.description}
                        />
                        <div className="admin-field">
                          <label>Title</label>
                          <input
                            name={`items.${index}.title`}
                            defaultValue={item.title}
                            className="admin-input"
                          />
                        </div>
                        <div className="admin-field">
                          <label>URL</label>
                          <input
                            name={`items.${index}.linkUrl`}
                            defaultValue={item.linkUrl}
                            className="admin-input"
                          />
                        </div>
                      </div>

                      <div className="admin-actions">
                        <button
                          type="submit"
                          formAction={deleteSectionItemAction.bind(null, item.id)}
                          className="admin-button-danger"
                        >
                          Delete item
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="admin-actions">
                  <button
                    type="submit"
                    formAction={addSectionItemAction}
                    className="admin-button-muted"
                  >
                    Add item
                  </button>
                  <button type="submit" className="admin-button">
                    Save section
                  </button>
                </div>
              </>
            ) : (
              <div className="admin-actions">
                <button type="submit" className="admin-button">
                  Save section
                </button>
              </div>
            )}
          </section>
        ) : isAnyHeroSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Hero details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input
              type="hidden"
              name="heroVariant"
              value={isHero2Section ? "lpbm" : "default"}
            />

            {isHero2Section ? (
              <>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="heading">Internal heading</label>
                    <input
                      id="heading"
                      name="heading"
                      defaultValue={section.heading}
                      className="admin-input"
                    />
                  </div>
                  <MediaUrlField
                    name="imageUrl"
                    label="Background image URL"
                    defaultValue={heroBackgroundImage}
                  />
                  <div className="admin-field">
                    <label htmlFor="buttonUrl">Button URL</label>
                    <input
                      id="buttonUrl"
                      name="buttonUrl"
                      defaultValue={section.buttonUrl}
                      className="admin-input"
                    />
                  </div>
                  <MediaUrlField
                    name="heroVideoUrl"
                    label="Background video URL"
                    defaultValue={String(heroSettings.videoUrl || "")}
                    mediaType="video"
                  />
                  <div className="admin-field">
                    <label htmlFor="heroKicker">Kicker</label>
                    <input
                      id="heroKicker"
                      name="heroKicker"
                      defaultValue={String(heroSettings.kicker || "Istanbul • Turkiye")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="heroWhatsappCta">CTA label</label>
                    <input
                      id="heroWhatsappCta"
                      name="heroWhatsappCta"
                      defaultValue={String(heroSettings.whatsappCta || section.buttonLabel)}
                      className="admin-input"
                    />
                  </div>
                </div>

                <p className="admin-help">
                  If both background image and background video are set, Hero 2 shows the video first.
                </p>

                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="heroTitleLine1">Title line 1</label>
                    <input
                      id="heroTitleLine1"
                      name="heroTitleLine1"
                      defaultValue={String(heroSettings.titleLine1 || "")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="heroTitleLine2">Title line 2</label>
                    <input
                      id="heroTitleLine2"
                      name="heroTitleLine2"
                      defaultValue={String(heroSettings.titleLine2 || "")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="heroFormTitle">Form title</label>
                    <input
                      id="heroFormTitle"
                      name="heroFormTitle"
                      defaultValue={String(heroSettings.formTitle || "")}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={section.description}
                    className="admin-textarea"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="heroLpbmSubtitle">Subtitle</label>
                  <textarea
                    id="heroLpbmSubtitle"
                    name="heroLpbmSubtitle"
                    defaultValue={String(heroSettings.lpbmSubtitle || heroSettings.subtitle || "")}
                    className="admin-textarea"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="heroFormDescription">Form description</label>
                  <textarea
                    id="heroFormDescription"
                    name="heroFormDescription"
                    defaultValue={String(heroSettings.formDescription || "")}
                    className="admin-textarea"
                  />
                </div>

                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="heroFormSubmitText">Form submit text</label>
                    <input
                      id="heroFormSubmitText"
                      name="heroFormSubmitText"
                      defaultValue={String(heroSettings.formSubmitText || "Submit Request")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="heroFormPrivacyNote">Privacy note</label>
                    <input
                      id="heroFormPrivacyNote"
                      name="heroFormPrivacyNote"
                      defaultValue={String(heroSettings.formPrivacyNote || "Your details stay private.")}
                      className="admin-input"
                    />
                  </div>
                </div>

                <input type="hidden" name="subheading" value={section.subheading} />
                <input type="hidden" name="buttonLabel" value={section.buttonLabel} />
              </>
            ) : (
              <>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="heading">Heading</label>
                    <input
                      id="heading"
                      name="heading"
                      defaultValue={section.heading}
                      className="admin-input"
                    />
                  </div>
                  <MediaUrlField
                    name="imageUrl"
                    label="Background image URL"
                    defaultValue={heroBackgroundImage}
                  />
                  <div className="admin-field">
                    <label htmlFor="subheading">Subheading</label>
                    <input
                      id="subheading"
                      name="subheading"
                      defaultValue={section.subheading}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="buttonLabel">Button text</label>
                    <input
                      id="buttonLabel"
                      name="buttonLabel"
                      defaultValue={section.buttonLabel}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="buttonUrl">Button URL</label>
                    <input
                      id="buttonUrl"
                      name="buttonUrl"
                      defaultValue={section.buttonUrl}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={section.description}
                    className="admin-textarea"
                  />
                </div>

                <input type="hidden" name="heroVideoUrl" value={String(heroSettings.videoUrl || "")} />
                <input type="hidden" name="heroKicker" value={String(heroSettings.kicker || "")} />
                <input type="hidden" name="heroTitleLine1" value={String(heroSettings.titleLine1 || "")} />
                <input type="hidden" name="heroTitleLine2" value={String(heroSettings.titleLine2 || "")} />
                <input type="hidden" name="heroWhatsappCta" value={String(heroSettings.whatsappCta || "")} />
                <input type="hidden" name="heroFormTitle" value={String(heroSettings.formTitle || "")} />
                <input type="hidden" name="heroLpbmSubtitle" value={String(heroSettings.lpbmSubtitle || "")} />
                <input type="hidden" name="heroFormDescription" value={String(heroSettings.formDescription || "")} />
                <input type="hidden" name="heroFormSubmitText" value={String(heroSettings.formSubmitText || "")} />
                <input type="hidden" name="heroFormPrivacyNote" value={String(heroSettings.formPrivacyNote || "")} />
              </>
            )}

            <div className="admin-actions">
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </section>
        ) : isAnyFooterSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Footer details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input type="hidden" name="heading" value={section.heading} />
            <input type="hidden" name="subheading" value={section.subheading} />
            <input type="hidden" name="description" value={section.description} />
            <input type="hidden" name="buttonLabel" value={section.buttonLabel} />
            <input type="hidden" name="buttonUrl" value={section.buttonUrl} />
            {isFooter2Section ? null : (
              <input type="hidden" name="imageUrl" value={section.imageUrl} />
            )}

            <input
              type="hidden"
              name="footerVariant"
              value={isFooter2Section ? "lpbm" : "default"}
            />

            {isFooter2Section ? (
              <>
                <div className="admin-form-grid">
                  <MediaUrlField
                    name="imageUrl"
                    label="Footer image URL"
                    defaultValue={section.imageUrl}
                  />
                  <div className="admin-field">
                    <label htmlFor="footerBadge">Badge</label>
                    <input
                      id="footerBadge"
                      name="footerBadge"
                      defaultValue={String(footerSettings.badge || "")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="footerPhoneLabel">Phone label</label>
                    <input
                      id="footerPhoneLabel"
                      name="footerPhoneLabel"
                      defaultValue={String(footerSettings.phoneLabel || "Phone")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="footerEmailLabel">Email label</label>
                    <input
                      id="footerEmailLabel"
                      name="footerEmailLabel"
                      defaultValue={String(footerSettings.emailLabel || "Email")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="footerAddressLabel">Address label</label>
                    <input
                      id="footerAddressLabel"
                      name="footerAddressLabel"
                      defaultValue={String(footerSettings.addressLabel || "Address")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="footerPrivacy">Privacy label</label>
                    <input
                      id="footerPrivacy"
                      name="footerPrivacy"
                      defaultValue={String(footerSettings.privacy || "Privacy Policy")}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="footerTerms">Terms label</label>
                    <input
                      id="footerTerms"
                      name="footerTerms"
                      defaultValue={String(footerSettings.terms || "Terms")}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="footerDescription">Description</label>
                  <textarea
                    id="footerDescription"
                    name="footerDescription"
                    defaultValue={String(footerSettings.description || "")}
                    className="admin-textarea"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="footerNote">Note</label>
                  <textarea
                    id="footerNote"
                    name="footerNote"
                    defaultValue={String(footerSettings.note || "")}
                    className="admin-textarea"
                  />
                </div>

                <FooterNavEditor initialItems={footerNavItems} />
              </>
            ) : (
              <>
                <p className="admin-help">
                  This is the original site footer. Contact details and old footer content are controlled from General Settings.
                </p>
                <input type="hidden" name="footerBadge" value={String(footerSettings.badge || "")} />
                <input type="hidden" name="footerPhoneLabel" value={String(footerSettings.phoneLabel || "")} />
                <input type="hidden" name="footerEmailLabel" value={String(footerSettings.emailLabel || "")} />
                <input type="hidden" name="footerAddressLabel" value={String(footerSettings.addressLabel || "")} />
                <input type="hidden" name="footerPrivacy" value={String(footerSettings.privacy || "")} />
                <input type="hidden" name="footerTerms" value={String(footerSettings.terms || "")} />
                <input type="hidden" name="footerDescription" value={String(footerSettings.description || "")} />
                <input type="hidden" name="footerNote" value={String(footerSettings.note || "")} />
                <input type="hidden" name="footerNavTreatments" value={String(footerSettings.navTreatments || "")} />
                <input type="hidden" name="footerNavTreatmentsHref" value={String(footerSettings.navTreatmentsHref || "")} />
                <input type="hidden" name="footerNavBeforeAfter" value={String(footerSettings.navBeforeAfter || "")} />
                <input type="hidden" name="footerNavBeforeAfterHref" value={String(footerSettings.navBeforeAfterHref || "")} />
                <input type="hidden" name="footerNavTestimonials" value={String(footerSettings.navTestimonials || "")} />
                <input type="hidden" name="footerNavTestimonialsHref" value={String(footerSettings.navTestimonialsHref || "")} />
                <input type="hidden" name="footerNavFaqs" value={String(footerSettings.navFaqs || "")} />
                <input type="hidden" name="footerNavFaqsHref" value={String(footerSettings.navFaqsHref || "")} />
                <input type="hidden" name="footerNavHealthTourism" value={String(footerSettings.navHealthTourism || "")} />
                <input type="hidden" name="footerNavHealthTourismHref" value={String(footerSettings.navHealthTourismHref || "")} />
              </>
            )}

            <div className="admin-actions">
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </section>
        ) : isTreatmentMatrixSection ? (
          <>
            <section className="admin-card admin-form">
              <div className="admin-card-header">
                <div>
                  <div className="admin-eyebrow">Section</div>
                  <h2>Treatment matrix details</h2>
                </div>
                <label className="admin-checkbox">
                  <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                  Enabled
                </label>
              </div>

              <input type="hidden" name="name" value={section.name} />
              <input type="hidden" name="imageUrl" value={section.imageUrl} />
              <input type="hidden" name="buttonLabel" value={section.buttonLabel} />
              <input type="hidden" name="buttonUrl" value={section.buttonUrl} />

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="heading">Title</label>
                  <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
                </div>
                <div className="admin-field">
                  <label htmlFor="subheading">Kicker</label>
                  <input
                    id="subheading"
                    name="subheading"
                    defaultValue={section.subheading}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={section.description}
                  className="admin-textarea"
                />
              </div>
            </section>

            <ImplantMatrixEditor
              initialColumns={
                ((treatmentMatrixSettings.columns as string[] | undefined) || []).slice()
              }
              initialRows={
                ((treatmentMatrixSettings.rows as Array<{ values: string[] }> | undefined) || []).slice()
              }
            />

            <div className="admin-actions">
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </>
        ) : isLuckySpinSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Lucky Spin details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input type="hidden" name="buttonUrl" value={section.buttonUrl} />

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="heading">Title</label>
                <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
              </div>
              <div className="admin-field">
                <label htmlFor="subheading">Kicker</label>
                <input
                  id="subheading"
                  name="subheading"
                  defaultValue={section.subheading}
                  className="admin-input"
                />
              </div>
              <MediaUrlField
                name="imageUrl"
                label="Background image URL"
                defaultValue={section.imageUrl}
              />
              <div className="admin-field">
                <label htmlFor="buttonLabel">Spin button label</label>
                <input
                  id="buttonLabel"
                  name="buttonLabel"
                  defaultValue={section.buttonLabel}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="luckySpinTagline">Tagline</label>
                <input
                  id="luckySpinTagline"
                  name="luckySpinTagline"
                  defaultValue={String(luckySpinSettings.tagline || "")}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="luckySpinResultLabel">Result label</label>
                <input
                  id="luckySpinResultLabel"
                  name="luckySpinResultLabel"
                  defaultValue={String(luckySpinSettings.resultLabel || "You get")}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={section.description}
                className="admin-textarea"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="luckySpinPrizes">Prizes (one per line)</label>
              <textarea
                id="luckySpinPrizes"
                name="luckySpinPrizes"
                defaultValue={((luckySpinSettings.prizes as string[] | undefined) || []).join("\n")}
                className="admin-textarea"
              />
            </div>

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="luckySpinFormTitle">Form title</label>
                <input
                  id="luckySpinFormTitle"
                  name="luckySpinFormTitle"
                  defaultValue={String(luckySpinSettings.formTitle || "")}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="luckySpinFormSubmitText">Form submit text</label>
                <input
                  id="luckySpinFormSubmitText"
                  name="luckySpinFormSubmitText"
                  defaultValue={String(luckySpinSettings.formSubmitText || "")}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="luckySpinFormDescription">Form description</label>
              <textarea
                id="luckySpinFormDescription"
                name="luckySpinFormDescription"
                defaultValue={String(luckySpinSettings.formDescription || "")}
                className="admin-textarea"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="luckySpinFormPrivacyNote">Privacy note</label>
              <input
                id="luckySpinFormPrivacyNote"
                name="luckySpinFormPrivacyNote"
                defaultValue={String(luckySpinSettings.formPrivacyNote || "")}
                className="admin-input"
              />
            </div>

            <div className="admin-actions">
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </section>
        ) : isCertificatesGallerySection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Certificates gallery details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input type="hidden" name="imageUrl" value={section.imageUrl} />
            <input type="hidden" name="buttonLabel" value={section.buttonLabel} />
            <input type="hidden" name="buttonUrl" value={section.buttonUrl} />

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="heading">Title</label>
                <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
              </div>
              <div className="admin-field">
                <label htmlFor="subheading">Kicker</label>
                <input
                  id="subheading"
                  name="subheading"
                  defaultValue={section.subheading}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={section.description}
                className="admin-textarea"
              />
            </div>
          </section>
        ) : isReviewsSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>{isGoogleReviewsSection ? "Google Reviews" : "Trustpilot Reviews"} details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input type="hidden" name="imageUrl" value={section.imageUrl} />
            <input type="hidden" name="buttonUrl" value={section.buttonUrl} />

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="heading">Title</label>
                <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
              </div>
              <div className="admin-field">
                <label htmlFor="subheading">Kicker</label>
                <input
                  id="subheading"
                  name="subheading"
                  defaultValue={section.subheading}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="buttonLabel">CTA text</label>
                <input
                  id="buttonLabel"
                  name="buttonLabel"
                  defaultValue={section.buttonLabel}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="reviewsRating">Rating</label>
                <input
                  id="reviewsRating"
                  name="reviewsRating"
                  defaultValue={String(section.settings.rating || "4.9")}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="reviewsRatingCountLabel">Rating count label</label>
                <input
                  id="reviewsRatingCountLabel"
                  name="reviewsRatingCountLabel"
                  defaultValue={String(section.settings.ratingCountLabel || "")}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={section.description}
                className="admin-textarea"
              />
            </div>
          </section>
        ) : isConsultationSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Section details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="heading">Heading</label>
                <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
              </div>
              <MediaUrlField name="imageUrl" label="Image URL" defaultValue={section.imageUrl} />
              <div className="admin-field">
                <label htmlFor="subheading">Subheading</label>
                <input
                  id="subheading"
                  name="subheading"
                  defaultValue={section.subheading}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="buttonLabel">Button label</label>
                <input
                  id="buttonLabel"
                  name="buttonLabel"
                  defaultValue={section.buttonLabel}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="buttonUrl">Button URL</label>
                <input
                  id="buttonUrl"
                  name="buttonUrl"
                  defaultValue={section.buttonUrl}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={section.description}
                className="admin-textarea"
              />
            </div>

            <div className="admin-actions">
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </section>
        ) : isBeforeAfterSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Section details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input type="hidden" name="imageUrl" value={section.imageUrl} />
            <input type="hidden" name="subheading" value={section.subheading} />
            <input type="hidden" name="description" value={section.description} />

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="heading">Heading</label>
                <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
              </div>
              <div className="admin-field">
                <label htmlFor="buttonLabel">Button text</label>
                <input
                  id="buttonLabel"
                  name="buttonLabel"
                  defaultValue={section.buttonLabel}
                  className="admin-input"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="buttonUrl">Button URL</label>
                <input
                  id="buttonUrl"
                  name="buttonUrl"
                  defaultValue={section.buttonUrl}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-actions">
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </section>
        ) : isHotelSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Hotel details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input type="hidden" name="subheading" value={section.subheading} />
            <input type="hidden" name="buttonLabel" value={section.buttonLabel} />
            <input type="hidden" name="buttonUrl" value={section.buttonUrl} />

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="heading">Heading</label>
                <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
              </div>
              <div className="admin-field">
                <label htmlFor="hotelName">Hotel name</label>
                <input
                  id="hotelName"
                  name="hotelName"
                  defaultValue={hotelName}
                  className="admin-input"
                />
              </div>
              <MediaUrlField
                name="imageUrl"
                label="Hotel image URL"
                defaultValue={section.imageUrl}
              />
              <div className="admin-field">
                <label htmlFor="hotelStars">Stars</label>
                <input
                  id="hotelStars"
                  type="number"
                  min={1}
                  max={5}
                  name="hotelStars"
                  defaultValue={hotelStars}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={section.description}
                className="admin-textarea"
              />
            </div>

            <div className="admin-actions">
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </section>
        ) : isInfluencersSection ? (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Section details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input type="hidden" name="imageUrl" value={section.imageUrl} />
            <input type="hidden" name="subheading" value={section.subheading} />
            <input type="hidden" name="buttonLabel" value={section.buttonLabel} />
            <input type="hidden" name="buttonUrl" value={section.buttonUrl} />
            <input type="hidden" name="description" value={section.description} />

            <div className="admin-field">
              <label htmlFor="heading">Heading</label>
              <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
            </div>
          </section>
        ) : (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Section</div>
                <h2>Section details</h2>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isActive" defaultChecked={section.isActive} />
                Enabled
              </label>
            </div>

            <input type="hidden" name="name" value={section.name} />
            <input
              type="hidden"
              name="imageUrl"
              value={isHeroSection ? heroBackgroundImage : section.imageUrl}
            />
            <input type="hidden" name="subheading" value={section.subheading} />
            <input type="hidden" name="buttonLabel" value={section.buttonLabel} />
            <input type="hidden" name="buttonUrl" value={section.buttonUrl} />
            <input type="hidden" name="description" value={section.description} />

            <div className="admin-field">
              <label htmlFor="heading">Heading</label>
              <input id="heading" name="heading" defaultValue={section.heading} className="admin-input" />
            </div>
          </section>
        )}

        {isAnyHeroSection ||
        isAnyHeaderSection ||
        isAnyFooterSection ||
        isConsultationSection ||
        isTreatmentMatrixSection ||
        isLuckySpinSection ? null : (
          <section className="admin-card admin-form">
            <div className="admin-card-header">
              <div>
                <div className="admin-eyebrow">Items</div>
                <h2>Repeatable content</h2>
              </div>
            </div>

            <div className="admin-list">
              {section.items.map((item, index) => {
                const { iconName, iconUrl } = getSectionItemIconSettings(item);

                return (
                  <article key={item.id} className="admin-card admin-form">
                    <input type="hidden" name={`items.${index}.id`} value={item.id} />
                    <div className="admin-card-header">
                      <div>
                        <div className="admin-eyebrow">Item {index + 1}</div>
                        <h3>{item.itemType}</h3>
                      </div>
                    </div>

                    {isServicesSection ? (
                      <>
                        <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                        <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                        <input type="hidden" name={`items.${index}.altText`} value={item.altText} />
                        <div className="admin-form-grid">
                          <div className="admin-field">
                            <label>Card title</label>
                            <input
                              name={`items.${index}.title`}
                              defaultValue={item.title}
                              className="admin-input"
                            />
                          </div>
                          <MediaUrlField
                            name={`items.${index}.imageUrl`}
                            label="Card image URL"
                            defaultValue={item.imageUrl}
                          />
                          <div className="admin-field">
                            <label>Items heading</label>
                            <input
                              name={`items.${index}.subtitle`}
                              defaultValue={item.subtitle}
                              className="admin-input"
                            />
                          </div>
                          <div className="admin-field">
                            <label>Button text</label>
                            <input
                              name={`items.${index}.buttonLabel`}
                              defaultValue={
                                (item.settings.buttonLabel as string | undefined) ||
                                "Get More Information"
                              }
                              className="admin-input"
                            />
                          </div>
                          <div className="admin-field">
                            <label>Button and items link</label>
                            <input
                              name={`items.${index}.linkUrl`}
                              defaultValue={item.linkUrl}
                              className="admin-input"
                            />
                          </div>
                        </div>

                        <input
                          type="hidden"
                          name={`items.${index}.description`}
                          value={item.description}
                        />

                        <div className="admin-field">
                          <label>Card items</label>
                          <textarea
                            name={`items.${index}.itemsText`}
                            defaultValue={((item.settings.items as string[] | undefined) || []).join("\n")}
                            className="admin-textarea"
                          />
                        </div>
                      </>
                    ) : isTeamSection ? (
                      <>
                        <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                        <input type="hidden" name={`items.${index}.subtitle`} value="" />
                        <input type="hidden" name={`items.${index}.videoUrl`} value="" />
                        <input type="hidden" name={`items.${index}.linkUrl`} value="" />
                        <input type="hidden" name={`items.${index}.altText`} value="" />
                        <div className="admin-form-grid">
                          <div className="admin-field">
                            <label>Team title</label>
                            <input
                              name={`items.${index}.title`}
                              defaultValue={item.title}
                              className="admin-input"
                            />
                          </div>
                          <MediaUrlField
                            name={`items.${index}.imageUrl`}
                            label="Team image URL"
                            defaultValue={item.imageUrl}
                          />
                        </div>

                        <div className="admin-field">
                          <label>Description</label>
                          <textarea
                            name={`items.${index}.description`}
                            defaultValue={
                              item.description ||
                              ((item.settings.items as string[] | undefined) || []).join(". ")
                            }
                            className="admin-textarea"
                          />
                        </div>
                      </>
                    ) : isBeforeAfterSection ? (
                    <>
                      <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                      <input type="hidden" name={`items.${index}.title`} value={item.title} />
                      <input type="hidden" name={`items.${index}.subtitle`} value={item.subtitle} />
                      <input type="hidden" name={`items.${index}.description`} value={item.description} />
                      <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                      <input type="hidden" name={`items.${index}.linkUrl`} value={item.linkUrl} />
                      <input type="hidden" name={`items.${index}.altText`} value={item.altText} />

                      <MediaUrlField
                        name={`items.${index}.imageUrl`}
                        label="Image URL"
                        defaultValue={item.imageUrl}
                      />
                    </>
                  ) : isCertificatesGallerySection ? (
                    <>
                      <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                      <input type="hidden" name={`items.${index}.title`} value={item.title} />
                      <input type="hidden" name={`items.${index}.subtitle`} value={item.subtitle} />
                      <input type="hidden" name={`items.${index}.description`} value={item.description} />
                      <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                      <input type="hidden" name={`items.${index}.linkUrl`} value={item.linkUrl} />

                      <div className="admin-form-grid">
                        <MediaUrlField
                          name={`items.${index}.imageUrl`}
                          label="Certificate image URL"
                          defaultValue={item.imageUrl}
                        />
                        <div className="admin-field">
                          <label>Alt text</label>
                          <input
                            name={`items.${index}.altText`}
                            defaultValue={item.altText}
                            className="admin-input"
                          />
                        </div>
                      </div>
                    </>
                  ) : isReviewsSection ? (
                    <>
                      <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                      <input type="hidden" name={`items.${index}.imageUrl`} value={item.imageUrl} />
                      <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                      <input type="hidden" name={`items.${index}.linkUrl`} value={item.linkUrl} />

                      <div className="admin-form-grid">
                        <div className="admin-field">
                          <label>Name</label>
                          <input
                            name={`items.${index}.title`}
                            defaultValue={item.title}
                            className="admin-input"
                          />
                        </div>
                        <div className="admin-field">
                          <label>Count label</label>
                          <input
                            name={`items.${index}.subtitle`}
                            defaultValue={item.subtitle}
                            className="admin-input"
                          />
                        </div>
                        <div className="admin-field">
                          <label>Initials</label>
                          <input
                            name={`items.${index}.altText`}
                            defaultValue={item.altText}
                            className="admin-input"
                          />
                        </div>
                      </div>

                      <div className="admin-field">
                        <label>Review text</label>
                        <textarea
                          name={`items.${index}.description`}
                          defaultValue={item.description}
                          className="admin-textarea"
                        />
                      </div>
                    </>
                  ) : isClinicGallerySection ? (
                    <>
                      <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                      <input type="hidden" name={`items.${index}.title`} value={item.title} />
                      <input type="hidden" name={`items.${index}.subtitle`} value={item.subtitle} />
                      <input type="hidden" name={`items.${index}.description`} value={item.description} />
                      <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                      <input type="hidden" name={`items.${index}.linkUrl`} value={item.linkUrl} />
                      <input type="hidden" name={`items.${index}.altText`} value={item.altText} />

                      <MediaUrlField
                        name={`items.${index}.imageUrl`}
                        label="Image URL"
                        defaultValue={item.imageUrl}
                      />
                    </>
                  ) : isInfluencersSection ? (
                    <>
                      <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                      <input type="hidden" name={`items.${index}.title`} value={item.title} />
                      <input type="hidden" name={`items.${index}.subtitle`} value={item.subtitle} />
                      <input type="hidden" name={`items.${index}.description`} value={item.description} />
                      <input type="hidden" name={`items.${index}.linkUrl`} value={item.linkUrl} />
                      <input type="hidden" name={`items.${index}.altText`} value={item.altText} />

                      <div className="admin-form-grid">
                        <div className="admin-field">
                          <label>Video URL</label>
                          <input
                            name={`items.${index}.videoUrl`}
                            defaultValue={item.videoUrl}
                            className="admin-input"
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                        <MediaUrlField
                          name={`items.${index}.imageUrl`}
                          label="Cover image URL"
                          defaultValue={item.imageUrl}
                          placeholder="https://example.com/cover.jpg"
                        />
                      </div>
                    </>
                  ) : isHotelSection ? (
                    <>
                      <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                      <input type="hidden" name={`items.${index}.subtitle`} value={item.subtitle} />
                      <input type="hidden" name={`items.${index}.imageUrl`} value={item.imageUrl} />
                      <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                      <input type="hidden" name={`items.${index}.linkUrl`} value={item.linkUrl} />
                      <input type="hidden" name={`items.${index}.altText`} value={item.altText} />
                      <input type="hidden" name={`items.${index}.description`} value={item.description} />

                      <div className="admin-field">
                        <label>Hotel service</label>
                        <input
                          name={`items.${index}.title`}
                          defaultValue={item.title}
                          className="admin-input"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="admin-form-grid">
                        <input type="hidden" name={`items.${index}.itemType`} value={item.itemType} />
                        <input type="hidden" name={`items.${index}.subtitle`} value={item.subtitle} />
                        <input type="hidden" name={`items.${index}.imageUrl`} value={item.imageUrl} />
                        <input type="hidden" name={`items.${index}.videoUrl`} value={item.videoUrl} />
                        <input type="hidden" name={`items.${index}.linkUrl`} value={item.linkUrl} />
                        <input type="hidden" name={`items.${index}.altText`} value={item.altText} />
                        <div className="admin-field">
                          <label>Title</label>
                          <input
                            name={`items.${index}.title`}
                            defaultValue={item.title}
                            className="admin-input"
                          />
                        </div>
                        {supportsItemIcons ? (
                          <div className="admin-field">
                            <label>Icon URL</label>
                            <input
                              name={`items.${index}.iconUrl`}
                              defaultValue={iconUrl}
                              className="admin-input"
                              placeholder="https://example.com/icon.svg"
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="admin-field">
                        <label>Description</label>
                        <textarea
                          name={`items.${index}.description`}
                          defaultValue={item.description}
                          className="admin-textarea"
                        />
                      </div>

                      {supportsItemIcons ? (
                        <IconPickerField name={`items.${index}.iconName`} value={iconName} />
                      ) : null}
                    </>
                  )}

                  <div className="admin-actions">
                    {isHotelSection ? null : (
                      <button
                        type="submit"
                        formAction={deleteSectionItemAction.bind(null, item.id)}
                        className="admin-button-danger"
                      >
                        Delete item
                      </button>
                    )}
                  </div>
                </article>
                );
              })}
            </div>

            <div className="admin-actions">
              <button
                type="submit"
                formAction={addSectionItemAction}
                className="admin-button-muted"
              >
                Add item
              </button>
              <button type="submit" className="admin-button">
                Save section
              </button>
            </div>
          </section>
        )}

      </form>

    </>
  );
}
