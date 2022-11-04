import { component$, Resource } from "@builder.io/qwik";
import { Link, useEndpoint, type DocumentHead } from "@builder.io/qwik-city";
import { MediaCarousel } from "~/modules/MediaCarousel/MediaCarousel";
import { MovieHero } from "~/modules/MovieHero/MovieHero";
import { TvHero } from "~/modules/TvHero/TvHero";
import type { inferPromise, ProductionMedia } from "~/services/types";
import { getListItem } from "~/utils/format";
import { paths } from "~/utils/paths";

export const onGet = async () => {
  const {
    getTrendingTv,
    getTrendingMovie,
    getRandomMedia,
    getMovie,
    getTvShow,
  } = await import("~/services/tmdb");

  const [movies, tv] = await Promise.all([
    getTrendingMovie({ page: 1 }),
    getTrendingTv({ page: 1 }),
  ]);

  const random = getRandomMedia<ProductionMedia>({
    collections: [movies, tv],
  });

  const featuredTv =
    random.media_type === "tv" ? await getTvShow({ id: random.id }) : null;

  const featuredMovie =
    random.media_type === "movie" ? await getMovie({ id: random.id }) : null;

  return { featuredMovie, featuredTv, movies, tv };
};

export default component$(() => {
  const resource = useEndpoint<inferPromise<typeof onGet>>();

  return (
    <Resource
      value={resource}
      onPending={() => <div class="h-screen" />}
      onRejected={() => <div>Rejected</div>}
      onResolved={(data) => (
        <div class="flex flex-col gap-4">
          {data.featuredTv ? (
            <Link href={paths.media("tv", data.featuredTv.id)}>
              <TvHero media={data.featuredTv} />
            </Link>
          ) : null}
          {data.featuredMovie ? (
            <Link href={paths.media("movie", data.featuredMovie.id)}>
              <MovieHero media={data.featuredMovie} />
            </Link>
          ) : null}
          <MediaCarousel
            collection={data.movies?.results || []}
            title={getListItem({ query: "trending", type: "movie" })}
            viewAllHref={paths.movieCategory("trending")}
          />
          <MediaCarousel
            collection={data.tv?.results || []}
            title={getListItem({ query: "trending", type: "tv" })}
            viewAllHref={paths.tvCategory("trending")}
          />
        </div>
      )}
    />
  );
});

export const head: DocumentHead = {
  title: "Qwik City Movies",
};
