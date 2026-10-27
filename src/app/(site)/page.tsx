import { DonateBand } from "@/components/home/DonateBand";
import { Hero } from "@/components/home/Hero";
import { Impact } from "@/components/home/Impact";
import { Partners } from "@/components/home/Partners";
import { Programmes } from "@/components/home/Programmes";
import { Stories } from "@/components/home/Stories";
import { Story } from "@/components/home/Story";
import { Ways } from "@/components/home/Ways";
import { impact, story, ways } from "@/content/site";
import { getHomeArticles, getProgrammes, getSettings } from "@/lib/content";

export default async function HomePage() {
  const [settings, programmes, articles] = await Promise.all([getSettings(), getProgrammes(), getHomeArticles()]);
  return (
    <>
      <Hero {...settings.hero} />
      <Impact title={impact.title} stats={settings.impact} />
      <Programmes items={programmes} />
      <Story {...story} />
      <Ways {...ways} />
      {articles.length ? <Stories items={articles} /> : null}
      <Partners />
      <DonateBand accounts={settings.bankAccounts} />
    </>
  );
}
