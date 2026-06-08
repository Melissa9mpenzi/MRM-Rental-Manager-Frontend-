import PropertyVerificationBadges, {
  PROPERTY_LISTING_IDENTITY_TAGLINE,
} from "./PropertyVerificationBadges";

/** @deprecated Use PropertyVerificationBadges — kept for imports that expect Sui-only badge. */
export default function PropertyIdentityBadge(props) {
  return <PropertyVerificationBadges {...props} />;
}

export const PROPERTY_IDENTITY_DEMO_LINE = PROPERTY_LISTING_IDENTITY_TAGLINE;
