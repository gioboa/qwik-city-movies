import { component$, useSignal, useStore } from "@builder.io/qwik";
import { DocumentHead, loader$, useLocation } from "@builder.io/qwik-city";
import { z } from "zod";
import { MediaGrid } from "~/modules/MediaGrid/MediaGrid";
import { getMovies, getTrendingMovie } from "~/services/tmdb";
import type { ProductionMedia } from "~/services/types";
import { getListItem } from "~/utils/format";
import { paths } from "~/utils/paths";

export const useCategoryLoader = loader$(async (event) => {
  const parseResult = z
    .object({ name: z.string().min(1) })
    .safeParse(event.params);

  if (!parseResult.success) {
    throw event.redirect(302, paths.notFound);
  }

  try {
    const name = parseResult.data.name;
    const movies =
      name === "trending"
        ? await getTrendingMovie({ page: 1 })
        : await getMovies({ page: 1, query: name });
    return movies;
  } catch {
    throw event.redirect(302, paths.notFound);
  }
});

export default component$(() => {
  const location = useLocation();

  const containerRef = useSignal<Element | null>(null);

  const resource = useCategoryLoader();

  const store = useStore(
    {
      currentPage: 1,
      results: [] as ProductionMedia[],
    },
    { deep: true }
  );

  return (
    <div
      class="flex max-h-screen flex-col overflow-y-scroll"
      ref={(e) => (containerRef.value = e)}
    >
      <h1 class="px-8 pt-4 text-4xl">
        {getListItem({ query: location.params.name, type: "movie" })}
      </h1>
      <div>
        <MediaGrid
          collection={[...(resource.value.results || []), ...store.results]}
          currentPage={store.currentPage}
          pageCount={resource.value.total_pages || 1}
          parentContainer={containerRef.value}
          onMore$={async () => {
            const url = `${location.href}api?${new URLSearchParams({
              page: `${store.currentPage + 1}`,
            })}`;
            const json = await (await fetch(url)).json();
            const newMedia = json.results || [];
            store.results.push(...newMedia);
            store.currentPage += 1;
          }}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Qwik City Movies",
};
