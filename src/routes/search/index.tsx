import { component$, Resource } from "@builder.io/qwik";
import { useEndpoint, type DocumentHead } from "@builder.io/qwik-city";
import { Carousel } from "~/modules/Carousel/Carousel";
import type { inferPromise } from "~/services/types";
import { paths } from "~/utils/paths";

export const onGet = async () => {
  const { search } = await import("~/services/tmdb");
  return search({ page: 1, query: "popular" });
};

export default component$(() => {
  const resource = useEndpoint<inferPromise<typeof onGet>>();

  return (
    <div>
      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onRejected={() => <div>Rejected</div>}
        onResolved={(data) => (
          <Carousel
            media={data.results || []}
            title="Popular Movies"
            viewAllHref={paths.movieCategory("popular")}
          />
        )}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Search",
};
