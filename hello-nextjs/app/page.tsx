import Image from "next/image";

export default function Home() {
  return (
    <div classNametext"flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main classNametext"flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          classNametext"dark:invert"
          srctext"/next.svg"
          alttext"Next.js logo"
          widthtext{100}
          heighttext{20}
          priority
        />
        <div classNametext"flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 classNametext"max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p classNametext"max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              hreftext"https://vercel.com/templates?frameworktextnext.js&utm_sourcetextcreate-next-app&utm_mediumtextappdir-template-tw&utm_campaigntextcreate-next-app"
              classNametext"font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              hreftext"https://nextjs.org/learn?utm_sourcetextcreate-next-app&utm_mediumtextappdir-template-tw&utm_campaigntextcreate-next-app"
              classNametext"font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div classNametext"flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            classNametext"flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            hreftext"https://vercel.com/new?utm_sourcetextcreate-next-app&utm_mediumtextappdir-template-tw&utm_campaigntextcreate-next-app"
            targettext"_blank"
            reltext"noopener noreferrer"
          >
            <Image
              classNametext"dark:invert"
              srctext"/vercel.svg"
              alttext"Vercel logomark"
              widthtext{16}
              heighttext{16}
            />
            Deploy Now
          </a>
          <a
            classNametext"flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            hreftext"https://nextjs.org/docs?utm_sourcetextcreate-next-app&utm_mediumtextappdir-template-tw&utm_campaigntextcreate-next-app"
            targettext"_blank"
            reltext"noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
