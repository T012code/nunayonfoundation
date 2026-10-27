import { DonateBand } from "@/components/home/DonateBand";
import { Hero } from "@/components/home/Hero";
import { Impact } from "@/components/home/Impact";
import { Partners } from "@/components/home/Partners";
import { Programmes } from "@/components/home/Programmes";
import { Stories } from "@/components/home/Stories";
import { Story } from "@/components/home/Story";
import { Ways } from "@/components/home/Ways";
import { getHomeArticles, getProgrammes, getSettings } from "@/lib/content";
import { getCopy } from "@/lib/copy";

export default async function HomePage() {
  const [settings, programmes, articles, copy] = await Promise.all([getSettings(), getProgrammes(), getHomeArticles(), getCopy("home")]);
  return (
    <>
      <Hero {...settings.hero} />
      <Impact title={copy.impact.title} stats={settings.impact} />
      <Programmes items={programmes} copy={copy.programmes} />
      <Story {...copy.story} />
      <Ways {...copy.ways} />
      {articles.length ? <Stories items={articles} copy={copy.stories} /> : null}
      <Partners title={copy.partners.title} />
      <DonateBand accounts={settings.bankAccounts} copy={copy.donate} />
    </>
  );
}
