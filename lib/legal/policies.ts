import type { StoreFulfillmentPolicy, StorePublic } from "@/lib/api-server";
import { getStoreDisplayName } from "@/lib/store-display";

/**
 * Default, personalised legal/policy content for a storefront — the standard
 * pages a KSA e-commerce store is expected to publish (نظام التجارة الإلكترونية /
 * متطلبات وزارة التجارة), mirroring what Salla and similar platforms ship.
 *
 * These are SENSIBLE DEFAULTS, auto-filled with the store's name and contact
 * details. They are a starting point — the merchant should review and tailor
 * them (return window, fees, etc.) and they should be checked by a legal
 * advisor before relying on them. A future iteration makes them editable per
 * store from the store settings.
 */

export type PolicyKey = "about" | "terms" | "privacy" | "returns" | "shipping" | "contact";

export type PolicySection = { heading?: string; body: string[] };
export type PolicyDoc = { key: PolicyKey; title: string; intro?: string; sections: PolicySection[] };

/** Footer link order (Salla-style). `contact` is rendered inline too. */
export const POLICY_LINKS: { key: PolicyKey; label: string }[] = [
  { key: "about", label: "من نحن" },
  { key: "terms", label: "الشروط والأحكام" },
  { key: "privacy", label: "سياسة الخصوصية" },
  { key: "returns", label: "الاستبدال والاسترجاع" },
  { key: "shipping", label: "الشحن والتوصيل" },
  { key: "contact", label: "اتصل بنا" },
];

export const POLICY_KEYS: PolicyKey[] = POLICY_LINKS.map((l) => l.key);

export function isPolicyKey(value: string): value is PolicyKey {
  return (POLICY_KEYS as string[]).includes(value);
}

export function policyLabel(key: PolicyKey): string {
  return POLICY_LINKS.find((l) => l.key === key)?.label ?? key;
}

function contactLines(store: StorePublic): string[] {
  const lines: string[] = [];
  if (store.contact_phone) lines.push(`الهاتف: ${store.contact_phone}`);
  if (store.contact_whatsapp) lines.push(`واتساب: ${store.contact_whatsapp}`);
  if (store.contact_email) lines.push(`البريد الإلكتروني: ${store.contact_email}`);
  if (store.area?.name_ar) lines.push(`المنطقة: ${store.area.name_ar}`);
  if (lines.length === 0) lines.push("يمكنك التواصل معنا عبر صفحة المتجر.");
  return lines;
}

function fulfillmentDoc(
  key: "returns" | "shipping",
  policy: StoreFulfillmentPolicy,
): PolicyDoc {
  const sectionKeys =
    key === "returns"
      ? ["ordinary_return", "fault_damage", "timing", "mandatory_rights"]
      : ["failed_delivery", "local_international", "timing", "mandatory_rights"];
  const sections: PolicySection[] = [];

  if (key === "shipping") {
    sections.push({
      heading: "مسؤوليات الأطراف",
      body: policy.responsibilities.map(({ party, body }) => `${party}: ${body}`),
    });
  }

  sections.push(
    ...policy.sections
      .filter((section) => sectionKeys.includes(section.key))
      .map((section) => ({ heading: section.title, body: section.paragraphs })),
  );

  if (policy.additional_terms) {
    sections.push({
      heading: "شروط المتجر الإضافية",
      body: [
        policy.additional_terms,
        "لا تسري الشروط الإضافية إذا تعارضت مع حق إلزامي للعميل.",
      ],
    });
  }

  return {
    key,
    title:
      key === "returns"
        ? "سياسة الاستبدال والاسترجاع"
        : "سياسة الشحن والتوصيل وإعادة الشحن",
    intro: policy.summary,
    sections,
  };
}

export function getPolicyDoc(
  key: PolicyKey,
  store: StorePublic,
  fulfillmentPolicy?: StoreFulfillmentPolicy,
): PolicyDoc {
  const name = getStoreDisplayName(store);

  if ((key === "returns" || key === "shipping") && fulfillmentPolicy) {
    return fulfillmentDoc(key, fulfillmentPolicy);
  }

  switch (key) {
    case "about":
      return {
        key,
        title: "من نحن",
        intro: store.description || undefined,
        sections: [
          {
            body: [
              `${name} متجر إلكتروني يقدّم منتجاته وخدماته عبر منصة «متاجر داسم». نحرص على توفير منتجات أصلية بأسعار عادلة وتجربة شراء آمنة وسهلة.`,
              "نلتزم بخدمة عملائنا وتلبية احتياجاتهم، ونسعى دائماً لتطوير منتجاتنا وخدماتنا بما يضمن رضاكم.",
            ],
          },
          { heading: "رؤيتنا", body: ["أن نكون وجهتكم الموثوقة للتسوّق الإلكتروني بجودة عالية وخدمة متميّزة."] },
        ],
      };

    case "terms":
      return {
        key,
        title: "الشروط والأحكام",
        intro: `باستخدامك متجر ${name} فإنك توافق على الشروط والأحكام التالية.`,
        sections: [
          { heading: "الحساب والطلبات", body: [
            "يلتزم العميل بتقديم معلومات صحيحة وكاملة عند إنشاء الطلب.",
            "تُعدّ الأسعار المعروضة شاملة لضريبة القيمة المضافة ما لم يُذكر خلاف ذلك، وقد تتغيّر دون إشعار مسبق.",
          ]},
          { heading: "الدفع", body: [
            "تتم المدفوعات عبر وسائل الدفع المعتمدة في المتجر (مدى، Visa، Mastercard، Apple Pay وغيرها).",
            "يُعالَج الطلب بعد تأكيد عملية الدفع.",
          ]},
          { heading: "المسؤولية", body: [
            "يبذل المتجر جهده لعرض المنتجات بدقّة، ولا يتحمّل مسؤولية الأخطاء غير المقصودة في الوصف أو الصور.",
          ]},
          { heading: "الأنظمة المعمول بها", body: [
            "تخضع هذه الشروط لأنظمة المملكة العربية السعودية، بما فيها نظام التجارة الإلكترونية ولوائحه.",
          ]},
        ],
      };

    case "privacy":
      return {
        key,
        title: "سياسة الخصوصية",
        intro: `تحرص ${name} على حماية خصوصية عملائها ومعالجة بياناتهم وفق نظام حماية البيانات الشخصية في المملكة العربية السعودية.`,
        sections: [
          { heading: "البيانات التي نجمعها", body: [
            "الاسم، وبيانات التواصل، وعنوان الشحن، وتفاصيل الطلب اللازمة لإتمام عملية الشراء والتوصيل.",
          ]},
          { heading: "كيفية استخدام البيانات", body: [
            "تُستخدم بياناتك لمعالجة الطلبات والتوصيل وخدمة العملاء وتحسين تجربة التسوّق.",
            "لا نبيع بياناتك لأي طرف ثالث. وقد نعالجها مع مزوّدي الدفع والشحن لإتمام الخدمة، ومع مزوّدي القياس الإعلاني الموضحين أدناه إذا وافقت على ذلك.",
          ]},
          { heading: "القياس الإعلاني وملفات الارتباط", body: [
            "قد يستخدم المتجر أدوات قياس إعلانية تابعة لمنصات مثل تيك توك وسناب شات وميتا وجوجل لقياس زيارات المنتجات والإضافات إلى السلة والمشتريات المدفوعة.",
            "لا تُفعّل أدوات القياس الإعلاني قبل موافقتك. ويمكنك رفضها أو تغيير اختيارك في أي وقت من زر «إعدادات الخصوصية» الظاهر في المتجر.",
          ]},
          { heading: "حقوقك", body: [
            "يحق لك الاطلاع على بياناتك وتصحيحها أو طلب حذفها وفق الأنظمة المعمول بها.",
          ]},
        ],
      };

    case "returns":
      return {
        key,
        title: "سياسة الاستبدال والاسترجاع",
        intro: `يسعدنا في ${name} ضمان رضاك عن مشترياتك.`,
        sections: [
          { heading: "حق الاسترجاع", body: [
            "يمكنك طلب الاسترجاع للمنتج غير المستخدم خلال (٧) أيام من استلامه، مع بقاء حقوقك النظامية في العيب أو الخطأ أو التلف محفوظة.",
          ]},
          { heading: "آلية الطلب", body: [
            "تواصل معنا عبر وسائل التواصل الموضّحة في صفحة «اتصل بنا» مع رقم الطلب وسبب الإرجاع، وسنوجّهك لخطوات الإرجاع.",
          ]},
          { heading: "استرداد المبلغ", body: [
            "يؤكد المتجر نتيجة الفحص والحل، ثم يُعاد المبلغ عبر المسار المعتمد خلال مدة معالجة مزوّد الدفع.",
          ]},
          { heading: "استثناءات", body: [
            "قد تُستثنى بعض المنتجات من الاسترجاع لطبيعتها (كالمنتجات المخصّصة أو القابلة للتلف)، ويُوضَّح ذلك عند الشراء.",
          ]},
        ],
      };

    case "shipping":
      return {
        key,
        title: "سياسة الشحن والتوصيل",
        intro: `نوصّل طلبات ${name} عبر شركاء شحن موثوقين.`,
        sections: [
          { heading: "مدّة التوصيل", body: [
            "تُجهَّز الطلبات وتُسلَّم لشركة الشحن خلال أيام العمل، وتختلف مدّة الوصول حسب المنطقة وشركة الشحن.",
          ]},
          { heading: "رسوم الشحن", body: [
            "تُحتسب رسوم الشحن وتظهر عند إتمام الطلب قبل الدفع.",
          ]},
          { heading: "التتبّع", body: [
            "نوافيك ببيانات تتبّع الشحنة عند توفّرها لمتابعة طلبك حتى الاستلام.",
          ]},
        ],
      };

    case "contact":
      return {
        key,
        title: "اتصل بنا",
        intro: `يسعدنا تواصلك مع ${name}.`,
        sections: [{ heading: "وسائل التواصل", body: contactLines(store) }],
      };
  }
}
