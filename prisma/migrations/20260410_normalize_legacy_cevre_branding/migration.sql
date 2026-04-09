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
    WHEN whatsapp_url = 'https://api.whatsapp.com/send?phone=905518622525&text=What%20are%20the%20options%20and%20pricing%20for%20dental%20treatment'
      THEN 'https://wa.me/905528007000?text=Hello%2C%20I%20am%20interested%20in%20dental%20implants.%20Could%20you%20please%20provide%20details%20about%20the%20procedure%2C%20timeline%2C%20and%20price%3F'
    ELSE whatsapp_url
  END,
  updated_at = NOW()
WHERE
  site_name = 'CevreDent'
  OR site_title = 'CevreDent - Dental Clinic in Turkey'
  OR site_description = 'Experience world-class dental treatments with CevreDent.'
  OR whatsapp_url = 'https://api.whatsapp.com/send?phone=905518622525&text=What%20are%20the%20options%20and%20pricing%20for%20dental%20treatment';

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
  OR copyright_text = '© 2024 CevreDent Clinic. All rights reserved.';

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
);

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
  OR canonical_url = 'https://dental.cevredentalturkey.com';

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
    WHEN button_url = 'https://api.whatsapp.com/send?phone=905518622525&text=What%20are%20the%20options%20and%20pricing%20for%20dental%20treatment'
      THEN 'https://wa.me/905528007000?text=Hello%2C%20I%20am%20interested%20in%20dental%20implants.%20Could%20you%20please%20provide%20details%20about%20the%20procedure%2C%20timeline%2C%20and%20price%3F'
    ELSE button_url
  END,
  updated_at = NOW()
WHERE
  heading = 'CevreDent Service Details Content'
  OR description = 'with CevreDent Clinic''s Affordable Services'
  OR button_url = 'https://api.whatsapp.com/send?phone=905518622525&text=What%20are%20the%20options%20and%20pricing%20for%20dental%20treatment';

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
  OR description = 'Discover CevreDent''s full range of dental services, including restorations, procedures, and solutions designed to suit all of your dental requirements.';
