import type { SectionItem } from "@/lib/cms";
import {
  Award,
  BadgeCheck,
  BedDouble,
  Building,
  Car,
  Check,
  Clock3,
  Coffee,
  Gem,
  Globe2,
  HeartHandshake,
  MapPin,
  MessageSquare,
  Phone,
  Plane,
  RefreshCw,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Wifi,
  type LucideIcon
} from "lucide-react";

type IconOption = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

export const adminIconOptions: IconOption[] = [
  { value: "check", label: "Check", Icon: Check },
  { value: "shield-check", label: "Shield Check", Icon: ShieldCheck },
  { value: "badge-check", label: "Badge Check", Icon: BadgeCheck },
  { value: "stethoscope", label: "Stethoscope", Icon: Stethoscope },
  { value: "sparkles", label: "Sparkles", Icon: Sparkles },
  { value: "smile", label: "Smile", Icon: Smile },
  { value: "heart-handshake", label: "Heart Handshake", Icon: HeartHandshake },
  { value: "users", label: "Users", Icon: Users },
  { value: "award", label: "Award", Icon: Award },
  { value: "gem", label: "Gem", Icon: Gem },
  { value: "globe", label: "Globe", Icon: Globe2 },
  { value: "phone", label: "Phone", Icon: Phone },
  { value: "message-square", label: "Message", Icon: MessageSquare },
  { value: "refresh", label: "Refresh", Icon: RefreshCw },
  { value: "car", label: "Car", Icon: Car },
  { value: "building", label: "Building", Icon: Building },
  { value: "plane", label: "Plane", Icon: Plane },
  { value: "bed-double", label: "Bed", Icon: BedDouble },
  { value: "coffee", label: "Coffee", Icon: Coffee },
  { value: "wifi", label: "Wifi", Icon: Wifi },
  { value: "map-pin", label: "Map Pin", Icon: MapPin },
  { value: "star", label: "Star", Icon: Star },
  { value: "clock", label: "Clock", Icon: Clock3 }
];

const iconMap = Object.fromEntries(adminIconOptions.map((option) => [option.value, option.Icon]));

export function getAdminIconOption(value: string) {
  return adminIconOptions.find((option) => option.value === value) || null;
}

function readIconSetting(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getSectionItemIconSettings(item: Pick<SectionItem, "settings">) {
  const settings = item.settings && typeof item.settings === "object" ? item.settings : {};

  return {
    iconName: readIconSetting(settings.iconName),
    iconUrl: readIconSetting(settings.iconUrl)
  };
}

type ConfiguredSectionIconProps = {
  item: Pick<SectionItem, "settings">;
  fallbackIconName: string;
  wrapperClassName?: string;
  iconClassName?: string;
  imageClassName?: string;
};

export function ConfiguredSectionIcon({
  item,
  fallbackIconName,
  wrapperClassName,
  iconClassName,
  imageClassName
}: ConfiguredSectionIconProps) {
  const { iconName, iconUrl } = getSectionItemIconSettings(item);

  if (iconUrl) {
    return (
      <span className={wrapperClassName}>
        <img
          src={iconUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={imageClassName}
        />
      </span>
    );
  }

  const Icon = iconMap[iconName] || iconMap[fallbackIconName] || Check;

  return (
    <span className={wrapperClassName}>
      <Icon className={iconClassName} />
    </span>
  );
}
