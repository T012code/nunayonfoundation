import { DonateBand } from "@/components/home/DonateBand";
import { Hero } from "@/components/home/Hero";
import { Impact } from "@/components/home/Impact";
import { Partners } from "@/components/home/Partners";
import { Programmes } from "@/components/home/Programmes";
import { Stories } from "@/components/home/Stories";
import { Story } from "@/components/home/Story";
import { Ways } from "@/components/home/Ways";
import { articles, bank, hero, impact, programmes, story, ways } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <Hero {...hero} />
      <Impact {...impact} />
      <Programmes items={programmes} />
      <Story {...story} />
      <Ways {...ways} />
      <Stories items={articles} />
      <Partners />
      <DonateBand accounts={bank.accounts} />
    </>
  );
}
