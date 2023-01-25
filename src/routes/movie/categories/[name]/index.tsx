import { component$, useContext, useStore } from "@builder.io/qwik";
import {
  action$,
  DocumentHead,
  loader$,
  useLocation,
} from "@builder.io/qwik-city";
import { z } from "zod";
import { MediaGrid } from "~/modules/MediaGrid/MediaGrid";
import { ContainerContext } from "~/routes/context";
import { getMovies, getTrendingMovie } from "~/services/tmdb";
import type { ProductionMedia } from "~/services/types";
import { getListItem } from "~/utils/format";
import { paths } from "~/utils/paths";

export const getAction = action$(async (form, event) => {
  const parseResult = z
    .object({
      name: z.string().min(1),
      page: z.coerce.number().min(1).step(1),
    })
    .safeParse({
      ...event.params,
      page: form.get("page") || 1,
    });

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

export const getContent = loader$(async (event) => {
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

  const container = useContext(ContainerContext);

  const resource = getContent.use();
  const action = getAction.use();

  const store = useStore({
    currentPage: 1,
    results: [] as ProductionMedia[],
  });

  return (
    <div class="flex flex-col">
      <h1 class="px-8 pt-4 text-4xl">
        {getListItem({ query: location.params.name, type: "movie" })}
      </h1>
      <div>
        <MediaGrid
          collection={[...(resource.value.results || []), ...store.results]}
          currentPage={store.currentPage}
          pageCount={resource.value.total_pages || 1}
          parentContainer={container.value}
          onMore$={async () => {
            await action.execute({ page: `${store.currentPage + 1}` });
            const newMedia = action.value?.results || [];
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
