import { Heart, MailOpen } from 'lucide-react';

export type EnvelopePhase = 'closed' | 'opening' | 'revealing';

/** A paper object drawn in layers: lining, folded note, pocket, then the flap and its seal. */
export default function LetterEnvelope({ date, label, phase, open }: { date: string; label: string; phase: EnvelopePhase; open: () => void }) {
  return <button className="time-envelope" data-phase={phase} aria-label={`Open letter from ${label}`} disabled={phase === 'revealing'} onClick={open}>
    <span className="env-body" aria-hidden="true">
      <span className="env-lining" />
      <span className="env-note"><i /><i /></span>
      <span className="env-pocket"><span className="env-side env-side-left" /><span className="env-side env-side-right" /><span className="env-bottom" /></span>
      <span className="env-address"><span>For my Nikki,</span><time dateTime={date}>{label}</time></span>
      <span className="env-flap-shade" />
      <span className="env-flap">
        <span className="env-flap-face env-flap-outer"><span className="env-flap-trim" /></span>
        <span className="env-flap-face env-flap-inner" />
        <span className="env-seal"><Heart size={15} strokeWidth={1.1} /></span>
      </span>
    </span>
    <span className="envelope-open-label"><MailOpen size={15} />Tap to open</span>
  </button>;
}
