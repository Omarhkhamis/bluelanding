"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type FormEvent,
  type ReactNode
} from "react";
import { ChevronRight, X } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  openSubmissionPopup,
  validateFormPayload
} from "@/lib/form-submit";
import { extractSiteLocaleFromPathname } from "@/lib/sites";

type ConsultationModalProviderProps = {
  children: ReactNode;
  locale: string;
  whatsappUrl: string;
};

type ConsultationModalContextValue = {
  openModal: () => void;
  closeModal: () => void;
};

type ConsultationModalTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

type TranslationKey = "ar" | "de" | "en" | "es" | "fr" | "it" | "ru" | "tr";

type LocalizedOption = {
  value: string;
  label: string;
};

type ModalCopy = {
  dialogTitle: string;
  closeLabel: string;
  stepLabel: string;
  stepOneTitle: string;
  stepOneDescription: string;
  stepTwoTitle: string;
  stepTwoDescription: string;
  stepThreeTitle: string;
  stepThreeDescription: string;
  selectedServiceLabel: string;
  fullNamePlaceholder: string;
  phonePlaceholder: string;
  emailPlaceholder: string;
  nextLabel: string;
  sendLabel: string;
  sendingLabel: string;
  submitError: string;
  popupError: string;
};

const ConsultationModalContext = createContext<ConsultationModalContextValue | null>(null);

const serviceOptionLabels: Array<{ value: string; labels: Record<TranslationKey, string> }> = [
  {
    value: "Dental implants",
    labels: {
      ar: "زراعة الأسنان",
      de: "Zahnimplantate",
      en: "Dental implants",
      es: "Implantes dentales",
      fr: "Implants dentaires",
      it: "Impianti dentali",
      ru: "Дентальные импланты",
      tr: "Dis implantlari"
    }
  },
  {
    value: "Full mouth implants",
    labels: {
      ar: "زراعة فك كامل",
      de: "Implantate für den ganzen Kiefer",
      en: "Full mouth implants",
      es: "Implantes de boca completa",
      fr: "Implants complets",
      it: "Impianti a bocca completa",
      ru: "Полная имплантация челюсти",
      tr: "Tam agiz implant tedavisi"
    }
  },
  {
    value: "Hollywood Smile",
    labels: {
      ar: "هوليوود سمايل",
      de: "Hollywood Smile",
      en: "Hollywood Smile",
      es: "Sonrisa de Hollywood",
      fr: "Hollywood Smile",
      it: "Hollywood Smile",
      ru: "Голливудская улыбка",
      tr: "Hollywood Smile"
    }
  }
];

const timelineOptionLabels: Array<{ value: string; labels: Record<TranslationKey, string> }> = [
  {
    value: "Within 3 months",
    labels: {
      ar: "خلال 3 أشهر",
      de: "Innerhalb von 3 Monaten",
      en: "Within 3 months",
      es: "Dentro de 3 meses",
      fr: "Dans les 3 prochains mois",
      it: "Entro 3 mesi",
      ru: "В течение 3 месяцев",
      tr: "3 ay icinde"
    }
  },
  {
    value: "Within 6 months",
    labels: {
      ar: "خلال 6 أشهر",
      de: "Innerhalb von 6 Monaten",
      en: "Within 6 months",
      es: "Dentro de 6 meses",
      fr: "Dans les 6 prochains mois",
      it: "Entro 6 mesi",
      ru: "В течение 6 месяцев",
      tr: "6 ay icinde"
    }
  },
  {
    value: "More than 6 months",
    labels: {
      ar: "بعد أكثر من 6 أشهر",
      de: "Nach mehr als 6 Monaten",
      en: "More than 6 months",
      es: "Despues de mas de 6 meses",
      fr: "Apres plus de 6 mois",
      it: "Tra piu di 6 mesi",
      ru: "Более чем через 6 месяцев",
      tr: "6 aydan sonra"
    }
  }
];

const modalCopyByLocale: Record<TranslationKey, ModalCopy> = {
  ar: {
    dialogTitle: "ابدأ خطة العلاج",
    closeLabel: "إغلاق",
    stepLabel: "الخطوة",
    stepOneTitle: "ما الخدمة التي تهتم بها؟",
    stepOneDescription: "اختر العلاج المناسب لك للانتقال مباشرة إلى الخطوة التالية.",
    stepTwoTitle: "أدخل بيانات التواصل",
    stepTwoDescription: "أضف الاسم ورقم الهاتف مع رمز الدولة والبريد الإلكتروني.",
    stepThreeTitle: "متى ترغب بالمجيء إلى تركيا للعلاج؟",
    stepThreeDescription: "اختر التوقيت الأنسب لك ثم أرسل الطلب.",
    selectedServiceLabel: "الخدمة المختارة",
    fullNamePlaceholder: "الاسم الكامل",
    phonePlaceholder: "رقم الهاتف",
    emailPlaceholder: "البريد الإلكتروني",
    nextLabel: "التالي",
    sendLabel: "إرسال",
    sendingLabel: "جارٍ الإرسال...",
    submitError: "تعذر إرسال الطلب الآن. حاول مرة أخرى.",
    popupError: "يرجى السماح بفتح نافذة واتساب للمتابعة."
  },
  de: {
    dialogTitle: "Behandlungsplan starten",
    closeLabel: "Schliessen",
    stepLabel: "Schritt",
    stepOneTitle: "Fur welche Behandlung interessieren Sie sich?",
    stepOneDescription: "Wahlen Sie die passende Leistung aus, um fortzufahren.",
    stepTwoTitle: "Kontaktangaben eingeben",
    stepTwoDescription: "Geben Sie Ihren Namen, Ihre Telefonnummer mit Landesvorwahl und Ihre E-Mail ein.",
    stepThreeTitle: "Wann mochten Sie fur die Behandlung in die Turkei kommen?",
    stepThreeDescription: "Wahlen Sie den passenden Zeitraum und senden Sie Ihre Anfrage.",
    selectedServiceLabel: "Gewahlte Behandlung",
    fullNamePlaceholder: "Vollstandiger Name",
    phonePlaceholder: "Telefonnummer",
    emailPlaceholder: "E-Mail-Adresse",
    nextLabel: "Weiter",
    sendLabel: "Senden",
    sendingLabel: "Wird gesendet...",
    submitError: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    popupError: "Bitte erlauben Sie das Offnen von WhatsApp, um fortzufahren."
  },
  en: {
    dialogTitle: "Start your treatment plan",
    closeLabel: "Close",
    stepLabel: "Step",
    stepOneTitle: "Which service are you interested in?",
    stepOneDescription: "Choose the treatment that fits you best to continue.",
    stepTwoTitle: "Enter your contact details",
    stepTwoDescription: "Add your name, phone number with country code, and email address.",
    stepThreeTitle: "When would you like to come to Turkey for treatment?",
    stepThreeDescription: "Choose the timing that suits you, then send your request.",
    selectedServiceLabel: "Selected service",
    fullNamePlaceholder: "Full name",
    phonePlaceholder: "Phone number",
    emailPlaceholder: "Email address",
    nextLabel: "Next",
    sendLabel: "Send",
    sendingLabel: "Sending...",
    submitError: "We couldn't send your request right now. Please try again.",
    popupError: "Please allow WhatsApp to open so we can continue."
  },
  es: {
    dialogTitle: "Inicia tu plan de tratamiento",
    closeLabel: "Cerrar",
    stepLabel: "Paso",
    stepOneTitle: "Que servicio te interesa?",
    stepOneDescription: "Elige el tratamiento adecuado para continuar.",
    stepTwoTitle: "Introduce tus datos de contacto",
    stepTwoDescription: "Anade tu nombre, numero de telefono con codigo de pais y correo electronico.",
    stepThreeTitle: "Cuando te gustaria venir a Turquia para el tratamiento?",
    stepThreeDescription: "Elige el momento adecuado y envia tu solicitud.",
    selectedServiceLabel: "Servicio seleccionado",
    fullNamePlaceholder: "Nombre completo",
    phonePlaceholder: "Numero de telefono",
    emailPlaceholder: "Correo electronico",
    nextLabel: "Siguiente",
    sendLabel: "Enviar",
    sendingLabel: "Enviando...",
    submitError: "No pudimos enviar tu solicitud ahora. Intentalo de nuevo.",
    popupError: "Permite que WhatsApp se abra para continuar."
  },
  fr: {
    dialogTitle: "Demarrer votre plan de traitement",
    closeLabel: "Fermer",
    stepLabel: "Etape",
    stepOneTitle: "Quel service vous interesse ?",
    stepOneDescription: "Choisissez le traitement qui vous convient pour continuer.",
    stepTwoTitle: "Saisissez vos coordonnees",
    stepTwoDescription: "Ajoutez votre nom, votre numero avec indicatif pays et votre e-mail.",
    stepThreeTitle: "Quand souhaitez-vous venir en Turquie pour le traitement ?",
    stepThreeDescription: "Choisissez le delai qui vous convient puis envoyez votre demande.",
    selectedServiceLabel: "Service choisi",
    fullNamePlaceholder: "Nom complet",
    phonePlaceholder: "Numero de telephone",
    emailPlaceholder: "Adresse e-mail",
    nextLabel: "Suivant",
    sendLabel: "Envoyer",
    sendingLabel: "Envoi...",
    submitError: "Impossible d'envoyer votre demande pour le moment. Veuillez reessayer.",
    popupError: "Veuillez autoriser l'ouverture de WhatsApp pour continuer."
  },
  it: {
    dialogTitle: "Avvia il tuo piano di trattamento",
    closeLabel: "Chiudi",
    stepLabel: "Passo",
    stepOneTitle: "A quale servizio sei interessato?",
    stepOneDescription: "Scegli il trattamento piu adatto a te per continuare.",
    stepTwoTitle: "Inserisci i tuoi contatti",
    stepTwoDescription: "Aggiungi nome, numero di telefono con prefisso internazionale ed email.",
    stepThreeTitle: "Quando vorresti venire in Turchia per il trattamento?",
    stepThreeDescription: "Scegli il periodo piu adatto e invia la richiesta.",
    selectedServiceLabel: "Servizio selezionato",
    fullNamePlaceholder: "Nome completo",
    phonePlaceholder: "Numero di telefono",
    emailPlaceholder: "Email",
    nextLabel: "Avanti",
    sendLabel: "Invia",
    sendingLabel: "Invio in corso...",
    submitError: "Non siamo riusciti a inviare la richiesta. Riprova.",
    popupError: "Consenti l'apertura di WhatsApp per continuare."
  },
  ru: {
    dialogTitle: "Начать план лечения",
    closeLabel: "Закрыть",
    stepLabel: "Шаг",
    stepOneTitle: "Какая услуга вас интересует?",
    stepOneDescription: "Выберите подходящее лечение, чтобы перейти к следующему шагу.",
    stepTwoTitle: "Введите ваши контактные данные",
    stepTwoDescription: "Укажите имя, номер телефона с кодом страны и адрес электронной почты.",
    stepThreeTitle: "Когда вы хотели бы приехать в Турцию на лечение?",
    stepThreeDescription: "Выберите подходящий срок и отправьте заявку.",
    selectedServiceLabel: "Выбранная услуга",
    fullNamePlaceholder: "Полное имя",
    phonePlaceholder: "Номер телефона",
    emailPlaceholder: "Электронная почта",
    nextLabel: "Далее",
    sendLabel: "Отправить",
    sendingLabel: "Отправка...",
    submitError: "Не удалось отправить заявку. Пожалуйста, попробуйте еще раз.",
    popupError: "Пожалуйста, разрешите открыть WhatsApp для продолжения."
  },
  tr: {
    dialogTitle: "Tedavi planinizi baslatin",
    closeLabel: "Kapat",
    stepLabel: "Adim",
    stepOneTitle: "Hangi hizmetle ilgileniyorsunuz?",
    stepOneDescription: "Devam etmek icin size uygun tedaviyi secin.",
    stepTwoTitle: "Iletisim bilgilerinizi girin",
    stepTwoDescription: "Adinizi, ulke kodlu telefon numaranizi ve e-posta adresinizi ekleyin.",
    stepThreeTitle: "Tedavi icin Turkiye'ye ne zaman gelmek istersiniz?",
    stepThreeDescription: "Size uygun zamani secin ve talebinizi gonderin.",
    selectedServiceLabel: "Secilen hizmet",
    fullNamePlaceholder: "Ad soyad",
    phonePlaceholder: "Telefon numarasi",
    emailPlaceholder: "E-posta adresi",
    nextLabel: "Ileri",
    sendLabel: "Gonder",
    sendingLabel: "Gonderiliyor...",
    submitError: "Talebiniz su anda gonderilemedi. Lutfen tekrar deneyin.",
    popupError: "Devam etmek icin lutfen WhatsApp acilmasina izin verin."
  }
};

function resolveTranslationKey(locale: string): TranslationKey {
  const normalized = String(locale || "").trim().toLowerCase();

  if (normalized.startsWith("ar")) {
    return "ar";
  }

  if (normalized.startsWith("de")) {
    return "de";
  }

  if (normalized.startsWith("es")) {
    return "es";
  }

  if (normalized.startsWith("fr")) {
    return "fr";
  }

  if (normalized.startsWith("it")) {
    return "it";
  }

  if (normalized.startsWith("ru")) {
    return "ru";
  }

  if (normalized.startsWith("tr")) {
    return "tr";
  }

  return "en";
}

function isRtlLocale(locale: string) {
  return resolveTranslationKey(locale) === "ar";
}

function getLocalizedOptions(
  locale: string,
  source: Array<{ value: string; labels: Record<TranslationKey, string> }>
): LocalizedOption[] {
  const key = resolveTranslationKey(locale);
  return source.map((option) => ({
    value: option.value,
    label: option.labels[key] || option.labels.en
  }));
}

function buildAdminSummary(serviceInterest: string, visitTimeline: string) {
  return `Service: ${serviceInterest}\nTravel timing: ${visitTimeline}`;
}

export function ConsultationModalProvider({
  children,
  locale,
  whatsappUrl
}: ConsultationModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConsultationModalContext.Provider
      value={{
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false)
      }}
    >
      {children}
      <ConsultationModal
        isOpen={isOpen}
        locale={locale}
        whatsappUrl={whatsappUrl}
        onClose={() => setIsOpen(false)}
      />
    </ConsultationModalContext.Provider>
  );
}

export function ConsultationModalTrigger({
  children,
  onClick,
  type = "button",
  ...props
}: ConsultationModalTriggerProps) {
  const context = useContext(ConsultationModalContext);

  if (!context) {
    throw new Error("ConsultationModalTrigger must be used within ConsultationModalProvider.");
  }

  return (
    <button
      {...props}
      type={type}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          context.openModal();
        }
      }}
    >
      {children}
    </button>
  );
}

function ConsultationModal({
  isOpen,
  locale,
  whatsappUrl,
  onClose
}: {
  isOpen: boolean;
  locale: string;
  whatsappUrl: string;
  onClose: () => void;
}) {
  const copy = modalCopyByLocale[resolveTranslationKey(locale)] || modalCopyByLocale.en;
  const serviceOptions = useMemo(() => getLocalizedOptions(locale, serviceOptionLabels), [locale]);
  const timelineOptions = useMemo(() => getLocalizedOptions(locale, timelineOptionLabels), [locale]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [serviceInterest, setServiceInterest] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("+90");
  const [email, setEmail] = useState("");
  const [visitTimeline, setVisitTimeline] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
  }>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();
  const currentServiceLabel =
    serviceOptions.find((option) => option.value === serviceInterest)?.label || serviceInterest;
  const direction = isRtlLocale(locale) ? "rtl" : "ltr";

  function resetState() {
    setStep(1);
    setServiceInterest("");
    setFullName("");
    setPhoneNumber("+90");
    setEmail("");
    setVisitTimeline("");
    setFieldErrors({});
    setSubmitError("");
    setIsSubmitting(false);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetState();
    onClose();
  }

  function clearFieldError(field: "fullName" | "phone" | "email") {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined
    }));
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting]);

  if (!isOpen) {
    return null;
  }

  async function handleStepTwoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateFormPayload(
      {
        fullName,
        phone: phoneNumber || "",
        email
      },
      { requireEmail: true }
    );

    if (!validation.ok) {
      setFieldErrors({
        [validation.field]: validation.text
      });
      setSubmitError("");
      return;
    }

    setFieldErrors({});
    setSubmitError("");
    setFullName(validation.fullName);
    setPhoneNumber(validation.phone);
    setEmail(validation.email);
    setStep(3);
  }

  async function handleStepThreeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!visitTimeline || isSubmitting) {
      return;
    }

    const validation = validateFormPayload(
      {
        fullName,
        phone: phoneNumber || "",
        email
      },
      { requireEmail: true }
    );

    if (!validation.ok) {
      setFieldErrors({
        [validation.field]: validation.text
      });
      setSubmitError("");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const popup = openSubmissionPopup();
    const pathname = window.location.pathname;
    const routeContext = extractSiteLocaleFromPathname(pathname);
    const payload = {
      source: "consultation-modal",
      formName: "Consultation Modal",
      page: pathname,
      site: routeContext.siteKey,
      locale: routeContext.locale,
      whatsappUrl,
      fullName: validation.fullName,
      phone: validation.phone,
      email: validation.email,
      serviceInterest,
      visitTimeline,
      message: buildAdminSummary(serviceInterest, visitTimeline)
    };

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      const nextWhatsappUrl = String(data?.whatsappUrl || data?.redirectTo || "");
      const thankYouUrl = String(data?.thankYouUrl || "");

      if (!response.ok || !data?.ok || !nextWhatsappUrl) {
        popup?.close();
        setSubmitError(copy.submitError);
        setIsSubmitting(false);
        return;
      }

      if (popup) {
        popup.location.replace(nextWhatsappUrl);
      } else {
        const openedWindow = window.open(nextWhatsappUrl, "_blank", "noopener,noreferrer");

        if (!openedWindow) {
          setSubmitError(copy.popupError);
          setIsSubmitting(false);
          return;
        }
      }

      resetState();
      onClose();

      if (thankYouUrl) {
        window.location.assign(thankYouUrl);
      }
    } catch {
      popup?.close();
      setSubmitError(copy.submitError);
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.32)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        dir={direction}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-dental-navy to-primary" />

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
              {copy.stepLabel} {step} / 3
            </p>
            <h2 id={titleId} className="mt-2 text-2xl font-bold text-dental-navy">
              {copy.dialogTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
            aria-label={copy.closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((value) => (
              <span
                key={value}
                className={`h-2 flex-1 rounded-full ${
                  value <= step ? "bg-primary" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {serviceInterest ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-dental-navy">
              <span className="text-slate-500">{copy.selectedServiceLabel}:</span>
              <span>{currentServiceLabel}</span>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-dental-navy">{copy.stepOneTitle}</h3>
                <p className="text-sm leading-7 text-slate-600">{copy.stepOneDescription}</p>
              </div>

              <div className="grid gap-3">
                {serviceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setServiceInterest(option.value);
                      setSubmitError("");
                      setStep(2);
                    }}
                    className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <span className="text-base font-semibold text-dental-navy">{option.label}</span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-transform group-hover:translate-x-1">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <form className="space-y-5" onSubmit={handleStepTwoSubmit}>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-dental-navy">{copy.stepTwoTitle}</h3>
                <p className="text-sm leading-7 text-slate-600">{copy.stepTwoDescription}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      clearFieldError("fullName");
                    }}
                    placeholder={copy.fullNamePlaceholder}
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary ${
                      fieldErrors.fullName ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                  {fieldErrors.fullName ? (
                    <p className="text-sm text-red-500">{fieldErrors.fullName}</p>
                  ) : null}
                </div>

                <div className="space-y-2" dir="ltr">
                  <PhoneInput
                    international
                    defaultCountry="TR"
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value);
                      clearFieldError("phone");
                    }}
                    className={`phone-input rounded-xl border bg-white ${
                      fieldErrors.phone ? "border-red-400" : "border-slate-200"
                    }`}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    countrySelectProps={{ "aria-label": "Country code" }}
                    placeholder={copy.phonePlaceholder}
                  />
                  {fieldErrors.phone ? (
                    <p className="text-sm text-red-500" dir={direction}>
                      {fieldErrors.phone}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearFieldError("email");
                    }}
                    placeholder={copy.emailPlaceholder}
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary ${
                      fieldErrors.email ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                  {fieldErrors.email ? (
                    <p className="text-sm text-red-500">{fieldErrors.email}</p>
                  ) : null}
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-dental-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-dental-navy/90"
              >
                {copy.nextLabel}
              </button>
            </form>
          ) : null}

          {step === 3 ? (
            <form className="space-y-5" onSubmit={handleStepThreeSubmit}>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-dental-navy">{copy.stepThreeTitle}</h3>
                <p className="text-sm leading-7 text-slate-600">{copy.stepThreeDescription}</p>
              </div>

              <div className="grid gap-3">
                {timelineOptions.map((option) => {
                  const isSelected = visitTimeline === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVisitTimeline(option.value)}
                      className={`w-full rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
                        isSelected
                          ? "border-primary bg-primary/10 text-dental-navy"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {submitError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!visitTimeline || isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? copy.sendingLabel : copy.sendLabel}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
