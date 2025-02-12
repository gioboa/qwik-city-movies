import { component$ } from "@builder.io/qwik";
import { paths } from "~/utils/paths";

export const Navbar = component$(() => {
  return (
    <nav class="bg-black px-6 py-8 text-black">
      <ul class="flex justify-around gap-10 md:w-10 md:flex-col md:justify-start">
        <li class="hover:opacity-80">
          <a href={paths.index}>
            <img
              src="/images/home.svg"
              width={24}
              height={24}
              alt="home"
              aria-label="Home"
            />
          </a>
        </li>
        <li class="hover:opacity-80">
          <a href={paths.movies}>
            <img
              src="/images/movie.svg"
              width={24}
              height={24}
              alt="movie"
              aria-label="Movies"
            />
          </a>
        </li>
        <li class="hover:opacity-80">
          <a href={paths.tv}>
            <img
              src="/images/tv.svg"
              width={24}
              height={24}
              alt="tv"
              aria-label="TV"
            />
          </a>
        </li>
        <li class="hover:opacity-80">
          <a href={paths.search}>
            <img
              src="/images/magnifier.svg"
              width={24}
              height={24}
              alt="search"
              aria-label="Search"
            />
          </a>
        </li>
      </ul>
    </nav>
  );
});
