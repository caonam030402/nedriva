'use client';

import { PricingTable } from '@clerk/nextjs';
import { Card } from '@heroui/react/card';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { clerkAppearance } from '@/libs/core/ClerkAppearance';
import { Env } from '@/libs/core/Env';
import { usePostCheckoutAbsoluteUrl } from '@/libs/i18n/usePostCheckoutAbsoluteUrl';
import { Routes } from '@/utils/Routes';

/**
 * Public pricing — plans and checkout come from [Clerk Billing](https://clerk.com/docs/billing/overview).
 * Configure products/plans in the Clerk Dashboard; this page only embeds `<PricingTable />`.
 */
type BillingPayer = 'user' | 'organization';

export function PricingPlansView() {
  const t = useTranslations('CreditsPage');
  const showOrganizationBilling = Env.NEXT_PUBLIC_CLERK_ORG_BILLING_ENABLED;
  const [billingPayer, setBillingPayer] = useState<BillingPayer>('user');
  const newSubscriptionRedirectUrl = usePostCheckoutAbsoluteUrl(Routes.dashboard.index);

  /** Clerk `<PricingTable for="organization" />` only when org billing is configured in Dashboard + env flag. */
  const tablePayer: BillingPayer =
    showOrganizationBilling && billingPayer === 'organization' ? 'organization' : 'user';

  const billingHeroSub = !showOrganizationBilling
    ? t('billing_hero_user')
    : tablePayer === 'organization'
      ? t('billing_hero_organization')
      : t('billing_hero_user');

  const faqCredit = useMemo(
    () =>
      [
        { id: 'c1', question: t('faq_c1_q'), answer: t('faq_c1_a') },
        { id: 'c2', question: t('faq_c2_q'), answer: t('faq_c2_a') },
        { id: 'c3', question: t('faq_c3_q'), answer: t('faq_c3_a') },
      ] as const,
    [t],
  );

  const faqRegister = useMemo(
    () =>
      [
        { id: 'r1', question: t('faq_r1_q'), answer: t('faq_r1_a') },
        { id: 'r2', question: t('faq_r2_q'), answer: t('faq_r2_a') },
        { id: 'r3', question: t('faq_r3_q'), answer: t('faq_r3_a') },
      ] as const,
    [t],
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-page">
      <section className="relative bg-[#07060c] pt-10 pb-16 text-center sm:pt-14 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.25),transparent)]" />
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl md:text-5xl">
            {t('hero_title')}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-pretty text-white/60 sm:text-base">
            {t('hero_sub_clerk')}
          </p>
          {showOrganizationBilling ? (
            <div className="mx-auto mt-8 max-w-md">
              <SegmentedControl
                appearance="lightOnDark"
                value={billingPayer}
                onChange={(v) => setBillingPayer(v as BillingPayer)}
                options={[
                  { id: 'user', label: t('billing_tab_user') },
                  { id: 'organization', label: t('billing_tab_organization') },
                ]}
              />
            </div>
          ) : null}
          <p
            className={`mx-auto max-w-xl text-xs text-pretty text-white/50 sm:text-sm ${showOrganizationBilling ? 'mt-4' : 'mt-8'}`}
          >
            {billingHeroSub}
          </p>
        </div>
      </section>

      {/*
        Avoid `z-*` on this section: it creates a stacking context above siblings and can let
        plan cards paint over Clerk Billing’s checkout drawer when the drawer’s z-index is low.
      */}
      <section className="relative z-0 -mt-10 pb-16 sm:-mt-14 sm:pb-20">
        <div className="relative isolate z-0 mx-auto max-w-6xl px-4">
          <PricingTable
            key={tablePayer}
            appearance={clerkAppearance}
            checkoutProps={{ appearance: clerkAppearance }}
            for={tablePayer}
            newSubscriptionRedirectUrl={newSubscriptionRedirectUrl}
            fallback={
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-white/8 bg-surface/80 text-sm text-muted">
                {t('pricing_table_loading')}
              </div>
            }
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <Card.Root className="rounded-2xl border border-white/8 bg-white/4 p-6 sm:p-8">
          <Card.Header className="p-0 pb-3">
            <Card.Title className="text-lg font-bold text-foreground">{t('how_title')}</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <p className="text-sm leading-relaxed text-muted">{t('how_body')}</p>
          </Card.Content>
        </Card.Root>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="mb-2 text-2xl font-bold text-foreground">{t('faq_title')}</h2>
        <div className="mt-8 space-y-10">
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-brand-light uppercase">
              {t('faq_section_credit')}
            </p>
            <FaqAccordion items={[...faqCredit]} />
          </div>
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-brand-light uppercase">
              {t('faq_section_register')}
            </p>
            <FaqAccordion items={[...faqRegister]} />
          </div>
        </div>
      </section>
    </div>
  );
}
