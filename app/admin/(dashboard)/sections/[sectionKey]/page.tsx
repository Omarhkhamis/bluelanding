import { notFound } from "next/navigation";
import {
  addSectionItemAction,
  deleteSectionItemAction,
  saveSectionAction
} from "@/app/admin/actions";
import { IconPickerField } from "@/components/admin/icon-picker-field";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { StatusNotice } from "@/components/admin/status-notice";
import { getSectionItemIconSettings } from "@/lib/admin-icons";
import { getSectionByKey } from "@/lib/cms";

export default async function AdminSectionEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ sectionKey: string }>;
  searchParams: Promise<{ locale?: string; status?: string }>;
}) {
  const { sectionKey } = await params;
  const { locale = "en", status } = await searchParams;
  const section = await getSectionByKey(sectionKey, locale);

  if (!section) {
    notFound();
  }

  const isHeroSection = section.key === "hero";
  const isHeaderSection = section.key === "header";
  const isServicesSection = section.key === "services";
  const isBeforeAfterSection = section.key === "before-after";
  const isClinicGallerySection = section.key === "clinic-gallery";
  const isInfluencersSection = section.key === "influencers";
  const isHotelSection = section.key === "hotel";
  const supportsItemIcons = section.key === "why-choose" || section.key === "service-details";
  const isConsultationSection =
    section.key === "consultation-virtual" || section.key === "consultation-online";
  const addItemType = isHeaderSection
    ? "nav-link"
    : isServicesSection
      ? "service"
      : isBeforeAfterSection
        ? "slide"
        : isClinicGallerySection
          ? "image"
        : isInfluencersSection
          ? "video"
        : "default";
  const heroBackgroundImage =
    section.imageUrl || section.items.find((item) => item.itemType === "image")?.imageUrl || "";
  const hotelSettings =
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
            Editing locale {locale.toUpperCase()} for key <strong>{section.key}</strong>.
          </p>
        </div>
      </div>

      <StatusNotice status={status} />

      <form action={saveSectionAction} className="admin-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="returnPath" value={`/admin/sections/${section.key}`} />
        <input type="hidden" name="key" value={section.key} />
        <input type="hidden" name="sectionKey" value={section.key} />
        <input type="hidden" name="addItemType" value={addItemType} />

        {isHeaderSection ? (
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

        {isHeroSection || isHeaderSection || isConsultationSection ? null : (
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
                          <label>Service title</label>
                          <input
                            name={`items.${index}.title`}
                            defaultValue={item.title}
                            className="admin-input"
                          />
                        </div>
                        <MediaUrlField
                          name={`items.${index}.imageUrl`}
                          label="Service image URL"
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
                        <label>Service items</label>
                        <textarea
                          name={`items.${index}.itemsText`}
                          defaultValue={((item.settings.items as string[] | undefined) || []).join("\n")}
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

        {isHeroSection ? (
          <div className="admin-actions">
            <button type="submit" className="admin-button">
              Save section
            </button>
          </div>
        ) : null}
      </form>

    </>
  );
}
