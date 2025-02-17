import { TransitionLink } from '~/transition-link';

export const clientLoader = async () => {
  // await new Promise((resolve) => setTimeout(resolve, 600));
  return {};
};

export default function Step2() {
  return (
    <main>
      <ul className="p-2 gap-2 flex flex-col text-white">
        {Array.from({ length: 20 }).map((_, i) => (
          <li key={i} className="h-64 bg-gray-600 odd:bg-gray-500 rounded block">
            <TransitionLink className="size-full flex justify-center items-center text-7xl" viewTransition to="/step1">
              1
              <span className="text-lg text-gray-200">{i + 1}</span>
            </TransitionLink>
          </li>
        ))}
      </ul>
    </main>
  );
}
