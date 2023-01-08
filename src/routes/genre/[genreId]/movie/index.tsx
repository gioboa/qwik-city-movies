import { component$, useContext, useStore } from "@builder.io/qwik";
import { DocumentHead, loader$ } from "@builder.io/qwik-city";
import { z } from "zod";
import { MediaGrid } from "~/modules/MediaGrid/MediaGrid";
import { ContainerContext } from "~/routes/context";
import type { ProductionMedia } from "~/services/types";
import { paths } from "~/utils/paths";

export const getMovies = loader$(async (event) => {
  const parseResult = z
    .object({
      genreId: z.coerce.number().min(0).step(1),
      page: z.coerce.number().min(1).step(1),
    })
    .safeParse({
      genreId: event.params.genreId,
      page: event.url.searchParams.get("page") || 1,
    });

  if (!parseResult.success) {
    throw event.redirect(302, paths.notFound);
  }

  const { getMediaByGenre } = await import("~/services/tmdb");

  const movies = await getMediaByGenre({
    genre: parseResult.data.genreId,
    media: "movie",
    page: parseResult.data.page,
  });

  return movies;
});

export default component$(() => {
  // const location = useLocation();

  const container = useContext(ContainerContext);

  const movies = getMovies.use();

  // const fetcher$ = $(async (page: number): Promise<typeof onGet> => {
  //   const params = new URLSearchParams({ page: String(page) });
  //   const url = `${location.href}/api?${params}`;
  //   const response = await fetch(url);
  //   return response.json();
  // });

  const store = useStore({
    currentPage: 1,
    results: [] as ProductionMedia[],
  });

  return (
    <div class="flex flex-col">
      <h1 class="px-8 pt-4 text-4xl">{`Movie Genre: ${
        movies?.value.genre?.name || "Not defined"
      }`}</h1>
      <MediaGrid
        collection={[...(movies.value.results || []), ...store.results]}
        currentPage={store.currentPage}
        pageCount={movies.value?.total_pages || 1}
        parentContainer={container.value}
        onMore$={async () => {
          // const newResult = await fetcher$(store.currentPage + 1);
          // const newMedia = newResult.movies.results || [];
          // store.currentPage = newResult.movies.page || store.currentPage;
          // store.results = [...store.results, ...newMedia];
        }}
      />
    </div>
  );
});

export const head: DocumentHead = (event) => {
  const { genre } = event.getData(getMovies);
  return genre ? { title: `${genre.name} Tv Shows - Qwik City Movies` } : {};
};
