# PHP alert closure with public advisories and invented assets

These three cases assess **CVE-2026-109618 only**. `demo-shop.example`, its inventory and its PHP Info observations are invented. No real website was inspected or described as compromised. Missing remediation evidence does not establish that a site is vulnerable.

The fixture policy requires an exact asset/platform binding, applicable remediation and a current observation of the website's serving PHP runtime meeting provider verification guidance. It does not accept a fleet announcement, shell binary version or firewall claim alone as asset patch proof.

| Case | Human reference | Evidence distinction |
| --- | --- | --- |
| PHP · Rollout only | insufficient_information | No site tier or serving-runtime observation accompanies the public notice. |
| PHP · Bound backport | supported | Invented managed Web Hosting inventory and a same-site PHP Info record show version 8.5.11 with Build Date 22 October 2026. |
| PHP · Customer VPS | insufficient_information | Invented inventory identifies a customer-managed VPS, without customer patch or serving-runtime proof. |

These are fixture-author references, separate from actual Sapling outputs. The supported reference means the supplied synthetic record meets this narrow policy under the provider's verification guidance; it is not an independent binary audit or a general PHP safety claim.

## Frozen source context

[Hostinger's status entry, 22 October 2026 at 06:44 UTC](https://statuspage.hostinger.com/incidents/pj2zs1lx3n9d), explains the managed backport version display and the site PHP Info Build Date check, and excludes customer VPS from its managed rollout. The fixtures paraphrase this dated entry.

The [PHP CNA record for CVE-2026-109618](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/109xxx/CVE-2026-109618.json) is PUBLISHED in CVE format 5.2, updated 23 October 2026 at 14:07:55.926 UTC. Its branch-specific upstream ranges provide vulnerability context, not an individual site's patch state. [The upstream PHP advisory](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) is linked for attribution.

`sources/php-hosting.json` freezes the actual fetched record hash, retrieval time, minimal factual fields and source URLs. The full record, corpus and advisory prose are not redistributed. Source records are not assumed to be MIT/Apache licensed; the [CVE terms](https://www.cve.org/Legal/TermsOfUse) remain linked to their publisher.

Hostinger's [later advisory update](https://www.hostinger.com/blog/protecting-php2shell/), dated 23 October at 13:25 UTC, also discusses CVE-2026-115560. That CVE, CVE-2026-109619, and all-vulnerability closure claims are outside these fixtures.

## Run discipline

The owner approved three additional attempts after the five original calls: exactly one per PHP case, with no tuning or retries. The ledger total is capped at eight. Complete results and actual outputs are retained as receipts; unexpected labels must remain visible. A filesystem lock serializes reservations across instances sharing the same receipts directory, and the server reloads the ledger/access stop while holding that lock. A stale lock after a crash blocks new calls until its pending receipt has been inspected.
