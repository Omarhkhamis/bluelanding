import type { Section } from "@/lib/cms";

type CertificatesGallerySectionProps = {
  section: Section;
};

export function CertificatesGallerySection({ section }: CertificatesGallerySectionProps) {
  const items = section.items.filter((item) => item.imageUrl.trim());

  if (!items.length) {
    return null;
  }

  return (
    <section id="certificates-gallery" className="certificates-section">
      <div className="container-dental">
        <div className="certificates-section__head">
          <p className="certificates-section__kicker">{section.subheading}</p>
          <h2 className="certificates-section__title">{section.heading}</h2>
          <p className="certificates-section__description">{section.description}</p>
        </div>

        <div className="certificates-section__track">
          {items.map((item) => (
            <figure key={item.id} className="certificates-section__item">
              <img
                src={item.imageUrl}
                alt={item.altText || item.title || "Certificate"}
                className="certificates-section__image"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
